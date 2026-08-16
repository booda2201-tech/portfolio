document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const isSmallScreen = window.__IS_MOBILE__ || window.matchMedia('(max-width: 767px)').matches;

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
            new THREE.IcosahedronGeometry(10, 0),
            new THREE.TorusGeometry(10, 3, 16, 100),
            new THREE.OctahedronGeometry(10, 0)
        ];

        const shapeCount = isSmallScreen ? 5 : 15;
        for(let i=0; i<shapeCount; i++) {
            const geo = geometries[Math.floor(Math.random() * geometries.length)];
            const mat = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.1,
                shininess: 100,
                specular: 0xffffff
            });
            const shape = new THREE.Mesh(geo, mat);
            shape.position.set(Math.random()*400 - 200, Math.random()*400 - 200, Math.random()*400 - 200);
            shape.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
            floatingShapes.push({
                mesh: shape,
                speed: Math.random() * 0.01
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
            s.mesh.rotation.x += s.speed;
            s.mesh.rotation.y += s.speed;
            s.mesh.position.y += Math.sin(Date.now() * 0.001) * 0.05;
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
            // A body paragraph splits into a few hundred chars, and at 0.01s of
            // stagger each that reads as a 3-second broken-looking crawl on a
            // phone. Headings are short enough to keep the per-character reveal.
            if (isSmallScreen && !/^H[1-6]$/.test(text.tagName)) {
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
                return;
            }

            const split = new SplitType(text, { types: 'chars, words' });
            // .reveal-text starts hidden in CSS; the chars carry the animation,
            // so the wrapper has to be re-shown or headings never appear.
            gsap.set(text, { opacity: 1 });
            gsap.from(split.chars, {
                scrollTrigger: {
                    trigger: text,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                y: 50,
                rotate: 5,
                opacity: 0,
                stagger: 0.01,
                duration: 0.8,
                ease: "back.out(1.7)"
            });
        });

        // Horizontal Scroll — pinned on desktop only; mobile uses native swipe + snap
        const wrapper = document.querySelector('.horizontal-scroll-wrapper');
        if (wrapper) {
            gsap.matchMedia().add("(min-width: 768px)", () => {
                gsap.to(wrapper, {
                    x: () => -(wrapper.scrollWidth - window.innerWidth),
                    ease: "none",
                    scrollTrigger: {
                        trigger: "#work",
                        start: "top top",
                        end: () => "+=" + wrapper.scrollWidth,
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
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
            gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out' });

            floatingShapes.forEach(s => {
                const dx = (e.clientX / window.innerWidth - 0.5) * 50;
                const dy = (e.clientY / window.innerHeight - 0.5) * 50;
                gsap.to(s.mesh.position, { x: s.mesh.position.x + dx * 0.01, y: s.mesh.position.y - dy * 0.01, duration: 2 });
            });
        });

        const clickable = document.querySelectorAll('a, .btn-primary, .skill-tag');
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
    const skillIcons = {
        'Angular': { slug: 'angular', color: 'dd0031' },
        'TypeScript': { slug: 'typescript', color: '3178c6' },
        'JavaScript': { slug: 'javascript', color: 'f7df1e' },
        'HTML5': { slug: 'html5', color: 'e34f26' },
        'Tailwind CSS': { slug: 'tailwindcss', color: '38bdf8' },
        'GSAP': { slug: 'greensock', color: '88ce02' },
        'Node.js': { slug: 'nodedotjs', color: '339933' },
        'Express': { slug: 'express', color: '000000' },
        'MongoDB': { slug: 'mongodb', color: '13aa52' },
        'Socket.io': { slug: 'socketdotio', color: '010101' },
        'Three.js': { slug: 'threedotjs', color: '000000' },
        'Firebase': { slug: 'firebase', color: 'ffca28' }
    };

    const projectData = {
        "T4T STORE": {
            desc: "منصة متكاملة لبراند \"تي فور تي\" لاستعراض وبيع منتجات الشاي الفاخرة، تتميز بنظام سلة تسوق ذكي، وتتبع مباشر لحالة الطلبات والتوصيل.",
            stack: ["Angular", "TypeScript", "Node.js", "Express", "Tailwind CSS"],
            features: [
                "سلة تسوق ذكية بتحديث فوري للكميات والأسعار",
                "تتبع مباشر لحالة الطلب من التأكيد حتى التوصيل",
                "كتالوج منتجات فاخر يبرز نكهات الشاي بهوية بصرية نظيفة",
                "رحلة شراء مبسطة من التصفح للدفع بدون تعقيد"
            ],
            ideas: [
                "ربط هوية البراند الفاخرة بتجربة تجارة إلكترونية سريعة وواضحة",
                "شفافية كاملة للعميل عبر تتبع الطلب لحظة بلحظة",
                "واجهة minimalist تركّز على المنتج بدل الإزعاج البصري"
            ],
            link: "https://darkslateblue-dove-147065.hostingersite.com/",
            tag: "T4T - Tea E-commerce Store",
            media: [
                { type: 'video', src: 'T4TEA/T4TEA.webm' },
                { type: 'image', src: 'T4TEA/T41.webp' },
                { type: 'image', src: 'T4TEA/T42.webp' },
                { type: 'image', src: 'T4TEA/T43.webp' },
                { type: 'image', src: 'T4TEA/T44.webp' },
                { type: 'image', src: 'T4TEA/T45.webp' },
                { type: 'image', src: 'T4TEA/T46.webp' },
                { type: 'image', src: 'T4TEA/T47.webp' },
                { type: 'image', src: 'T4TEA/T48.webp' },
                { type: 'image', src: 'T4TEA/T49.webp' },
                { type: 'image', src: 'T4TEA/T410.webp' },
                { type: 'image', src: 'T4TEA/T411.webp' }
            ]
        },
        "REBHNY": {
            desc: "منصة \"ربحني\" المتكاملة للمزايدات الحية، تتميز بتتبع اللحظة بالثانية للمزايدات، نظام إدارة نقاط دقيق، ولوحة تحكم احترافية لمراقبة الـ Countdowns والعمليات التي تتم في الوقت الفعلي.",
            stack: ["Angular", "TypeScript", "Node.js", "Express", "Socket.io", "Tailwind CSS"],
            features: [
                "مزايدات حية تتحدث بالثانية عبر Socket.io بدون إعادة تحميل",
                "عدّاد تنازلي متزامن لكل المستخدمين في نفس الجلسة",
                "نظام نقاط دقيق لإدارة الرصيد والمزايدات",
                "لوحة تحكم احترافية لمراقبة العمليات المباشرة والمعاملات"
            ],
            ideas: [
                "منصة مزاد realtime كاملة بدون ريفرش للصفحة",
                "مزامنة العدّاد عبر كل الجلسات النشطة في نفس اللحظة",
                "تجربة مزاد تنافسية أقرب للبث المباشر من المواقع التقليدية"
            ],
            link: "#",
            tag: "Rebhny - Real-time Auction System",
            images: [
                "assets/imges/r1.png",
                "assets/imges/r2.png",
                "assets/imges/r3.png",
                "assets/imges/r4.png"
            ]
        },
        "FORTNO": {
            desc: "واجهة رقمية فاخرة لعلامة \"فورتو\" للعناية بالسيارات، تتميز بهوية \"شياكة\" العربية مع تجربة مستخدم تفاعلية وراقية تعكس جودة الخدمات المقدمة.",
            stack: ["Angular", "TypeScript", "Tailwind CSS", "GSAP"],
            features: [
                "واجهة فاخرة تعكس جودة خدمات العناية بالسيارات",
                "دمج هوية \"شياكة\" العربية داخل تصميم ويب عصري",
                "معرض صور عالي الدقة للنتائج والخدمات",
                "تجربة متجاوبة كاملة للجوال والديسكتوب"
            ],
            ideas: [
                "ترجمة الفخامة العربية إلى لغة ويب حديثة بدون فقدان الهوية",
                "تجربة بصرية cinematic تقنع بالجودة قبل الحجز",
                "تحسين تحميل الأصول لمعارض الصور عالية الدقة"
            ],
            link: "#",
            tag: "Fortno Car Care",
            images: [
                "assets/imges/f1.png",
                "assets/imges/f2.png",
                "assets/imges/f3.png",
                "assets/imges/f4.png",
                "assets/imges/f5.png"
            ]
        },
        "AL HENDAL": {
            desc: "الموقع الرسمي لمجموعة \"الهندال\" القابضة، يدعم اللغتين العربية والإنجليزية (RTL/LTR) مع بنية برمجية متطورة للترجمة وتأثيرات حركية متقدمة باستخدام GSAP.",
            stack: ["Angular", "TypeScript", "ngx-translate", "GSAP", "AOS", "Tailwind CSS"],
            features: [
                "دعم كامل للعربية والإنجليزية مع تبديل RTL/LTR",
                "أنيميشن مؤسسي متقدم بـ GSAP و AOS",
                "بنية ترجمة مركزية قابلة للتوسع عبر صفحات المجموعة",
                "حضور رقمي يعكس هوية هولدينج متعدد الأنشطة"
            ],
            ideas: [
                "تبديل اتجاه الصفحة بسلاسة بدون كسر التخطيط أو الأنيميشن",
                "حركة GSAP تحافظ على الفخامة المؤسسية بدل التأثيرات الاستعراضية",
                "معمارية Angular قابلة لإعادة الاستخدام عبر مشاريع الهولدينج"
            ],
            link: "#",
            tag: "Al Hendal Holding Group",
            images: [
                "assets/imges/a1.png",
                "assets/imges/a2.png"
            ]
        },
        "BUBBLE HOPE": {
            desc: "منصة تسوق إلكترونية متطورة مصممة لتجربة تصفح سلسة، تهدف إلى تسهيل عمليات عرض وبيع المنتجات عبر واجهة مستخدم عصرية وأنيقة.",
            stack: ["Angular", "TypeScript", "Node.js", "Tailwind CSS"],
            features: [
                "تصفح متعدد الفئات بتجربة سلسة وسريعة",
                "واجهة عصرية لعرض وبيع المنتجات بوضوح",
                "تنقل واضح ونقاط تفاعل آمنة للمستخدم",
                "تجربة تسوق مبسطة ومتجاوبة على كل الشاشات"
            ],
            ideas: [
                "تبسيط رحلة الشراء لتقليل خطوات التحويل",
                "تصميم يعطي أولوية للمنتج مع حركة ناعمة غير مشتتة",
                "تجربة تصفح أقرب للتطبيق من المواقع التقليدية"
            ],
            link: "https://www.bubblehope.com",
            tag: "Bubble Hope",
            media: [
                { type: 'video', src: 'Bubble/Bubble.webm' },
                { type: 'image', src: 'Bubble/BB1.webp' },
                { type: 'image', src: 'Bubble/BB2.webp' },
                { type: 'image', src: 'Bubble/BB3.webp' },
                { type: 'image', src: 'Bubble/BB4.webp' },
                { type: 'image', src: 'Bubble/BB5.webp' },
                { type: 'image', src: 'Bubble/BB6.webp' }
            ]
        },
        "MOONLIGHT": {
            desc: "منصة إبداعية لمؤسسة سعودية متخصصة في إدارة الفعاليات الكبرى. يتميز التصميم بالطابع الليلي الفاخر (Dark Mode) مع عرض بورتفوليو بصري مبهر للمشاريع الضخمة مثل Boulevard World.",
            stack: ["JavaScript", "GSAP", "Tailwind CSS", "HTML5"],
            features: [
                "Dark Mode فاخر يناسب هوية الفعاليات الليلية",
                "بورتفوليو بصري لمشاريع ضخمة مثل Boulevard World",
                "أنيميشن GSAP سينمائي مرتبط بالتمرير",
                "تصميم متجاوب لعرض الفعاليات الكبرى بوضوح"
            ],
            ideas: [
                "الهوية الليلية كتجربة كاملة وليس مجرد ثيم داكن",
                "سرد بصري للفعاليات الكبرى بدل الكتالوج التقليدي",
                "حركة GSAP تربط المشاهد كأنها عرض حدث حي"
            ],
            link: "https://moonlight.sa",
            tag: "Moonlight Events",
            images: [
                "assets/imges/moon1.png",
                "assets/imges/moon2.png",
                "assets/imges/moon3.png",
                "assets/imges/moon4.png"
            ]
        },
        "VIGANIUM AI": {
            desc: "موقع تقني متطور لشركة حلول برمجية وذكاء اصطناعي، يعتمد على هوية بصرية قوية وعناصر ثلاثية الأبعاد لشرح خدمات التحول الرقمي والتسويق الذكي بأسلوب تفاعلي عصري.",
            stack: ["Node.js", "JavaScript", "Three.js", "GSAP", "Tailwind CSS"],
            features: [
                "عناصر ثلاثية الأبعاد لشرح الخدمات التقنية بشكل تفاعلي",
                "عرض حلول الذكاء الاصطناعي والتحول الرقمي بوضوح",
                "هوية بصرية قوية تناسب شركة تقنية حديثة",
                "تجربة تفاعلية للتسويق الذكي بدل الصفحات التعريفية الجامدة"
            ],
            ideas: [
                "استخدام 3D لتبسيط خدمات الذكاء الاصطناعي المعقدة",
                "موقع يشرح التحول الرقمي بالحركة وليس بالنصوص فقط",
                "دمج الهوية التقنية مع storytelling بصري يقنع العميل"
            ],
            link: "https://viganium.com/ar",
            tag: "Viganium AI",
            images: [
                "assets/imges/vig1.png",
                "assets/imges/vig2.png",
                "assets/imges/vig3.png"
            ]
        },
        "GULF FOOD": {
            desc: "واجهة رقمية متكاملة لمصنع أغذية رائد، تركز على استعراض جودة المخبوزات والمنتجات الغذائية بتصميم بصري جذاب، مع تنظيم دقيق للأقسام التعريفية وقوائم المنتجات والشهادات العالمية.",
            stack: ["Angular", "TypeScript", "Tailwind CSS", "HTML5"],
            features: [
                "كتالوج منظم للمخبوزات والمنتجات الغذائية",
                "عرض الشهادات ومعايير الجودة العالمية",
                "أقسام تعريفية واضحة عن المصنع والإنتاج",
                "تصميم RTL بصري يبرز جودة المنتج قبل التفاصيل"
            ],
            ideas: [
                "موقع مصنع أغذية يبني الثقة بصريًا عبر الشهادات والجودة",
                "تنظيم الكتالوج ليخدم العملاء والشركاء معًا",
                "هوية خليجية حديثة بعيدًا عن قوالب مواقع المصانع التقليدية"
            ],
            link: "https://gcfoodfactory.com",
            tag: "Gulf Food Factory",
            images: [
                "assets/imges/gf1.png",
                "assets/imges/gf2.png",
                "assets/imges/gf3.png"
            ]
        }
    };

    const projectDetail = document.querySelector('#projectDetail');
    const closeDetail = document.querySelector('#closeDetail');
    const detailImg = document.querySelector('#detailImg');
    const detailVideo = document.querySelector('#detailVideo');
    const detailTitle = document.querySelector('#detailTitle');
    const detailTag = document.querySelector('#detailTag');
    const detailDesc = document.querySelector('#detailDesc');
    const detailStack = document.querySelector('#detailStack');
    const detailFeatures = document.querySelector('#detailFeatures');
    const detailIdeas = document.querySelector('#detailIdeas');
    const detailLink = document.querySelector('#detailLink');
    const detailActions = document.querySelector('#detailActions');
    const detailThumbs = document.querySelector('#detailThumbs');
    const detailCounter = document.querySelector('#detailCounter');
    const detailPrev = document.querySelector('#detailPrev');
    const detailNext = document.querySelector('#detailNext');

    let activeDetail = { media: [], index: 0 };
    let detailAutoplay = null;

    const getProjectMedia = (data, fallbackSrc) => {
        let media = [];
        if (data.media && data.media.length) {
            media = data.media;
        } else if (data.images && data.images.length) {
            media = data.images.map(src => ({ type: 'image', src }));
        } else if (fallbackSrc) {
            media = [{ type: 'image', src: fallbackSrc }];
        }

        // On phones show a lightweight image first so opening a project never
        // starts by downloading a multi-megabyte reel.
        if (isSmallScreen && media.some(m => m.type === 'video')) {
            media = [
                ...media.filter(m => m.type !== 'video'),
                ...media.filter(m => m.type === 'video')
            ];
        }

        return media;
    };

    const renderDetailMedia = (item) => {
        if (!item) return;
        if (item.type === 'video') {
            detailImg.classList.add('hidden');
            detailVideo.classList.remove('hidden');
            detailVideo.src = item.src;
            detailVideo.currentTime = 0;
            detailVideo.play().catch(() => {});
        } else {
            detailVideo.pause();
            detailVideo.removeAttribute('src');
            detailVideo.load();
            detailVideo.classList.add('hidden');
            detailImg.classList.remove('hidden');
            detailImg.src = item.src;
            detailImg.style.opacity = 1;
        }
    };

    const showDetailMedia = (index) => {
        if (!activeDetail.media.length) return;
        activeDetail.index = (index + activeDetail.media.length) % activeDetail.media.length;
        const item = activeDetail.media[activeDetail.index];

        gsap.to([detailImg, detailVideo], {
            opacity: 0,
            duration: 0.15,
            onComplete: () => {
                renderDetailMedia(item);
                gsap.to([detailImg, detailVideo], { opacity: 1, duration: 0.2 });
            }
        });

        detailCounter.innerText = `${activeDetail.index + 1} / ${activeDetail.media.length}`;
        detailThumbs.querySelectorAll('button').forEach((btn, i) => {
            btn.classList.toggle('ring-2', i === activeDetail.index);
            btn.classList.toggle('ring-primary', i === activeDetail.index);
            btn.classList.toggle('opacity-100', i === activeDetail.index);
            btn.classList.toggle('opacity-50', i !== activeDetail.index);
        });
    };

    const stopDetailAutoplay = () => {
        if (detailAutoplay) {
            clearInterval(detailAutoplay);
            detailAutoplay = null;
        }
    };

    const startDetailAutoplay = () => {
        stopDetailAutoplay();
        // Don't autoplay-cycle while a video is the only/current item
        if (activeDetail.media.length < 2) return;
        const current = activeDetail.media[activeDetail.index];
        if (current && current.type === 'video') return;
        detailAutoplay = setInterval(() => {
            showDetailMedia(activeDetail.index + 1);
        }, 4000);
    };

    const unlockPageScroll = () => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.documentElement.classList.remove('lenis-stopped');
        if (lenis && typeof lenis.start === 'function') lenis.start();
    };

    const closeProjectDetail = () => {
        stopDetailAutoplay();
        if (detailVideo) {
            detailVideo.pause();
            detailVideo.removeAttribute('src');
            detailVideo.load();
            detailVideo.classList.add('hidden');
        }
        detailImg.classList.remove('hidden');
        projectDetail.classList.add('translate-y-full');
        projectDetail.classList.remove('is-open');
        unlockPageScroll();
    };

    const openProjectDetail = (title, dataFull, fallbackSrc) => {
        stopDetailAutoplay();
        activeDetail = { media: getProjectMedia(dataFull, fallbackSrc), index: 0 };

        detailTitle.innerText = title;
        detailTag.innerText = dataFull.tag || 'Project';
        detailDesc.innerText = dataFull.desc || '';
        detailCounter.innerText = `1 / ${activeDetail.media.length || 1}`;
        renderDetailMedia(activeDetail.media[0]);

        const hasLink = dataFull.link && dataFull.link !== '#';
        if (hasLink) {
            detailActions.style.display = '';
            detailLink.href = dataFull.link;
        } else {
            detailActions.style.display = 'none';
        }

        const showNav = activeDetail.media.length > 1;
        detailPrev.style.display = showNav ? '' : 'none';
        detailNext.style.display = showNav ? '' : 'none';

        const renderPointList = (container, items) => {
            container.innerHTML = '';
            (items || []).forEach((text, i) => {
                const li = document.createElement('li');
                li.className = 'detail-point';
                li.innerHTML = `
                    <span class="detail-point-index">${String(i + 1).padStart(2, '0')}</span>
                    <p>${text}</p>
                `;
                container.appendChild(li);
            });
        };

        detailStack.innerHTML = '';
        (dataFull.stack || []).forEach(s => {
            const span = document.createElement('span');
            span.className = 'detail-skill';
            const meta = skillIcons[s];
            if (meta) {
                span.innerHTML = `<span class="stack-icon"><img src="https://cdn.simpleicons.org/${meta.slug}/${meta.color}" alt="" width="14" height="14"></span>${s}`;
            } else {
                span.innerText = s;
            }
            detailStack.appendChild(span);
        });

        renderPointList(detailFeatures, dataFull.features);
        renderPointList(detailIdeas, dataFull.ideas);

        const featuresWrap = detailFeatures.closest('.detail-reveal');
        const ideasWrap = detailIdeas.closest('.detail-reveal');
        if (featuresWrap) featuresWrap.style.display = (dataFull.features && dataFull.features.length) ? '' : 'none';
        if (ideasWrap) ideasWrap.style.display = (dataFull.ideas && dataFull.ideas.length) ? '' : 'none';

        detailThumbs.innerHTML = '';
        activeDetail.media.forEach((item, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `shrink-0 w-16 h-12 md:w-24 md:h-16 rounded-lg overflow-hidden border border-white/10 cursor-pointer transition-all relative ${i === 0 ? 'ring-2 ring-primary opacity-100' : 'opacity-50'}`;
            if (item.type === 'video') {
                btn.innerHTML = `
                    <video src="${item.src}" muted playsinline preload="metadata" class="w-full h-full object-cover"></video>
                    <span class="absolute inset-0 flex items-center justify-center bg-black/35 text-[10px] font-bold tracking-widest">VIDEO</span>
                `;
            } else {
                btn.innerHTML = `<img src="${item.src}" alt="" class="w-full h-full object-cover">`;
            }
            btn.addEventListener('click', () => {
                showDetailMedia(i);
                startDetailAutoplay();
            });
            detailThumbs.appendChild(btn);
        });

        projectDetail.scrollTop = 0;
        projectDetail.classList.remove('translate-y-full');
        projectDetail.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        if (lenis && typeof lenis.stop === 'function') lenis.stop();
        startDetailAutoplay();

        gsap.fromTo('#projectDetail .detail-reveal',
            { y: 28, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.08, ease: 'power3.out', delay: 0.2 }
        );
    };

    // Ensure page is interactive if a previous session left Lenis stopped
    unlockPageScroll();

    detailPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        showDetailMedia(activeDetail.index - 1);
        startDetailAutoplay();
    });

    detailNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showDetailMedia(activeDetail.index + 1);
        startDetailAutoplay();
    });

    // Swipe left/right through project media on touch
    const detailStage = detailImg.parentElement;
    if (detailStage) {
        let touchStartX = 0;
        let touchStartY = 0;

        detailStage.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
        }, { passive: true });

        detailStage.addEventListener('touchend', (e) => {
            if (activeDetail.media.length < 2) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            // Ignore mostly-vertical gestures so the overlay can still scroll
            if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
            showDetailMedia(activeDetail.index + (dx < 0 ? 1 : -1));
            startDetailAutoplay();
        }, { passive: true });
    }

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

    closeDetail.addEventListener('click', closeProjectDetail);

    document.addEventListener('keydown', (e) => {
        if (!projectDetail.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeProjectDetail();
        if (e.key === 'ArrowLeft') {
            showDetailMedia(activeDetail.index - 1);
            startDetailAutoplay();
        }
        if (e.key === 'ArrowRight') {
            showDetailMedia(activeDetail.index + 1);
            startDetailAutoplay();
        }
    });

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

    // 8. Navigation & Fullscreen Menu
    const menuToggle = document.querySelector('#menuToggle');
    const fsMenu = document.querySelector('#fsMenu');
    const menuLinks = document.querySelectorAll('.menu-link');
    let menuOpen = false;

    menuToggle.addEventListener('click', () => {
        menuOpen = !menuOpen;
        if (menuOpen) {
            fsMenu.classList.remove('translate-x-full');
            gsap.to(menuLinks, {
                x: 0,
                opacity: 1,
                stagger: 0.1,
                delay: 0.5,
                duration: 0.8,
                ease: "power4.out"
            });
            // Animate menu toggle icon
            gsap.to('#menuToggle span:nth-child(1)', { rotate: 45, y: 6, duration: 0.3 });
            gsap.to('#menuToggle span:nth-child(2)', { opacity: 0, duration: 0.3 });
            gsap.to('#menuToggle span:nth-child(3)', { rotate: -45, y: -6, duration: 0.3 });
        } else {
            fsMenu.classList.add('translate-x-full');
            gsap.to(menuLinks, { x: 20, opacity: 0, duration: 0.5 });
            gsap.to('#menuToggle span', { rotate: 0, y: 0, opacity: 1, duration: 0.3 });
        }
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuOpen = false;
            fsMenu.classList.add('translate-x-full');
            gsap.to('#menuToggle span', { rotate: 0, y: 0, opacity: 1, duration: 0.3 });
        });
    });

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
    })();

    // 8c. Mobile project carousel dots
    (function initProjectDots() {
        const scroller = document.querySelector('.horizontal-scroll-container');
        const dotsWrap = document.querySelector('#projectDots');
        const items = Array.from(document.querySelectorAll('.horizontal-item'));
        if (!scroller || !dotsWrap || !items.length) return;

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
            items.forEach((item, i) => {
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
            items.forEach((_, i) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'project-dot' + (i === 0 ? ' is-active' : '');
                btn.setAttribute('aria-label', 'Go to project ' + (i + 1));
                btn.addEventListener('click', () => {
                    items[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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
                setContactStatus('املأ الاسم والإيميل والرسالة', '#f87171');
                return;
            }

            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!emailOk) {
                setContactStatus('الإيميل مش صحيح', '#f87171');
                return;
            }

            const text = [
                `مرحبا عبدالرحمن، أنا ${name}`,
                `الإيميل: ${email}`,
                '',
                message
            ].join('\n');

            const waUrl = `https://wa.me/201127273643?text=${encodeURIComponent(text)}`;
            const opened = window.open(waUrl, '_blank', 'noopener');
            if (!opened) window.location.href = waUrl;
            setContactStatus('هيفتح واتساب لإرسال الرسالة ✓', '#34d399');
            contactForm.reset();
        });
    }
});
