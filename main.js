document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const isSmallScreen = window.__IS_MOBILE__ || window.matchMedia('(max-width: 767px)').matches;

    if (typeof window.applyLang === 'function') {
        window.applyLang(window.getLang());
    }
    document.querySelectorAll('#langToggle [data-lang]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (typeof window.applyLang === 'function') window.applyLang(btn.getAttribute('data-lang'));
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        });
    });

    // The project reels are several MB each — respect metered / slow connections.
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = !!connection && (connection.saveData === true ||
        /(^|-)(2g|slow-2g|3g)$/.test(connection.effectiveType || ''));

    // 0. Smooth Scroll (Lenis) — desktop only. On phones the extra RAF loop
    // plus a 1.25s tween is what made the tab bar feel a beat behind the tap.
    let lenis = null;
    if (!isSmallScreen && typeof Lenis === 'function') {
        lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }
    window.__lenis = lenis;

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const keepContactLanding = () =>
        window.location.hash === '#contact' &&
        new URLSearchParams(window.location.search).get('mail') === 'sent';

    const forceStartAtTop = (immediate = true) => {
        if (keepContactLanding()) return;
        if (window.location.hash && window.location.hash !== '#home') {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        if (lenis && typeof lenis.scrollTo === 'function') {
            lenis.scrollTo(0, { immediate });
        }
    };

    forceStartAtTop(true);
    window.addEventListener('pageshow', () => forceStartAtTop(true));

    const scrollToSection = (target, opts = {}) => {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;
        if (isSmallScreen || opts.instant) {
            const top = el.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top, behavior: opts.instant === false ? 'smooth' : 'auto' });
            return;
        }
        if (lenis && typeof lenis.scrollTo === 'function') {
            lenis.scrollTo(el, { offset: 0, duration: 1.25 });
        } else {
            gsap.to(window, {
                duration: 1.25,
                scrollTo: { y: el, autoKill: false },
                ease: 'power3.inOut'
            });
        }
    };

    // 1. Initial State & Loader
    const loader = document.querySelector('#loader');
    const loaderCounter = document.querySelector('#loaderCounter');
    
    let count = { val: 3 };
    const tlLoader = gsap.timeline({
        onComplete: () => {
            loader.style.pointerEvents = 'none';
            gsap.to(loader, {
                yPercent: -100,
                duration: isSmallScreen ? 0.45 : 0.9,
                ease: "expo.inOut",
                onComplete: () => {
                    loader.style.display = 'none';
                    forceStartAtTop(true);
                    initMainAnimations();
                    requestAnimationFrame(() => forceStartAtTop(true));
                }
            });
        }
    });

    tlLoader.to(count, {
        val: 0,
        duration: isSmallScreen ? 0.55 : 1.8,
        ease: "none",
        onUpdate: () => {
            loaderCounter.innerText = "0" + Math.ceil(count.val);
        }
    });


    // 2. Three.js Advanced Scene (Atmosphere + Glass Shapes)
    let scene, camera, renderer, cloudParticles = [], floatingShapes = [], flash;
    
    function initThree() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 1;
        camera.rotation.x = 1.16;
        camera.rotation.y = -0.12;
        camera.rotation.z = 0.27;

        let ambient = new THREE.AmbientLight(0x555555);
        scene.add(ambient);

        let directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0,0,1);
        scene.add(directionalLight);

        renderer = new THREE.WebGLRenderer({ antialias: !isSmallScreen, alpha: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmallScreen ? 1 : 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        scene.fog = new THREE.FogExp2(0x050505, 0.002);
        document.body.appendChild(renderer.domElement);
        renderer.domElement.style.position = 'fixed';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.zIndex = '-2';
        renderer.domElement.style.pointerEvents = 'none';

        // Add Clouds
        let loader = new THREE.TextureLoader();
        loader.load("https://raw.githubusercontent.com/pankaj-sharma/threejs-smoke-lightning-effect/master/smoke.png", function(texture){
            const cloudGeo = new THREE.PlaneBufferGeometry(500,500);
            const cloudMaterial = new THREE.MeshLambertMaterial({ map: texture, transparent: true });

            const cloudCount = isSmallScreen ? 8 : 25;
            for(let p=0; p<cloudCount; p++) {
                let cloud = new THREE.Mesh(cloudGeo,cloudMaterial);
                cloud.position.set(Math.random()*800 -400, 500, Math.random()*500 - 450);
                cloud.rotation.x = 1.16;
                cloud.rotation.y = -0.12;
                cloud.rotation.z = Math.random()*360;
                cloud.material.opacity = 0.6;
                cloudParticles.push(cloud);
                scene.add(cloud);
            }
        });

        // Add Floating Glass Shapes
        const geometries = [
            new THREE.TorusGeometry(10, 2.4, 16, 64),
            new THREE.TorusGeometry(8, 1.6, 12, 48),
            new THREE.SphereGeometry(5.5, 24, 24),
            new THREE.IcosahedronGeometry(9, 0),
            new THREE.OctahedronGeometry(9, 0),
            new THREE.TetrahedronGeometry(9, 0),
            new THREE.TorusKnotGeometry(7.5, 2.1, 80, 12),
            new THREE.RingGeometry(6, 10, 48)
        ];

        const shapeCount = 16;
        for (let i = 0; i < shapeCount; i++) {
            const geo = geometries[i % geometries.length];
            const wireframe = i % 4 === 0;
            const mat = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: wireframe ? 0.18 : 0.1,
                shininess: 120,
                specular: 0xffffff,
                wireframe,
                side: THREE.DoubleSide
            });
            const shape = new THREE.Mesh(geo, mat);
            const scale = 0.45 + Math.random() * 1.7;
            shape.scale.setScalar(scale);
            shape.position.set(
                (Math.random() - 0.5) * 380,
                Math.random() * 260 - 30,
                (Math.random() - 0.5) * 340 - 40
            );
            shape.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            floatingShapes.push({
                mesh: shape,
                rotX: 0.006 + Math.random() * 0.014,
                rotY: 0.005 + Math.random() * 0.012,
                phase: Math.random() * Math.PI * 2,
                ampY: 10 + Math.random() * 22,
                ampX: 6 + Math.random() * 16,
                baseX: shape.position.x,
                baseY: shape.position.y
            });
            scene.add(shape);
        }

        animateThree();
    }

    function animateThree() {
        requestAnimationFrame(animateThree);
        if (document.hidden) return;
        cloudParticles.forEach(p => { p.rotation.z -=0.002; });
        floatingShapes.forEach(s => {
            s.mesh.rotation.x += s.rotX;
            s.mesh.rotation.y += s.rotY;
            const t = Date.now() * 0.001;
            s.mesh.position.y = s.baseY + Math.sin(t * 0.9 + s.phase) * s.ampY;
            s.mesh.position.x = s.baseX + Math.cos(t * 0.55 + s.phase) * s.ampX;
        });
        renderer.render(scene, camera);
    }

    // A second WebGL canvas behind a CSS gradient buys almost nothing on a phone
    // but costs a constant render loop, so phones get the CSS aurora only.
    if (!isSmallScreen) {
        initThree();
    }

    // Keep the WebGL canvas matched to the viewport (mobile rotation / chrome resize)
    let threeResizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(threeResizeTimer);
        threeResizeTimer = setTimeout(() => {
            if (!renderer || !camera) return;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, 200);
    });

    // 3. Main Animations
    function initMainAnimations() {
        if (!isSmallScreen && typeof AOS !== 'undefined') {
            AOS.init({ duration: 1000, once: false });
        } else {
            document.querySelectorAll('[data-aos]').forEach((el) => {
                el.classList.add('aos-animate');
                el.removeAttribute('data-aos');
            });
        }

        // SplitType Reveal
        const revealTexts = document.querySelectorAll('.reveal-text');
        revealTexts.forEach(text => {
            gsap.fromTo(text,
                { y: 24, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.7,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: text, start: 'top 92%', once: true }
                }
            );
        });

        // Horizontal Scroll — pinned on desktop only; mobile uses native swipe + snap
        const wrapper = document.querySelector('.horizontal-scroll-wrapper');
        if (wrapper) {
            gsap.matchMedia().add("(min-width: 768px)", () => {
                gsap.to(wrapper, {
                    x: () => {
                        const dist = wrapper.scrollWidth - window.innerWidth;
                        return document.documentElement.dir === 'rtl' ? dist : -dist;
                    },
                    ease: "none",
                    scrollTrigger: {
                        trigger: "#work",
                        start: "top top",
                        end: () => "+=" + Math.max(wrapper.scrollWidth - window.innerWidth, 0),
                        scrub: 1,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true
                    }
                });
            });
        }

        // Project Image Perspective Tilt (pointer devices only)
        if (!isTouch) {
            const projectItems = document.querySelectorAll('.horizontal-item');
            projectItems.forEach(item => {
                const img = item.querySelector('img');
                if (!img) return;
                item.addEventListener('mousemove', (e) => {
                    const { left, top, width, height } = item.getBoundingClientRect();
                    const x = (e.clientX - left) / width - 0.5;
                    const y = (e.clientY - top) / height - 0.5;
                    gsap.to(img, {
                        scale: 1.15,
                        x: x * 30,
                        y: y * 30,
                        rotateX: -y * 10,
                        rotateY: x * 10,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                });
                item.addEventListener('mouseleave', () => {
                    gsap.to(img, { scale: 1, x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 0.8 });
                });
            });
        }

        // Autoplay card videos while they are on screen (no hover on touch).
        // On metered connections the poster image stands in for the reel.
        if ((isTouch || isSmallScreen) && !saveData) {
            document.querySelectorAll('.horizontal-item video').forEach(video => {
                video.preload = 'metadata';
                video.muted = true;
                video.loop = true;
                video.setAttribute('playsinline', '');
                const io = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            video.play().catch(() => {});
                        } else {
                            video.pause();
                        }
                    });
                }, { threshold: 0.35 });
                io.observe(video);
            });
        }

        // Mobile: snap carousel — light fade-in, no vertical-stack parallax
        gsap.matchMedia().add("(max-width: 767px)", () => {
            gsap.fromTo('.horizontal-scroll-container',
                { y: 28, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.7,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: '#work', start: 'top 88%', once: true }
                }
            );
        });
    }

    // 4. Advanced Cursor Morphing (pointer devices only — phones have no cursor)
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    const cursorText = document.querySelector('.cursor-text');

    if (!isTouch && cursor && follower) {
        gsap.set([cursor, follower], { xPercent: -50, yPercent: -50 });

        window.addEventListener('mousemove', (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.06, ease: 'power2.out' });
            gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.18, ease: 'power2.out' });

            floatingShapes.forEach(s => {
                const dx = e.clientX / window.innerWidth - 0.5;
                const dy = e.clientY / window.innerHeight - 0.5;
                s.baseX += dx * 0.35;
                s.baseY -= dy * 0.35;
            });
        });

        // Social pills are excluded: the enlarged cursor would sit right on top of
        // the label the pill just revealed.
        const clickable = document.querySelectorAll('a:not(.social-icon), .btn-primary, .skill-tag');
        clickable.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
                cursorText.innerText = el.tagName === 'A' ? 'Go' : 'Hi';
                gsap.to(follower, { scale: 0, opacity: 0 });
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
                gsap.to(follower, { scale: 1, opacity: 1 });
            });
        });

        const projects = document.querySelectorAll('.horizontal-item');
        projects.forEach(p => {
            p.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
                cursorText.innerText = 'View';
                gsap.to(follower, { scale: 0, opacity: 0 });
            });
            p.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
                gsap.to(follower, { scale: 1, opacity: 1 });
            });
        });
    }

    // 6. Project Detail Logic
    const projectData = window.PROJECT_DATA || {};
    window.initProjectDetail();
    const getProjectMedia = window.getProjectMedia;
    const openProjectDetail = window.openProjectDetail;

    const projects = document.querySelectorAll('.horizontal-item');
    projects.forEach(p => {
        const title = p.querySelector('h3').innerText.trim();
        const cardImg = p.querySelector('img');
        const cardVideo = p.querySelector('video');
        const fallbackSrc = cardImg ? cardImg.src : (cardVideo ? cardVideo.src : '');
        const data = projectData[title] || { images: fallbackSrc ? [fallbackSrc] : [] };
        const media = getProjectMedia(data, fallbackSrc);
        const imageOnly = media.filter(m => m.type === 'image');
        let imgIndex = 0;
        let interval;

        p.addEventListener('mouseenter', () => {
            if (cardVideo) {
                cardVideo.play().catch(() => {});
            }
            if (imageOnly.length > 1 && cardImg) {
                interval = setInterval(() => {
                    imgIndex = (imgIndex + 1) % imageOnly.length;
                    gsap.to(cardImg, {
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => {
                            cardImg.src = imageOnly[imgIndex].src;
                            gsap.to(cardImg, { opacity: 0.6, duration: 0.3 });
                        }
                    });
                }, 2000);
            }
        });

        p.addEventListener('mouseleave', () => {
            clearInterval(interval);
            if (cardVideo) {
                cardVideo.pause();
                cardVideo.currentTime = 0;
            }
        });

        p.addEventListener('click', () => {
            const dataFull = projectData[title] || {
                desc: 'Project details coming soon...',
                stack: ['Web Tech'],
                link: '#',
                tag: 'Development',
                images: fallbackSrc ? [fallbackSrc] : []
            };
            openProjectDetail(title, dataFull, fallbackSrc);
        });
    });

    // Deep links from older archive URLs still work on home.
    (function openProjectFromQuery() {
        const requested = new URLSearchParams(location.search).get('project');
        if (!requested) return;
        const data = projectData[requested.trim().toUpperCase()];
        if (!data) return;

        const name = requested.trim().toUpperCase();
        const first = (data.media && data.media[0] && data.media[0].src) || (data.images && data.images[0]) || '';

        setTimeout(() => {
            const work = document.querySelector('#work');
            if (work) window.scrollTo({ top: work.offsetTop, behavior: 'auto' });
            openProjectDetail(name, data, first, { fromQuery: true });
        }, 1200);
    })();

    // 7. Essential Interactions
    const scrollProgress = document.querySelector('#scrollProgress');
    if (scrollProgress && !isSmallScreen) {
        window.addEventListener('scroll', () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            scrollProgress.style.width = ((window.scrollY / totalHeight) * 100) + "%";
        }, { passive: true });
    } else if (scrollProgress) {
        scrollProgress.style.display = 'none';
    }

    if (!isTouch) {
        const magnets = document.querySelectorAll('.btn-primary, .btn-secondary, #backToTop, nav a');
        magnets.forEach((btn) => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.4 });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
            });
        });
    }

    document.querySelector('#backToTop').addEventListener('click', () => {
        gsap.to(window, { duration: 2, scrollTo: 0, ease: "expo.inOut" });
    });

    // 8. Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        if (anchor.closest('#mobileNav')) return;
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            scrollToSection(target);
        });
    });

    // 8b. Mobile tab bar — sliding highlight follows the section in view
    (function initMobileNav() {
        const mobileNav = document.querySelector('#mobileNav');
        if (!mobileNav) return;

        const items = Array.from(mobileNav.querySelectorAll('.mnav-item'));
        const pill = mobileNav.querySelector('.mnav-pill');
        let activeId = 'home';

        const movePill = (el) => {
            if (!pill || !el || !el.offsetWidth) return;
            pill.style.width = `${el.offsetWidth}px`;
            pill.style.transform = `translateX(${el.offsetLeft - 6}px)`;
        };

        const setActive = (id) => {
            activeId = id;
            let target = null;
            items.forEach(item => {
                const on = item.dataset.section === id;
                item.classList.toggle('is-active', on);
                if (on) target = item;
            });
            movePill(target);
        };

        // offsetWidth is 0 until the bar has been laid out
        requestAnimationFrame(() => setActive(activeId));

        let spyLocked = false;
        let spyUnlockTimer;

        const lockSpy = (ms = 700) => {
            spyLocked = true;
            clearTimeout(spyUnlockTimer);
            spyUnlockTimer = setTimeout(() => { spyLocked = false; }, ms);
        };

        const goTo = (item) => {
            const target = document.querySelector(item.getAttribute('href'));
            if (!target) return;
            if (navigator.vibrate) navigator.vibrate(8);
            lockSpy();
            setActive(item.dataset.section);
            scrollToSection(target, { instant: true });
        };

        items.forEach(item => {
            item.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                e.preventDefault();
                goTo(item);
            });
            item.addEventListener('click', (e) => {
                e.preventDefault();
                if (!e.pointerType) goTo(item);
            });
        });

        // The band in the middle of the screen decides which tab lights up.
        const spy = new IntersectionObserver((entries) => {
            if (spyLocked) return;
            entries.forEach(entry => {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: '-45% 0px -45% 0px' });

        items.forEach(item => {
            const section = document.querySelector(item.getAttribute('href'));
            if (section) spy.observe(section);
        });

        window.addEventListener('resize', () => {
            requestAnimationFrame(() => setActive(activeId));
        });
        window.addEventListener('langchange', () => {
            requestAnimationFrame(() => setActive(activeId));
        });
    })();

    // 8c. Mobile project carousel dots
    (function initProjectDots() {
        const scroller = document.querySelector('.horizontal-scroll-container');
        const dotsWrap = document.querySelector('#projectDots');
        const items = Array.from(document.querySelectorAll('.horizontal-item'));
        if (!scroller || !dotsWrap || !items.length) return;

        const visibleItems = () => items.filter(el => getComputedStyle(el).display !== 'none');

        const mq = window.matchMedia('(max-width: 767px)');
        let active = 0;

        const setActive = (index) => {
            if (index === active) return;
            active = index;
            dotsWrap.querySelectorAll('.project-dot').forEach((dot, i) => {
                dot.classList.toggle('is-active', i === index);
            });
        };

        const nearestIndex = () => {
            const mid = scroller.getBoundingClientRect().left + scroller.clientWidth / 2;
            let best = 0;
            let dist = Infinity;
            items.filter(el => getComputedStyle(el).display !== 'none').forEach((item, i) => {
                const r = item.getBoundingClientRect();
                const d = Math.abs(r.left + r.width / 2 - mid);
                if (d < dist) {
                    dist = d;
                    best = i;
                }
            });
            return best;
        };

        const render = () => {
            dotsWrap.innerHTML = '';
            if (!mq.matches) return;
            visibleItems().forEach((_, i) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'project-dot' + (i === 0 ? ' is-active' : '');
                btn.setAttribute('aria-label', 'Go to project ' + (i + 1));
                btn.addEventListener('click', () => {
                    const target = visibleItems()[i];
                    if (target) target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                });
                dotsWrap.appendChild(btn);
            });
            active = 0;
        };

        render();
        scroller.addEventListener('scroll', () => setActive(nearestIndex()), { passive: true });
        mq.addEventListener('change', render);
    })();

    // 9. Dynamic Background Transitions
    const bgMesh = document.querySelector('.bg-mesh');
    const colors = [
        { c1: "#8b5cf6", c2: "#06b6d4", c3: "#ec4899" }, // Default
        { c1: "#f59e0b", c2: "#ef4444", c3: "#8b5cf6" }, // Work
        { c1: "#10b981", c2: "#3b82f6", c3: "#6366f1" }  // Contact
    ];

    ScrollTrigger.create({
        trigger: "#work",
        start: "top 50%",
        onEnter: () => {
            gsap.to('.c1', { background: colors[1].c1, duration: 2 });
            gsap.to('.c2', { background: colors[1].c2, duration: 2 });
            gsap.to('.c3', { background: colors[1].c3, duration: 2 });
        },
        onLeaveBack: () => {
            gsap.to('.c1', { background: colors[0].c1, duration: 2 });
            gsap.to('.c2', { background: colors[0].c2, duration: 2 });
            gsap.to('.c3', { background: colors[0].c3, duration: 2 });
        }
    });

    ScrollTrigger.create({
        trigger: "#contact",
        start: "top 50%",
        onEnter: () => {
            gsap.to('.c1', { background: colors[2].c1, duration: 2 });
            gsap.to('.c2', { background: colors[2].c2, duration: 2 });
            gsap.to('.c3', { background: colors[2].c3, duration: 2 });
        },
        onLeaveBack: () => {
            gsap.to('.c1', { background: colors[1].c1, duration: 2 });
            gsap.to('.c2', { background: colors[1].c2, duration: 2 });
            gsap.to('.c3', { background: colors[1].c3, duration: 2 });
        }
    });

    // 10. Physics Stack (Matter.js)
    (function initPhysicsStack() {
        const playground = document.querySelector('#stackPlayground');
        const tags = Array.from(document.querySelectorAll('.stack-tag'));
        const resetBtn = document.querySelector('#stackReset');
        if (!playground || !tags.length) return;

        // Style tags immediately so they are never invisible empty shells
        tags.forEach(tag => {
            tag.style.background = tag.dataset.color || '#333';
            tag.style.color = tag.dataset.text || '#fff';
        });

        if (typeof Matter === 'undefined') {
            playground.classList.add('stack-fallback');
            return;
        }

        const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Events, Query } = Matter;
        const engine = Engine.create();
        engine.gravity.y = 1.15;
        const world = engine.world;
        const runner = Runner.create();
        let bodies = [];
        let mouseConstraint = null;
        let ready = false;
        let dropTimers = [];

        const dropTags = () => {
            const width = playground.clientWidth;
            const height = playground.clientHeight;
            if (width < 80 || height < 80) return;

            dropTimers.forEach(clearTimeout);
            dropTimers = [];

            // Remove previous dynamic bodies + walls + mouse
            Composite.clear(world, false);
            bodies = [];

            // Walls: floor + left + right only (NO top wall — that was blocking drops)
            const thickness = 80;
            const wallOpts = { isStatic: true, friction: 0.8 };
            Composite.add(world, [
                Bodies.rectangle(width / 2, height + thickness / 2, width + 100, thickness, wallOpts),
                Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 2, wallOpts),
                Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, wallOpts)
            ]);

            tags.forEach((tag, i) => {
                tag.style.visibility = 'visible';
                tag.style.opacity = '1';
                tag.style.transform = 'none';

                const tw = Math.max(tag.offsetWidth || 90, 80);
                const th = Math.max(tag.offsetHeight || 40, 36);
                const x = 60 + Math.random() * Math.max(width - 120, 20);
                const angle = (Math.random() - 0.5) * 0.9;

                // Start above the box, then cascade in
                const body = Bodies.rectangle(x, -50 - i * 30, tw, th, {
                    restitution: 0.45,
                    friction: 0.35,
                    frictionAir: 0.02,
                    density: 0.0025,
                    angle,
                    chamfer: { radius: 12 },
                    isStatic: true
                });

                body.stackEl = tag;
                body.stackW = tw;
                body.stackH = th;
                bodies.push(body);

                // Sync initial offscreen position immediately
                tag.style.transform =
                    `translate(${x - tw / 2}px, ${-50 - i * 30 - th / 2}px) rotate(${angle}rad)`;

                dropTimers.push(setTimeout(() => {
                    Body.setStatic(body, false);
                    Body.setVelocity(body, { x: (Math.random() - 0.5) * 2.5, y: 2 });
                }, 80 + i * 90));
            });

            Composite.add(world, bodies);

            // Matter's touch handlers call preventDefault on every move, which would
            // swallow vertical page scrolling. Pointer devices get free-form drag;
            // touch gets tap-to-launch plus tilt gravity further down instead.
            if (!isTouch) {
                if (mouseConstraint) {
                    Composite.remove(world, mouseConstraint);
                }
                const mouse = Mouse.create(playground);
                try {
                    mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
                    mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
                    mouse.element.removeEventListener('wheel', mouse.mousewheel);
                } catch (_) {}

                mouseConstraint = MouseConstraint.create(engine, {
                    mouse,
                    constraint: { stiffness: 0.2, render: { visible: false } }
                });
                Composite.add(world, mouseConstraint);
            }

            playground.classList.add('is-ready');
            ready = true;
            setPhysicsRunning(true);
        };

        Events.on(engine, 'afterUpdate', () => {
            bodies.forEach(body => {
                if (!body.stackEl) return;
                body.stackEl.style.transform =
                    `translate(${body.position.x - body.stackW / 2}px, ${body.position.y - body.stackH / 2}px) rotate(${body.angle}rad)`;
            });
        });

        let physicsRunning = false;
        const setPhysicsRunning = (on) => {
            if (on && !physicsRunning) {
                Runner.run(runner, engine);
                physicsRunning = true;
            } else if (!on && physicsRunning) {
                Runner.stop(runner);
                physicsRunning = false;
            }
        };

        // Tilting the handset steers gravity sideways. iOS gates the sensor behind
        // a permission prompt, so it is asked for from the reset button instead of
        // firing a dialog at anyone who merely scrolls past.
        const needsMotionPermission = typeof window.DeviceOrientationEvent !== 'undefined' &&
            typeof window.DeviceOrientationEvent.requestPermission === 'function';
        let tiltAttached = false;

        const applyTilt = (event) => {
            if (typeof event.gamma !== 'number') return;
            engine.gravity.x = gsap.utils.clamp(-0.9, 0.9, event.gamma / 45 * 0.9);
        };

        const attachTilt = () => {
            if (tiltAttached) return;
            tiltAttached = true;
            window.addEventListener('deviceorientation', applyTilt);
        };

        if (isTouch && typeof window.DeviceOrientationEvent !== 'undefined' && !needsMotionPermission) {
            attachTilt();
        }

        // Touch: a tap launches a badge. Nothing here calls preventDefault, so the
        // page keeps owning vertical gestures over the playground.
        if (isTouch) {
            let tap = null;

            playground.addEventListener('touchstart', (e) => {
                if (e.touches.length !== 1) return;
                tap = { x: e.touches[0].clientX, y: e.touches[0].clientY, at: Date.now() };
            }, { passive: true });

            playground.addEventListener('touchend', (e) => {
                const start = tap;
                tap = null;
                if (!ready || !start) return;

                const touch = e.changedTouches[0];
                const moved = Math.hypot(touch.clientX - start.x, touch.clientY - start.y);
                if (moved > 12 || Date.now() - start.at > 500) return;

                const rect = playground.getBoundingClientRect();
                const hit = Query.point(bodies, {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top
                })[0];
                if (!hit) return;

                Body.setVelocity(hit, { x: (Math.random() - 0.5) * 7, y: -9 });
                Body.setAngularVelocity(hit, (Math.random() - 0.5) * 0.45);
                if (navigator.vibrate) navigator.vibrate(6);
            }, { passive: true });
        }

        const waitForIcons = () => {
            const imgs = Array.from(playground.querySelectorAll('.stack-icon img'));
            return Promise.all(imgs.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }));
        };

        const start = () => {
            waitForIcons().then(() => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(dropTags);
                });
            });
        };

        // Start as soon as section is near viewport, and pause the engine
        // when the playground leaves the screen so it doesn't tax the tab bar.
        const io = new IntersectionObserver((entries) => {
            const visible = entries.some(e => e.isIntersecting);
            if (visible && !ready) start();
            else if (ready) setPhysicsRunning(visible);
        }, { threshold: 0.05, rootMargin: '80px' });
        io.observe(playground);

        // Also start on reset click / if already visible
        resetBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isTouch && needsMotionPermission && !tiltAttached) {
                window.DeviceOrientationEvent.requestPermission()
                    .then(state => { if (state === 'granted') attachTilt(); })
                    .catch(() => {});
            }
            dropTags();
        });

        // Fallback start after load in case observer misses
        setTimeout(() => {
            if (!ready) {
                const rect = playground.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) start();
            }
        }, 800);

        // Only react to real width changes — mobile browser chrome resizes the
        // viewport height constantly while scrolling.
        let resizeTimer;
        let lastWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            if (Math.abs(window.innerWidth - lastWidth) < 40) return;
            lastWidth = window.innerWidth;
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (ready) dropTags();
            }, 250);
        });
    })();

    // 11. Contact form — WhatsApp is the reliable send path (FormSubmit
    // needed a one-time inbox confirmation and often never came back).
    const contactForm = document.querySelector('#contactForm');
    const contactSubmit = document.querySelector('#contactSubmit');
    const contactStatus = document.querySelector('#contactStatus');
    const contactName = document.querySelector('#contactName');
    const contactEmail = document.querySelector('#contactEmail');
    const contactMessage = document.querySelector('#contactMessage');

    const setContactStatus = (text, color) => {
        if (!contactStatus) return;
        contactStatus.style.color = color;
        contactStatus.innerText = text;
    };

    if (contactForm && contactSubmit) {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mail') === 'sent') {
            setContactStatus('تم الإرسال بنجاح ✓', '#34d399');
            history.replaceState({}, '', `${window.location.pathname}#contact`);
        }

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = (contactName && contactName.value || '').trim();
            const email = (contactEmail && contactEmail.value || '').trim();
            const message = (contactMessage && contactMessage.value || '').trim();

            if (!name || !email || !message) {
                setContactStatus(window.t('contact.needFields'), '#f87171');
                return;
            }

            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!emailOk) {
                setContactStatus(window.t('contact.badEmail'), '#f87171');
                return;
            }

            const text = [
                `${window.t('wa.hello')} ${name}`,
                `${window.t('wa.email')}: ${email}`,
                '',
                message
            ].join('\n');

            const waUrl = `https://wa.me/201127273643?text=${encodeURIComponent(text)}`;
            const opened = window.open(waUrl, '_blank', 'noopener');
            if (!opened) window.location.href = waUrl;
            setContactStatus(window.t('contact.sent'), '#34d399');
            contactForm.reset();
        });
    }

});

