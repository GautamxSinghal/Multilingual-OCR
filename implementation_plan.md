# Multilingual OCR Web Application (Hindi, English, Urdu, Farsi)

This plan outlines the architecture, layout, and implementation steps to build a high-fidelity Multilingual OCR Web Application. The application will accept images and document uploads (PDFs), accurately transcribe text in **Hindi, English, Urdu, and Farsi**, show a side-by-side comparison, support LTR/RTL text directions, and allow downloading the result as a `.txt` file.

---

## Architecture Recommendation

For a solid-proof, cost-effective, and highly accurate demo that can be hosted on the internet for free or low cost, we recommend the **Cloud-Based Multimodal LLM (Gemini API) Architecture**.

Here is a comparison of the two requested approaches:

| Feature | Cloud MLLM (Gemini API) — **Recommended** | Local MLLM (e.g., Qwen2-VL-2B) |
| :--- | :--- | :--- |
| **Accuracy (Hindi/Urdu/Farsi)** | **Extremely High**. Trained on massive web-scale multilingual datasets. Handles handwriting and low-quality documents. | **Medium-High**. Requires a larger model (e.g., 7B) for high accuracy, which is very resource-intensive. |
| **Hosting Cost** | **$0** (Free Tier via Google AI Studio). No GPU required on the web server. | **High** ($30-$100+/mo). Requires a GPU-enabled cloud server (e.g., RunPod, AWS EC2 GPU). |
| **Performance** | Fast response times (<5s for image processing). | Slow on CPU (30s+); fast only on GPU. |
| **Deployment Complexity** | Low. Can be hosted on free-tier platforms like Render, Vercel, or Hugging Face. | High. Must deploy and manage a model server with PyTorch, CUDA, and Hugging Face. |

### Proposed Tech Stack
1. **Frontend**: React (Vite) + Vanilla CSS (Premium Dark Mode with Glassmorphism, Neon Accents, and Smooth Transitions).
2. **Backend**: Python (FastAPI) + `google-genai` SDK + `PyMuPDF` (for PDF rendering).
3. **OCR Engine**: Gemini 2.0 Flash / 1.5 Flash (via free API Key).

---

## User Review Required

> [!IMPORTANT]
> **API Key Setup**: To use the Gemini API, you will need a free API key from [Google AI Studio](https://aistudio.google.com/). We will configure the backend to read this key from an environment variable (`GEMINI_API_KEY`).
> 
> **Alternative (Local OCR fallback)**: If you absolutely require a local offline fallback, we can include a basic integration with PyTesseract/EasyOCR or a lightweight Hugging Face model, but please note that their accuracy for Urdu and Farsi is significantly lower than Gemini.

---

## Open Questions

> [!NOTE]
> 1. **Hosting Platform**: Where do you plan to host the demo? (e.g., Hugging Face Spaces, Render, Vercel, etc.)
> 2. **Multi-page PDFs**: Should the application transcribe all pages of a PDF and concatenate them into a single `.txt` file? (We assume yes, and will render pages to images for processing).

---

## Proposed Changes

We will create a fresh project layout in the workspace `d:\OCR`:
```
d:/OCR/
├── backend/
│   ├── main.py          # FastAPI application & Gemini API integration
│   ├── requirements.txt # Python dependencies (fastapi, uvicorn, google-genai, fitz, etc.)
│   └── .env.example     # Environment template
└── frontend/            # React + Vite frontend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── App.css      # Premium styling system
    │   └── components/
    │       ├── Header.jsx
    │       ├── UploadZone.jsx
    │       ├── ResultPanel.jsx
    │       └── Loader.jsx
```

### Backend Component

#### [NEW] [main.py](file:///d:/OCR/backend/main.py)
A FastAPI server that:
- Receives uploaded image/PDF files.
- Converts PDF pages into images using `fitz` (PyMuPDF).
- Sends the image bytes to Google's Gemini API with an OCR-specific system prompt to extract raw text (retaining Hindi, English, Urdu, Farsi layouts).
- Returns the text and supports exporting a `.txt` file directly.

#### [NEW] [requirements.txt](file:///d:/OCR/backend/requirements.txt)
Required python packages:
- `fastapi`
- `uvicorn`
- `google-genai`
- `pymupdf`
- `python-multipart`
- `python-dotenv`

---

### Frontend Component

#### [NEW] [App.css](file:///d:/OCR/frontend/src/App.css)
A premium Vanilla CSS stylesheet implementing:
- Modern glassmorphic cards (`backdrop-filter: blur()`).
- Dark-mode responsive UI with glowing purple/cyan accents.
- Inter / Outfit Google typography.
- Smooth animations for drag & drop file hovers and loading indicators.

#### [NEW] [UploadZone.jsx](file:///d:/OCR/frontend/src/components/UploadZone.jsx)
A responsive drag-and-drop file upload zone supporting images (PNG, JPG, WEBP) and documents (PDF).

#### [NEW] [ResultPanel.jsx](file:///d:/OCR/frontend/src/components/ResultPanel.jsx)
A side-by-side split screen showing:
- Left: The uploaded document/image preview.
- Right: The extracted OCR text, with:
  - Auto-detected LTR/RTL alignment toggle.
  - "Copy to Clipboard" button.
  - "Download as TXT" button.
  - Language badges (English, Hindi, Urdu, Farsi).

---

## Verification Plan

### Automated Tests
We will verify endpoints and file processing using python script tests:
- `python backend/test_ocr.py` (Mock upload and OCR verification).

### Manual Verification
1. Launch FastAPI backend: `uvicorn backend.main:app --reload`
2. Launch Vite frontend: `npm run dev`
3. Upload test documents containing:
   - Hindi text (Devanagari script)
   - English text
   - Urdu text (Nastaliq script)
   - Farsi text (Naskh/Nastaliq script)
4. Verify layout, download `.txt` output, and check RTL alignment behavior.
