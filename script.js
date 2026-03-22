document.addEventListener('DOMContentLoaded', () => {
    // 0. Smooth Scroll (Lenis)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0, 0);
    } else {
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // 1. Loader & Thinking Cursor (GSAP QuickTo for performance)
    const loader = document.getElementById('loader');
    const thinkingCursor = document.getElementById('thinking-cursor');
    
    if (loader && thinkingCursor) {
        let cursorX = gsap.quickTo(thinkingCursor, 'left', {duration: 0.4, ease: 'power3.out'});
        let cursorY = gsap.quickTo(thinkingCursor, 'top', {duration: 0.4, ease: 'power3.out'});

        const moveCursor = (e) => {
            thinkingCursor.style.opacity = '1';
            cursorX(e.clientX + 20);
            cursorY(e.clientY + 20);
        };
        
        window.addEventListener('mousemove', moveCursor);
        
        // Hide loader after 2s
        setTimeout(() => {
            loader.classList.add('hidden');
            window.removeEventListener('mousemove', moveCursor);
            
            // Stagger hero elements intro gracefully
            gsap.fromTo('.hero-section .blur-reveal', 
                { opacity: 0, filter: 'blur(20px)', y: 60, scale: 0.95, rotationX: 10 },
                { opacity: 1, filter: 'blur(0px)', y: 0, scale: 1, rotationX: 0, duration: 1.4, ease: 'power3.out', stagger: 0.15 }
            );
        }, 2000);
    }

    // 2. Hero Interactive Parallax
    const heroSection = document.querySelector('.hero-section');
    const interactiveElements = document.querySelectorAll('.interactive-element');
    
    if (heroSection && interactiveElements.length > 0 && window.matchMedia("(pointer: fine)").matches) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;
            
            interactiveElements.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-speed')) || 0.05;
                const x = mouseX * speed;
                const y = mouseY * speed;
                
                // Adjust transform overrides based on specific element bases
                if (el.classList.contains('hg-input-card')) {
                    el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
                } else if (el.classList.contains('hg-center-pill')) {
                    el.style.transform = `translate(${x}px, ${y}px)`;
                } else {
                    el.style.transform = `translate(${x}px, ${y}px)`;
                }
            });
        });
        
        heroSection.addEventListener('mouseleave', () => {
            interactiveElements.forEach(el => {
                if (el.classList.contains('hg-input-card')) {
                    el.style.transform = `translate(-50%, -50%)`;
                } else if (el.classList.contains('hg-center-pill')) {
                    el.style.transform = `translate(0px, 0px)`;
                } else {
                    el.style.transform = `translate(0px, 0px)`;
                }
            });
        });
    }

    // 3. GSAP Scroll Reveal via Class Toggling
    if (typeof gsap !== 'undefined') {
        gsap.utils.toArray('.reveal-elem, .line-wrap, .blur-reveal:not(.hero-section .blur-reveal)').forEach(el => {
            ScrollTrigger.create({
                trigger: el,
                start: 'top bottom-=10px',
                toggleClass: 'is-visible',
                once: true
            });
        });
    }

    // 3. Magnetic Elements Effect
    const magneticElements = document.querySelectorAll('.magnetic');
    
    if (window.matchMedia("(pointer: fine)").matches) {
        magneticElements.forEach(elem => {
            elem.addEventListener('mousemove', (e) => {
                const rect = elem.getBoundingClientRect();
                const strength = elem.getAttribute('data-strength') || 20;
                
                // Calculate distance from center
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Apply transform
                elem.style.transform = `translate(${x / rect.width * strength}px, ${y / rect.height * strength}px)`;
            });
            
            elem.addEventListener('mouseleave', () => {
                // Reset transform with a smooth spring-like transition
                elem.style.transition = 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
                elem.style.transform = 'translate(0px, 0px)';
                
                // Remove transition after it completes to not interfere with mousemove
                setTimeout(() => {
                    elem.style.transition = '';
                }, 500);
            });
        });
    }

    // 4. Hero Mockup GSAP Parallax
    const heroMockup = document.getElementById('hero-mockup');
    if (heroMockup && typeof gsap !== 'undefined') {
        gsap.fromTo(heroMockup, 
            { scale: 0.85, y: 60, rotationX: 10, opacity: 0.6 },
            {
                scale: 1, y: 0, rotationX: 0, opacity: 1,
                ease: 'power1.out',
                scrollTrigger: {
                    trigger: '.hero-section',
                    start: 'top top',
                    end: 'bottom center',
                    scrub: 1
                }
            }
        );
    }

    // 5. Sticky Section Logic with ScrollTrigger
    const stepBlocks = gsap.utils.toArray('.step-block');
    const visualCards = document.querySelectorAll('.visual-card');

    if (stepBlocks.length > 0 && typeof gsap !== 'undefined') {
        const activateStep = (currentStep) => {
            stepBlocks.forEach(b => {
                if (parseInt(b.getAttribute('data-step')) === currentStep) b.classList.add('active');
                else b.classList.remove('active');
            });
            visualCards.forEach((card, i) => {
                const cardStep = i + 1;
                card.classList.remove('active', 'previous', 'next');
                if (cardStep === currentStep) card.classList.add('active');
                else if (cardStep < currentStep) card.classList.add('previous');
                else card.classList.add('next');
            });
            
            const wrapper = document.querySelector('.visual-sticky-wrapper');
            if (wrapper) {
                if (currentStep === 1 || currentStep === 3) {
                    wrapper.classList.remove('pos-left');
                    wrapper.classList.add('pos-right');
                } else if (currentStep === 2) {
                    wrapper.classList.remove('pos-right');
                    wrapper.classList.add('pos-left');
                }
            }
        };

        stepBlocks.forEach((block, index) => {
            ScrollTrigger.create({
                trigger: block,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => activateStep(index + 1),
                onEnterBack: () => activateStep(index + 1),
            });
        });

        const trackFill = document.querySelector('.scroll-track-fill');
        if (trackFill) {
            const length = trackFill.getTotalLength();
            gsap.set(trackFill, { strokeDasharray: length, strokeDashoffset: length });
            gsap.to(trackFill, {
                strokeDashoffset: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.sticky-text-content',
                    start: 'top 50%',
                    end: 'bottom 50%',
                    scrub: 1
                }
            });
        }
    }

    // 5.5 Bento Card Parallax using ScrollTrigger
    const bentoCards = gsap.utils.toArray('.bento-card');
    if (bentoCards.length > 0 && typeof gsap !== 'undefined') {
        bentoCards.forEach((card, index) => {
            const content = card.querySelector('.bento-content');
            const visual = card.querySelector('.bento-visual');
            const speed = 15 + (index % 3) * 10;
            
            if (content && visual) {
                gsap.fromTo(content, { y: -speed * 0.5 }, {
                    y: speed * 0.5, ease: 'none',
                    scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
                });
                gsap.fromTo(visual, { y: -speed * 0.8 }, {
                    y: speed * 0.8, ease: 'none',
                    scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
                });
            }
        });
    }

    // 6. Navbar Hide/Show and Scrolled State
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        if (scrollTop > 300) {
            if (scrollTop > lastScrollTop) {
                // Scrolling down
                navbar.classList.add('hidden');
            } else {
                // Scrolling up
                navbar.classList.remove('hidden');
            }
        } else {
            navbar.classList.remove('hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });

    // 7. Side Menu Toggle
    const menuOpenBtn = document.getElementById('menu-open-btn');
    const menuCloseBtn = document.getElementById('menu-close-btn');
    const sideMenu = document.getElementById('side-menu');
    const sideMenuBackdrop = document.getElementById('side-menu-backdrop');

    if (menuOpenBtn && menuCloseBtn && sideMenu && sideMenuBackdrop) {
        const openMenu = () => {
            sideMenu.classList.add('is-open');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        };

        const closeMenu = () => {
            sideMenu.classList.remove('is-open');
            document.body.style.overflow = '';
        };

        menuOpenBtn.addEventListener('click', openMenu);
        menuCloseBtn.addEventListener('click', closeMenu);
        sideMenuBackdrop.addEventListener('click', closeMenu);
    }

    // 8. Interactive Demo Logic (Polished GSAP)
    const demoInput = document.getElementById('demo-input');
    const demoBtn = document.getElementById('demo-btn');
    const demoPromptBox = document.querySelector('.demo-prompt-box');
    const demoNodesContainer = document.getElementById('demo-nodes-container');

    if (demoInput && demoBtn && demoPromptBox && demoNodesContainer && typeof gsap !== 'undefined') {
        const generateMindMap = () => {
            const topic = demoInput.value.trim() || 'Quantum Physics';
            
            // Set generating state
            demoPromptBox.classList.add('generating');
            
            // Clear existing nodes using GSAP
            gsap.to(demoNodesContainer.children, {
                opacity: 0, scale: 0.8, duration: 0.3, stagger: 0.05,
                onComplete: () => {
                    demoNodesContainer.innerHTML = '';
                    
                    // Create center node
                    const centerNode = document.createElement('div');
                    centerNode.className = 'demo-node center-node';
                    centerNode.style.left = '20%';
                    centerNode.style.top = '50%';
                    centerNode.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${topic} <span class="node-btn">&gt;</span>`;
                    demoNodesContainer.appendChild(centerNode);
                    
                    gsap.fromTo(centerNode, 
                        { opacity: 0, scale: 0.5, x: -20 },
                        { opacity: 1, scale: 1, x: 0, duration: 0.6, ease: 'back.out(1.5)', delay: 0.2 }
                    );
                    
                    const numNodes = Math.floor(Math.random() * 3) + 3; // 3 to 5 nodes
                    const children = [];
                    const genericTerms = ['Concepts', 'History', 'Applications', 'Theories', 'Key Figures', 'Impact', 'Methods', 'Examples', 'Principles'];
                    const shuffled = genericTerms.sort(() => 0.5 - Math.random());
                    
                    const startY = 50 - (numNodes * 15) / 2 + 7.5;
                    for (let i = 0; i < numNodes; i++) {
                        children.push({ text: shuffled[i], x: 60, y: startY + (i * 15) });
                    }
                    
                    // Create SVG container for edges
                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('class', 'demo-edge');
                    svg.setAttribute('width', '100%');
                    svg.setAttribute('height', '100%');
                    svg.setAttribute('viewBox', '0 0 100 100');
                    svg.setAttribute('preserveAspectRatio', 'none');
                    demoNodesContainer.appendChild(svg);
                    
                    const tl = gsap.timeline({ delay: 0.6 });
                    
                    children.forEach((child, index) => {
                        // Create edge
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        const startX = 20; const startY = 50;
                        const endX = 60; const endY = child.y;
                        const cp1x = startX + (endX - startX) / 2;
                        const cp1y = startY;
                        const cp2x = startX + (endX - startX) / 2;
                        const cp2y = endY;
                        
                        path.setAttribute('d', `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`);
                        svg.appendChild(path);
                        
                        // Native stroke dash animation
                        path.setAttribute('stroke-dasharray', '2000');
                        path.setAttribute('stroke-dashoffset', '2000');
                        gsap.set(path, { opacity: 1 });
                        tl.to(path, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, index * 0.15);
                        
                        // Create node
                        const node = document.createElement('div');
                        node.className = 'demo-node';
                        node.style.left = `${child.x}%`;
                        node.style.top = `${child.y}%`;
                        node.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> ${child.text} <span class="node-btn">&gt;</span>`;
                        demoNodesContainer.appendChild(node);
                        
                        tl.fromTo(node,
                            { opacity: 0, scale: 0.5, x: -20 },
                            { opacity: 1, scale: 1, x: 0, duration: 0.5, ease: 'back.out(1.5)' },
                            `-=${0.2}` // overlap with path drawing
                        );
                    });
                    
                    tl.add(() => {
                        demoPromptBox.classList.remove('generating');
                        demoInput.value = '';
                        demoInput.placeholder = 'Try another topic...';
                    });
                }
            });
        };

        demoBtn.addEventListener('click', generateMindMap);
        demoInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') generateMindMap();
        });
    }

    // 9. GSAP Draw Underline Logic
    if (typeof gsap !== 'undefined') {

        function initDrawRandomUnderline() {
            const svgVariants = [
                `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 20.9999C26.7762 16.2245 49.5532 11.5572 71.7979 14.6666C84.9553 16.5057 97.0392 21.8432 109.987 24.3888C116.413 25.6523 123.012 25.5143 129.042 22.6388C135.981 19.3303 142.586 15.1422 150.092 13.3333C156.799 11.7168 161.702 14.6225 167.887 16.8333C181.562 21.7212 194.975 22.6234 209.252 21.3888C224.678 20.0548 239.912 17.991 255.42 18.3055C272.027 18.6422 288.409 18.867 305 17.9999" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>`,
                `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 24.2592C26.233 20.2879 47.7083 16.9968 69.135 13.8421C98.0469 9.5853 128.407 4.02322 158.059 5.14674C172.583 5.69708 187.686 8.66104 201.598 11.9696C207.232 13.3093 215.437 14.9471 220.137 18.3619C224.401 21.4596 220.737 25.6575 217.184 27.6168C208.309 32.5097 197.199 34.281 186.698 34.8486C183.159 35.0399 147.197 36.2657 155.105 26.5837C158.11 22.9053 162.993 20.6229 167.764 18.7924C178.386 14.7164 190.115 12.1115 201.624 10.3984C218.367 7.90626 235.528 7.06127 252.521 7.49276C258.455 7.64343 264.389 7.92791 270.295 8.41825C280.321 9.25056 296 10.8932 305 13.0242" stroke="#E55050" stroke-width="10" stroke-linecap="round"/></svg>`,
                `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 29.5014C9.61174 24.4515 12.9521 17.9873 20.9532 17.5292C23.7742 17.3676 27.0987 17.7897 29.6575 19.0014C33.2644 20.7093 35.6481 24.0004 39.4178 25.5014C48.3911 29.0744 55.7503 25.7731 63.3048 21.0292C67.9902 18.0869 73.7668 16.1366 79.3721 17.8903C85.1682 19.7036 88.2173 26.2464 94.4121 27.2514C102.584 28.5771 107.023 25.5064 113.276 20.6125C119.927 15.4067 128.83 12.3333 137.249 15.0014C141.418 16.3225 143.116 18.7528 146.581 21.0014C149.621 22.9736 152.78 23.6197 156.284 24.2514C165.142 25.8479 172.315 17.5185 179.144 13.5014C184.459 10.3746 191.785 8.74853 195.868 14.5292C199.252 19.3205 205.597 22.9057 211.621 22.5014C215.553 22.2374 220.183 17.8356 222.979 15.5569C225.4 13.5845 227.457 11.1105 230.742 10.5292C232.718 10.1794 234.784 12.9691 236.164 14.0014C238.543 15.7801 240.717 18.4775 243.356 19.8903C249.488 23.1729 255.706 21.2551 261.079 18.0014C266.571 14.6754 270.439 11.5202 277.146 13.6125C280.725 14.7289 283.221 17.209 286.393 19.0014C292.321 22.3517 298.255 22.5014 305 22.5014" stroke="#E55050" stroke-width="10" stroke-linecap="round"/></svg>`,
                `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.0039 32.6826C32.2307 32.8412 47.4552 32.8277 62.676 32.8118C67.3044 32.807 96.546 33.0555 104.728 32.0775C113.615 31.0152 104.516 28.3028 102.022 27.2826C89.9573 22.3465 77.3751 19.0254 65.0451 15.0552C57.8987 12.7542 37.2813 8.49399 44.2314 6.10216C50.9667 3.78422 64.2873 5.81914 70.4249 5.96641C105.866 6.81677 141.306 7.58809 176.75 8.59886C217.874 9.77162 258.906 11.0553 300 14.4892" stroke="#E55050" stroke-width="10" stroke-linecap="round"/></svg>`,
                `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.99805 20.9998C65.6267 17.4649 126.268 13.845 187.208 12.8887C226.483 12.2723 265.751 13.2796 304.998 13.9998" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>`,
                `<svg width="310" height="40" viewBox="0 0 310 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 29.8857C52.3147 26.9322 99.4329 21.6611 146.503 17.1765C151.753 16.6763 157.115 15.9505 162.415 15.6551C163.28 15.6069 165.074 15.4123 164.383 16.4275C161.704 20.3627 157.134 23.7551 153.95 27.4983C153.209 28.3702 148.194 33.4751 150.669 34.6605C153.638 36.0819 163.621 32.6063 165.039 32.2029C178.55 28.3608 191.49 23.5968 204.869 19.5404C231.903 11.3436 259.347 5.83254 288.793 5.12258C294.094 4.99476 299.722 4.82265 305 5.45025" stroke="#E55050" stroke-width="10" stroke-linecap="round"/></svg>`
            ];

            function decorateSVG(svgEl) {
                svgEl.setAttribute('class', 'text-draw__box-svg');
                svgEl.setAttribute('preserveAspectRatio', 'none');
                svgEl.querySelectorAll('path').forEach(path => {
                    path.setAttribute('stroke', 'currentColor');
                });
            }

            let nextIndex = null;
            document.querySelectorAll('[data-draw-line]').forEach(container => {
                const box = container.querySelector('[data-draw-line-box]');
                if (!box) return;

                let enterTween = null;
                let leaveTween = null;

                container.addEventListener('mouseenter', () => {
                    if (enterTween && enterTween.isActive()) return;
                    if (leaveTween && leaveTween.isActive()) leaveTween.kill();

                    if (nextIndex === null) {
                        nextIndex = Math.floor(Math.random() * svgVariants.length);
                    }

                    box.innerHTML = svgVariants[nextIndex];
                    const svg = box.querySelector('svg');
                    if (svg) {
                        decorateSVG(svg);
                        const path = svg.querySelector('path');
                        if (path) {
                            const len = 350; // Hardcoded length bounds to avoid synchronous DOM parsing failures
                            gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
                            enterTween = gsap.to(path, {
                                duration: 0.5,
                                strokeDashoffset: 0,
                                ease: 'power2.inOut',
                                onComplete: () => { enterTween = null; }
                            });
                        }
                    }
                    nextIndex = (nextIndex + 1) % svgVariants.length;
                });

                container.addEventListener('mouseleave', () => {
                    const path = box.querySelector('path');
                    if (!path) return;

                    const len = 350;
                    const playOut = () => {
                        if (leaveTween && leaveTween.isActive()) return;
                        leaveTween = gsap.to(path, {
                            duration: 0.5,
                            strokeDashoffset: -len,
                            ease: 'power2.inOut',
                            onComplete: () => {
                                leaveTween = null;
                                box.innerHTML = ''; 
                            }
                        });
                    };

                    if (enterTween && enterTween.isActive()) {
                        enterTween.eventCallback('onComplete', playOut);
                    } else {
                        playOut();
                    }
                });
            });
        }
        initDrawRandomUnderline();
    }

    // 10. Pricing Toggle Logic
    const toggleYearly = document.getElementById('toggle-yearly');
    const toggleMonthly = document.getElementById('toggle-monthly');
    const priceValue = document.getElementById('price-value');

    if (toggleYearly && toggleMonthly && priceValue) {
        toggleYearly.addEventListener('click', () => {
            if (!toggleYearly.classList.contains('active-white')) {
                toggleYearly.classList.add('active-white');
                toggleMonthly.classList.remove('active-white');
                
                // Animate price change
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(priceValue, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3, onStart: () => priceValue.textContent = '9' });
                } else {
                    priceValue.textContent = '9';
                }
            }
        });

        toggleMonthly.addEventListener('click', () => {
            if (!toggleMonthly.classList.contains('active-white')) {
                toggleMonthly.classList.add('active-white');
                toggleYearly.classList.remove('active-white');
                
                // Animate price change
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(priceValue, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, onStart: () => priceValue.textContent = '12' });
                } else {
                    priceValue.textContent = '12';
                }
            }
        });
    }
    
    // 11. Deluxe Blend Section Animation
    const staggerLines = gsap.utils.toArray('.stagger-line');
    if (staggerLines.length > 0 && typeof gsap !== 'undefined') {
        ScrollTrigger.create({
            trigger: '.blend-content.has-stagger-text',
            start: 'top 85%',
            onEnter: () => {
                // Lines fade and slide up sequentially
                gsap.fromTo(staggerLines, 
                    { y: 60, opacity: 0, filter: 'blur(8px)' }, 
                    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, stagger: 0.18, ease: 'power3.out' }
                );
                
                // Icons pop slightly later matching line emergence
                const icons = gsap.utils.toArray('.has-stagger-text .blend-icon-wrap');
                gsap.fromTo(icons,
                    { scale: 0, rotation: -15, y: '-0.1em' },
                    { scale: 1, rotation: 0, y: '-0.1em', duration: 0.8, stagger: 0.22, ease: 'back.out(2)', delay: 0.3 }
                );
            },
            once: true
        });
    }

    // --- Interactive Stacked Cards Architecture ---
    const isoSteps = document.querySelectorAll('.iso-step');
    const stackedCards = Array.from(document.querySelectorAll('.stacked-card'));
    const stackedCardsContainer = document.querySelector('.stacked-cards-container');
    
    if (isoSteps.length > 0 && stackedCards.length > 0 && stackedCardsContainer) {
        
        // Entrance animation
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.fromTo('.stacked-cards-container', 
                { opacity: 0, x: 50 }, 
                { opacity: 1, x: 0, duration: 1.5, ease: "power3.out",
                  scrollTrigger: {
                      trigger: ".iso-layout",
                      start: "top 70%"
                  }
                }
            );
        }

        const activateLayer = (layerNum) => {
            const targetLayerInt = parseInt(layerNum);

            // Update Steps
            isoSteps.forEach(s => {
                if (parseInt(s.getAttribute('data-layer')) === targetLayerInt) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });

            // Update Cards using position array (0 is front, 1 is behind, etc.)
            // The active layer determines the front card. The rest shift behind it dynamically.
            const total = stackedCards.length;
            const activeIndex = targetLayerInt - 1;

            stackedCards.forEach((card, idx) => {
                // If active is 3 (Layer 4), we want 3 -> 0, 2 -> 1, 1 -> 2, 0 -> 3
                let pos = (activeIndex - idx + total) % total;
                card.setAttribute('data-pos', pos);
                
                if (pos === 0) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        };

        const deactivateLayers = () => {
            // reset to default (Layer 4 active)
            activateLayer(4);
        };

        isoSteps.forEach(step => {
            step.addEventListener('mouseenter', () => activateLayer(step.getAttribute('data-layer')));
        });
        
        stackedCards.forEach(card => {
            card.addEventListener('mouseenter', () => activateLayer(card.getAttribute('data-layer')));
        });

        const isoLayout = document.querySelector('.iso-layout');
        if (isoLayout) {
            isoLayout.addEventListener('mouseleave', deactivateLayers);
        }
        
        // Initialize default state
        activateLayer(4);
    }
});
