document.addEventListener('DOMContentLoaded', () => {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const resultContainer = document.getElementById('result-container');
    const previewContainer = document.getElementById('preview-container');
    const extractedText = document.getElementById('extracted-text');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const rtlToggle = document.getElementById('rtl-toggle');
    const btnCopy = document.getElementById('btn-copy');
    const btnDownload = document.getElementById('btn-download');

    let currentFile = null;

    // ═══════════════════════════════════════════
    //  PARTICLE BACKGROUND SYSTEM
    // ═══════════════════════════════════════════
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -500, y: -500 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.hue = Math.random() > 0.5 ? 260 : 200; // purple or blue
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse repulsion
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120;
                this.x += dx * force * 0.02;
                this.y += dy * force * 0.02;
            }

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Create particles (lower count for performance)
    for (let i = 0; i < 60; i++) {
        particles.push(new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(139, 92, 246, ${0.06 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ═══════════════════════════════════════════
    //  CURSOR GLOW EFFECT (desktop)
    // ═══════════════════════════════════════════
    const cursorGlow = document.getElementById('cursor-glow');
    let glowVisible = false;

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
        if (!glowVisible) {
            cursorGlow.classList.add('visible');
            glowVisible = true;
        }

        // Update upload zone radial hover gradient
        const rect = uploadZone.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width * 100);
        const y = ((e.clientY - rect.top) / rect.height * 100);
        uploadZone.style.setProperty('--mouse-x', x + '%');
        uploadZone.style.setProperty('--mouse-y', y + '%');
    });

    document.addEventListener('mouseleave', () => {
        cursorGlow.classList.remove('visible');
        glowVisible = false;
    });

    // ═══════════════════════════════════════════
    //  MAGNETIC BUTTON EFFECT
    // ═══════════════════════════════════════════
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // ═══════════════════════════════════════════
    //  GSAP ANIMATION ENGINE
    // ═══════════════════════════════════════════
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // --- Hero Entry Timeline ---
        const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });

        heroTl
            .to('[data-anim="split-text"]', {
                opacity: 1,
                y: 0,
                duration: 1.2,
                onStart: function () {
                    // Typewriter shimmer effect on title
                    const h1 = document.querySelector('h1');
                    h1.style.opacity = 1;
                }
            })
            .to('[data-anim="fade-up"]', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15
            }, "-=0.6")
            .to('.badge', {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "back.out(1.5)"
            }, "-=0.4")
            .to('[data-anim="scale-in"]', {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "back.out(1.2)"
            }, "-=0.3");

        // Set initial states for GSAP
        gsap.set('[data-anim="fade-up"]', { y: 30, opacity: 0 });
        gsap.set('[data-anim="split-text"]', { y: -20, opacity: 0 });
        gsap.set('.badge', { y: 20, opacity: 0 });
        gsap.set('[data-anim="scale-in"]', { scale: 0.9, opacity: 0 });

        // Replay the timeline
        heroTl.play();

        // --- Glass Card Parallax on Scroll ---
        gsap.utils.toArray('.glass-card').forEach((card) => {
            ScrollTrigger.create({
                trigger: card,
                start: "top bottom-=50",
                onEnter: () => {
                    gsap.to(card, {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                }
            });
        });

    }

    // ═══════════════════════════════════════════
    //  DRAG AND DROP HANDLING
    // ═══════════════════════════════════════════
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // --- File Input Handling ---
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // ═══════════════════════════════════════════
    //  CORE FILE HANDLER
    // ═══════════════════════════════════════════
    function handleFile(file) {
        currentFile = file;
        errorMessage.style.display = 'none';

        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            showError("Invalid file type. Please upload a JPG, PNG, WEBP, PDF, or DOCX.");
            return;
        }

        // Show preview
        previewContainer.innerHTML = '';
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = "Document Preview";
                previewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
            const url = URL.createObjectURL(file);
            const obj = document.createElement('object');
            obj.data = url;
            obj.type = 'application/pdf';
            obj.width = '100%';
            obj.height = '100%';
            previewContainer.appendChild(obj);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:1rem;color:var(--text-secondary);';
            placeholder.innerHTML = `
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span style="font-size:1.2rem;font-weight:500;color:var(--text-primary);">${file.name}</span>
                <span>Word Document</span>
            `;
            previewContainer.appendChild(placeholder);
        }

        // Send to backend
        processOCR(file);
    }

    // ═══════════════════════════════════════════
    //  API CALL
    // ═══════════════════════════════════════════
    async function processOCR(file) {
        showLoader(true);
        resultContainer.classList.remove('show');
        extractedText.value = '';

        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiUrl = '/api/ocr';

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to process document');
            }

            extractedText.value = data.text;

            // Auto-detect RTL if containing Arabic/Urdu/Farsi characters
            const rtlRegex = /[\u0600-\u06FF\u0750-\u077F]/;
            if (rtlRegex.test(data.text)) {
                rtlToggle.checked = true;
                extractedText.classList.add('rtl');
            } else {
                rtlToggle.checked = false;
                extractedText.classList.remove('rtl');
            }

            resultContainer.classList.add('show');

            // Animate results panels with GSAP
            if (typeof gsap !== 'undefined') {
                const panels = resultContainer.querySelectorAll('.panel');
                gsap.fromTo(panels[0],
                    { x: -60, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
                );
                gsap.fromTo(panels[1],
                    { x: 60, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: "power3.out" }
                );
            }

            // Smooth scroll to results
            setTimeout(() => {
                resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);

        } catch (error) {
            console.error("OCR Error:", error);
            showError("Error: " + error.message);
        } finally {
            showLoader(false);
        }
    }

    // ═══════════════════════════════════════════
    //  UI HELPERS
    // ═══════════════════════════════════════════
    function showLoader(show) {
        if (show) {
            loader.classList.add('active');
        } else {
            loader.classList.remove('active');
        }
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.display = 'block';
        // Shake animation
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(errorMessage,
                { x: -10 },
                { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
            );
        }
    }

    // ═══════════════════════════════════════════
    //  CONTROLS
    // ═══════════════════════════════════════════
    rtlToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            extractedText.classList.add('rtl');
        } else {
            extractedText.classList.remove('rtl');
        }
    });

    btnCopy.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(extractedText.value);
            const originalText = btnCopy.innerHTML;
            btnCopy.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
            // Success flash
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(btnCopy, { scale: 1.1 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
            }
            setTimeout(() => {
                btnCopy.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            alert('Failed to copy text');
        }
    });

    btnDownload.addEventListener('click', () => {
        if (!extractedText.value) return;

        const blob = new Blob([extractedText.value], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        const originalName = currentFile ? currentFile.name.split('.')[0] : 'document';
        a.href = url;
        a.download = `OCR_Result_${originalName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
