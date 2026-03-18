/* ====================================================
   LawWise Nyai AI — JavaScript
   Modern Obsidian Design System
   Nav, typing effect, scroll reveal, smooth scroll
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- NAVBAR ----------
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 100);
        });
    }

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('open');
        });

        // Close mobile menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    }

    // ---------- SCROLL REVEAL ----------
    const revealEls = document.querySelectorAll('.anim-reveal');
    if (revealEls.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Stagger animations within same parent
                    const siblings = Array.from(entry.target.parentElement.querySelectorAll('.anim-reveal'));
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.transitionDelay = `${index * 0.08}s`;
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => revealObserver.observe(el));
    }

    // ---------- TYPING EFFECT ----------
    const typedText = document.getElementById('typedText');
    if (typedText) {
        const phrases = [
            'Find relevant precedents for Section 498A IPC...',
            'Draft a bail application for Bombay High Court...',
            'Summarize SC judgment on Right to Privacy...',
            'Analyse winning patterns in NCLT insolvency cases...'
        ];

        let phraseIdx = 0;
        let charIdx = 0;
        let isDeleting = false;

        function typeLoop() {
            const currentPhrase = phrases[phraseIdx];

            if (!isDeleting) {
                typedText.textContent = currentPhrase.substring(0, charIdx + 1);
                charIdx++;
                if (charIdx === currentPhrase.length) {
                    isDeleting = true;
                    setTimeout(typeLoop, 2200);
                    return;
                }
                setTimeout(typeLoop, 50 + Math.random() * 30);
            } else {
                typedText.textContent = currentPhrase.substring(0, charIdx - 1);
                charIdx--;
                if (charIdx === 0) {
                    isDeleting = false;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                    setTimeout(typeLoop, 400);
                    return;
                }
                setTimeout(typeLoop, 25);
            }
        }

        typeLoop();
    }

    // ---------- ROLODEX WORD ANIMATION ----------
    const rolodexContainer = document.getElementById('rolodexContainer');
    if (rolodexContainer) {
        const words = rolodexContainer.querySelectorAll('.rolodex-word');
        let currentIndex = 0;
        let rolodexInterval;

        function cycleRolodex() {
            const currentWord = words[currentIndex];
            const nextIndex = (currentIndex + 1) % words.length;
            const nextWord = words[nextIndex];

            // Exit current word (rotate backward)
            currentWord.classList.remove('active');
            currentWord.classList.add('exit');

            // Prepare next word (jump to bottom position without transition)
            nextWord.classList.remove('exit');
            nextWord.classList.add('enter');

            // Force reflow so the 'enter' position is applied immediately
            void nextWord.offsetHeight;

            // Bring next word in (transition to active)
            requestAnimationFrame(() => {
                nextWord.classList.remove('enter');
                nextWord.classList.add('active');
            });

            // Clean up exit class after transition
            setTimeout(() => {
                currentWord.classList.remove('exit');
            }, 250);

            currentIndex = nextIndex;
        }

        // Start interval
        function startRolodex() {
            if (!rolodexInterval) {
                rolodexInterval = setInterval(cycleRolodex, 1000);
            }
        }

        // Stop interval
        function stopRolodex() {
            if (rolodexInterval) {
                clearInterval(rolodexInterval);
                rolodexInterval = null;
            }
        }

        startRolodex();

        // Pause animation when tab is inactive to prevent CSS transition desync/overlap
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stopRolodex();
            } else {
                startRolodex();
            }
        });
    }

    // ---------- SMOOTH SCROLL ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const offset = navbar ? navbar.offsetHeight : 80;
                const y = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });

    // ---------- CONTACT FORM ----------
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            contactForm.style.display = 'none';
            const success = document.getElementById('contactSuccess');
            if (success) success.style.display = 'block';
        });
    }

    // ---------- APPLY FORM ----------
    const applyForm = document.getElementById('applyForm');
    if (applyForm) {
        applyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = applyForm.querySelector('button[type="submit"]');
            const submitText = submitBtn.querySelector('.btn-text');
            const originalText = submitText ? submitText.textContent : 'Submit Application';

            submitBtn.disabled = true;
            if (submitText) submitText.textContent = 'Submitting...';

            try {
                const formData = new FormData(applyForm);
                
<<<<<<< HEAD
                // Adjust this URL in production
                const response = await fetch('http://localhost:3000/api/apply', {
=======
                // Point directly to the Vercel serverless function
                const response = await fetch('/api/apply', {
>>>>>>> 6689b28183bf7ba867cfec5761e40bc01c40e977
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    applyForm.style.display = 'none';
                    const success = document.getElementById('applySuccess');
                    if (success) success.style.display = 'block';
                } else {
                    alert('Error: ' + (result.error || 'Failed to submit application.'));
                    submitBtn.disabled = false;
                    if (submitText) submitText.textContent = originalText;
                }
            } catch (err) {
                console.error('Submission error:', err);
                alert('An error occurred while submitting your application. Please ensure the backend server is running.');
                submitBtn.disabled = false;
                if (submitText) submitText.textContent = originalText;
            }
        });
    }

    // ---------- FILE UPLOAD (Apply page) ----------
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('resumeFile');
    const fileName = document.getElementById('fileName');

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                updateFileName(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                updateFileName(fileInput.files[0]);
            }
        });

        function updateFileName(file) {
            if (fileName) {
                const sizeKB = (file.size / 1024).toFixed(1);
                fileName.textContent = `${file.name} (${sizeKB} KB)`;
                fileName.style.display = 'block';
            }
        }
    }

    // ---------- ANIMATED STEPPER ----------
    const stepperEl = document.getElementById('hiwStepper');
    if (stepperEl) {
        const totalSteps = 3;
        let currentStep = 1;

        const indicators = stepperEl.querySelectorAll('.stepper-indicator');
        const connectors = stepperEl.querySelectorAll('.stepper-connector');
        const panels = stepperEl.querySelectorAll('.stepper-panel');
        const viewport = stepperEl.querySelector('.stepper-viewport');
        const btnBack = document.getElementById('stepperBack');
        const btnNext = document.getElementById('stepperNext');

        function setViewportHeight() {
            const activePanel = stepperEl.querySelector('.stepper-panel.active');
            if (activePanel && viewport) {
                viewport.style.height = activePanel.offsetHeight + 'px';
            }
        }

        function updateIndicators() {
            indicators.forEach(ind => {
                const step = parseInt(ind.dataset.step);
                ind.classList.remove('active', 'complete');
                if (step === currentStep) ind.classList.add('active');
                else if (step < currentStep) ind.classList.add('complete');
            });

            connectors.forEach(conn => {
                const afterStep = parseInt(conn.dataset.after);
                if (afterStep < currentStep) {
                    conn.classList.add('filled');
                } else {
                    conn.classList.remove('filled');
                }
            });
        }

        function updateButtons() {
            if (currentStep === 1) {
                btnBack.style.opacity = '0';
                btnBack.style.pointerEvents = 'none';
            } else {
                btnBack.style.opacity = '1';
                btnBack.style.pointerEvents = 'auto';
            }
            btnNext.textContent = currentStep === totalSteps ? 'Complete' : 'Continue';
        }

        function goToStep(target, direction) {
            if (target < 1 || target > totalSteps || target === currentStep) return;

            const currentPanel = stepperEl.querySelector('.stepper-panel.active');
            const targetPanel = stepperEl.querySelector(`.stepper-panel[data-panel="${target}"]`);
            if (!currentPanel || !targetPanel) return;

            // Exit animation on current
            const exitClass = direction > 0 ? 'slide-out-left' : 'slide-out-right';
            const enterClass = direction > 0 ? 'slide-in-right' : 'slide-in-left';

            currentPanel.classList.remove('active');
            currentPanel.classList.add(exitClass);

            // After exit animation ends, hide the old panel
            const exitDuration = 250;
            setTimeout(() => {
                currentPanel.classList.remove(exitClass);
            }, exitDuration);

            // Slight delay before entering new panel
            setTimeout(() => {
                targetPanel.classList.add('active', enterClass);
                currentStep = target;
                updateIndicators();
                updateButtons();
                setViewportHeight();

                // Clean up enter animation class
                setTimeout(() => {
                    targetPanel.classList.remove(enterClass);
                }, 350);
            }, exitDuration - 50);
        }

        // Button handlers
        btnNext.addEventListener('click', () => {
            if (currentStep === totalSteps) {
                // Complete — briefly show done, then reset
                btnNext.textContent = '✓ Done';
                btnNext.style.pointerEvents = 'none';
                indicators.forEach(ind => ind.classList.add('complete'));
                connectors.forEach(conn => conn.classList.add('filled'));
                setTimeout(() => {
                    // Reset to step 1
                    panels.forEach(p => {
                        p.classList.remove('active', 'slide-in-right', 'slide-in-left', 'slide-out-left', 'slide-out-right');
                    });
                    currentStep = 1;
                    panels[0].classList.add('active');
                    updateIndicators();
                    updateButtons();
                    setViewportHeight();
                    btnNext.style.pointerEvents = 'auto';
                }, 1200);
                return;
            }
            goToStep(currentStep + 1, 1);
        });

        btnBack.addEventListener('click', () => {
            goToStep(currentStep - 1, -1);
        });

        // Click-to-jump on indicators
        indicators.forEach(ind => {
            ind.addEventListener('click', () => {
                const target = parseInt(ind.dataset.step);
                if (target !== currentStep) {
                    goToStep(target, target > currentStep ? 1 : -1);
                }
            });
        });

        // Initial setup
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
    }

    // ---------- TILT CARD & TOOLTIP EFFECT ----------
    const tiltCards = document.querySelectorAll('.tilt-card');
    if (tiltCards.length > 0) {
        // Create single global tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tilt-tooltip';
        document.body.appendChild(tooltip);

        let tooltipTargetX = 0;
        let tooltipTargetY = 0;
        let tooltipCurrentX = 0;
        let tooltipCurrentY = 0;
        let tooltipTargetOpacity = 0;
        let tooltipCurrentOpacity = 0;
        let tooltipTargetRotate = 0;
        let tooltipCurrentRotate = 0;
        let tooltipAnimating = false;
        let tooltipLastY = 0;

        function updateTooltip() {
            tooltipCurrentX += (tooltipTargetX - tooltipCurrentX) * 0.2;
            tooltipCurrentY += (tooltipTargetY - tooltipCurrentY) * 0.2;
            tooltipCurrentOpacity += (tooltipTargetOpacity - tooltipCurrentOpacity) * 0.15;
            tooltipCurrentRotate += (tooltipTargetRotate - tooltipCurrentRotate) * 0.15;

            // Using fixed positioning and Viewport coordinates
            tooltip.style.transform = `translate(${tooltipCurrentX}px, ${tooltipCurrentY}px) rotate(${tooltipCurrentRotate}deg)`;
            tooltip.style.opacity = tooltipCurrentOpacity;

            if (Math.abs(tooltipTargetOpacity - tooltipCurrentOpacity) < 0.01 && tooltipTargetOpacity === 0) {
                tooltip.style.opacity = '0';
                tooltipAnimating = false;
                return;
            }

            if (tooltipAnimating) {
                requestAnimationFrame(updateTooltip);
            }
        }

        document.addEventListener('mousemove', (e) => {
            const velocityY = e.clientY - tooltipLastY;
            tooltipTargetRotate = -velocityY * 0.6; 
            tooltipLastY = e.clientY;
        });

        tiltCards.forEach(card => {
            let targetRotateX = 0;
            let targetRotateY = 0;
            let currentRotateX = 0;
            let currentRotateY = 0;
            let targetScale = 1;
            let currentScale = 1;

            let isHovered = false;
            let isAnimating = false;
            const rotateAmplitude = 12;

            function updateTilt() {
                currentRotateX += (targetRotateX - currentRotateX) * 0.12;
                currentRotateY += (targetRotateY - currentRotateY) * 0.12;
                currentScale += (targetScale - currentScale) * 0.15;

                const diff = Math.abs(targetRotateX - currentRotateX) + 
                             Math.abs(targetRotateY - currentRotateY) + 
                             Math.abs(targetScale - currentScale);

                if (diff < 0.005 && !isHovered && targetScale === 1) {
                    currentRotateX = targetRotateX;
                    currentRotateY = targetRotateY;
                    currentScale = targetScale;
                    card.style.transform = '';
                    // Restore original CSS transition when returning to rest 
                    card.style.transition = '';
                    isAnimating = false;
                    return;
                }

                card.style.transform = `perspective(1000px) scale(${currentScale}) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
                
                if (isAnimating) {
                    requestAnimationFrame(updateTilt);
                }
            }

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                
                // Tilt logic
                const offsetX = e.clientX - rect.left - rect.width / 2;
                const offsetY = e.clientY - rect.top - rect.height / 2;

                targetRotateX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
                targetRotateY = (offsetX / (rect.width / 2)) * rotateAmplitude;
                targetScale = 1.02;

                if (!isAnimating) {
                    isAnimating = true;
                    requestAnimationFrame(updateTilt);
                }

                // Tooltip logic
                tooltipTargetX = e.clientX + 15;
                tooltipTargetY = e.clientY + 15;
                if (!tooltipAnimating) {
                    tooltipAnimating = true;
                    requestAnimationFrame(updateTooltip);
                }
            });

            card.addEventListener('mouseenter', (e) => {
                isHovered = true;
                targetScale = 1.02;

                // CRITICAL FIX: Override the .anim-reveal CSS transition so it doesn't fight JS loop
                card.style.transition = 'box-shadow 0.4s ease-out, border-color 0.4s ease-out, background 0.4s ease-out';

                if (!isAnimating) {
                    isAnimating = true;
                    requestAnimationFrame(updateTilt);
                }

                const caption = card.getAttribute('data-caption');
                if (caption) {
                    tooltip.textContent = caption;
                    
                    // Snap tooltip to initial position if it's currently invisible
                    if (tooltipTargetOpacity === 0) {
                        tooltipCurrentX = e.clientX + 15;
                        tooltipCurrentY = e.clientY + 15;
                    }
                    
                    tooltipTargetX = e.clientX + 15;
                    tooltipTargetY = e.clientY + 15;
                    tooltipTargetOpacity = 1;

                    if (!tooltipAnimating) {
                        tooltipAnimating = true;
                        requestAnimationFrame(updateTooltip);
                    }
                }
            });

            card.addEventListener('mouseleave', () => {
                isHovered = false;
                targetRotateX = 0;
                targetRotateY = 0;
                targetScale = 1;
                
                if (!isAnimating) {
                    isAnimating = true;
                    requestAnimationFrame(updateTilt);
                }

                tooltipTargetOpacity = 0;
                tooltipTargetRotate = 0;
                if (!tooltipAnimating) {
                    tooltipAnimating = true;
                    requestAnimationFrame(updateTooltip);
                }
            });
        });
    }
});
