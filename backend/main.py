import os
import io
import fitz  # PyMuPDF
import docx  # python-docx
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from PIL import Image
from google import genai

# Load environment variables
load_dotenv()

app = FastAPI(title="Multilingual OCR API")

# Mount frontend directory for static HTML/JS/CSS
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
os.makedirs(frontend_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")


# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    index_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "index.html")
    return FileResponse(index_path)

def extract_images_from_pdf(pdf_bytes):
    """Convert all pages of PDF to PIL Images"""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    if doc.page_count == 0:
        raise ValueError("PDF has no pages")
        
    images = []
    # Limit to 20 pages to avoid hitting payload size limits
    max_pages = min(doc.page_count, 20)
    for i in range(max_pages):
        page = doc.load_page(i)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # increase resolution
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        images.append(img)
    return images

@app.post("/api/ocr")
async def process_ocr(file: UploadFile = File(...)):
    """
    Endpoint to receive an image or PDF file, perform Multilingual OCR via Gemini API,
    and return the extracted text.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(status_code=500, detail="Gemini API key is not configured.")
        
    try:
        content = await file.read()
        
        is_docx = file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
        # Handle PDF vs Image vs DOCX
        extracted_text = None
        images = []
        if file.content_type == "application/pdf":
            try:
                images = extract_images_from_pdf(content)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to process PDF: {str(e)}")
        elif is_docx:
            try:
                doc = docx.Document(io.BytesIO(content))
                extracted_text = '\n'.join([para.text for para in doc.paragraphs])
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to process DOCX: {str(e)}")
        else:
            try:
                img = Image.open(io.BytesIO(content)).convert('RGB')
                images = [img]
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to process Image: {str(e)}")
                
        # Call Gemini API
        client = genai.Client(api_key=api_key)
        
        if is_docx:
            prompt = (
                "Here is the extracted text from a Word document. "
                "Please normalize it, preserving its original layout, lines, and formatting "
                "for Hindi, English, Urdu, and Farsi. Output only the final raw text exactly as it appears. "
                f"\n\nDocument Text:\n{extracted_text}"
            )
            request_contents = [prompt]
        else:
            prompt = (
                "Perform highly accurate OCR on this document. "
                "Extract all text exactly as it appears, preserving the original structure and lines. "
                "The document may contain Hindi (Devanagari script), English, Urdu (Perso-Arabic script), "
                "and Farsi. Pay special attention to correctly recognizing Nastaliq and Naskh scripts, "
                "as well as Devanagari. Output only the extracted raw text without any formatting "
                "or conversational additions. Do not translate the text, just transcribe it exactly."
            )
            request_contents = images + [prompt]
        
        # Note: We use gemma-4-31b-it as requested
        response = client.models.generate_content(
            model='gemma-4-31b-it',
            contents=request_contents
        )
        
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "text": response.text
        }
        
    except Exception as e:
        print(f"Error during OCR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR Processing failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