// Kept outside the main DOMContentLoaded block so the tilt survives even if an
// animation library above it fails to load.
(function contactCardTilt() {
    const start = () => {
        const card = document.querySelector('#contactGlass');
        if (!card) return;
        if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

        const REST_X = 6;
        let rotX = REST_X;
        let rotY = 0;
        let lift = 0;
        let frame = 0;

        const render = () => {
            frame = 0;
            card.style.transform = `translateY(${lift}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(render);
        };

        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            rotY = ((e.clientX - r.left) / r.width - 0.5) * 16;
            rotX = REST_X - ((e.clientY - r.top) / r.height - 0.5) * 14;
            lift = -8;
            schedule();
        });

        card.addEventListener('mouseleave', () => {
            rotY = 0;
            rotX = REST_X;
            lift = 0;
            schedule();
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();

// The social pills expand to the exact width of their label, so each one has to
// be measured once the webfont is in place.
(function measureSocialLabels() {
    const measure = () => {
        document.querySelectorAll('.social-icon').forEach((icon) => {
            const label = icon.querySelector('.social-icon-text');
            if (!label) return;
            label.style.width = 'auto';
            const width = Math.ceil(label.getBoundingClientRect().width);
            label.style.width = '';
            if (width) icon.style.setProperty('--label-w', width + 'px');
        });
    };

    const start = () => {
        measure();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
        window.addEventListener('langchange', measure);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
