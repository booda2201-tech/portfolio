/* Renders the full project archive. Blurbs reuse the home page i18n keys so a
   project description only ever lives in one place. */

const ARCHIVE_PROJECTS = [
    {
        key: 'T4T STORE',
        title: 'T4T STORE',
        tag: 'T4T — Tea E-commerce',
        blurb: 'proj.t4t',
        category: 'ecom',
        cover: 'T4TEA/T41.webp',
        video: 'T4TEA/T4TEA.webm',
        stack: ['Angular', 'TypeScript', 'Node.js', 'Tailwind CSS'],
        link: 'https://darkslateblue-dove-147065.hostingersite.com/'
    },
    {
        key: 'REBHNY',
        title: 'REBHNY',
        tag: 'Real-time Auction System',
        blurb: 'proj.rebhny',
        category: 'realtime',
        cover: 'assets/imges/r1.png',
        stack: ['Angular', 'Socket.io', 'Node.js', 'Express'],
        link: '#'
    },
    {
        key: 'AL HENDAL',
        title: 'AL HENDAL',
        tag: 'Al Hendal Holding Group',
        blurb: 'proj.hendal',
        category: 'corporate',
        cover: 'assets/imges/a1.png',
        stack: ['Angular', 'ngx-translate', 'GSAP', 'AOS'],
        link: 'https://alhendalgroup.com/'
    },
    {
        key: 'ALAMANA',
        title: 'ALAMANA',
        tag: 'Alamana Building Materials',
        blurb: 'proj.alamana',
        category: 'ecom',
        cover: 'assets/imges/am1.jpg',
        stack: ['Angular', 'TypeScript', 'Bootstrap', 'Tailwind CSS'],
        link: 'https://alamanamarket.com/'
    },
    {
        key: 'BUBBLE HOPE',
        title: 'BUBBLE HOPE',
        tag: 'Bubble Hope',
        blurb: 'proj.bubble',
        category: 'ecom',
        cover: 'Bubble/BB1.webp',
        video: 'Bubble/Bubble.webm',
        stack: ['Angular', 'TypeScript', 'Node.js', 'Tailwind CSS'],
        link: 'https://www.bubblehope.com'
    },
    {
        key: 'MOONLIGHT',
        title: 'MOONLIGHT',
        tag: 'Moonlight Events',
        blurb: 'proj.moon',
        category: 'creative',
        cover: 'assets/imges/moon1.png',
        stack: ['JavaScript', 'GSAP', 'Tailwind CSS', 'HTML5'],
        link: 'https://moonlight.sa'
    },
    {
        key: 'FORTNO',
        title: 'FORTNO',
        tag: 'Fortno Car Care',
        blurb: 'proj.fortno',
        category: 'corporate',
        cover: 'assets/imges/f1.png',
        stack: ['Angular', 'TypeScript', 'GSAP', 'Tailwind CSS'],
        link: '#'
    },
    {
        key: 'GULF FOOD',
        title: 'GULF FOOD',
        tag: 'Gulf Food Factory',
        blurb: 'proj.gulf',
        category: 'corporate',
        cover: 'assets/imges/gf1.png',
        stack: ['Angular', 'TypeScript', 'Tailwind CSS', 'HTML5'],
        link: 'https://gcfoodfactory.com'
    }
];

const ARCHIVE_FILTERS = [
    { id: 'all', label: 'all.filterAll' },
    { id: 'ecom', label: 'cat.ecom' },
    { id: 'realtime', label: 'cat.realtime' },
    { id: 'corporate', label: 'cat.corporate' },
    { id: 'creative', label: 'cat.creative' }
];

const ARROW_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13"/><path d="m12 5 7 7-7 7"/></svg>';

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('#projectsGrid');
    const list = document.querySelector('#projectsIndex');
    const filterWrap = document.querySelector('#archiveFilters');
    const empty = document.querySelector('#archiveEmpty');
    if (!grid) return;

    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasGsap = typeof gsap !== 'undefined';
    const hasFlip = hasGsap && typeof Flip !== 'undefined';

    if (hasGsap && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    const pad = (n) => String(n).padStart(2, '0');
    const countEl = document.querySelector('#archiveCount');
    const liveEl = document.querySelector('#archiveLive');
    if (countEl) countEl.textContent = pad(ARCHIVE_PROJECTS.length);
    if (liveEl) liveEl.textContent = pad(ARCHIVE_PROJECTS.filter(p => p.link && p.link !== '#').length);

    const reveal = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            reveal.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

    const buildCard = (project, index) => {
        const card = document.createElement('article');
        card.className = 'pcard';
        card.dataset.category = project.category;

        const caseUrl = 'index.html?project=' + encodeURIComponent(project.key);
        const hasLive = project.link && project.link !== '#';

        const media = document.createElement('a');
        media.className = 'pcard-media';
        media.href = caseUrl;
        media.setAttribute('aria-label', project.title);
        media.innerHTML = `
            <img src="${project.cover}" alt="${project.title}" loading="lazy" decoding="async">
            ${project.video ? `<video src="${project.video}" muted loop playsinline preload="none"></video>` : ''}
            <span class="pcard-index">${pad(index + 1)}</span>
            <span class="pcard-cat" data-i18n="cat.${project.category}">${window.t('cat.' + project.category)}</span>
            <span class="pcard-open" aria-hidden="true">${ARROW_ICON}</span>
        `;

        const body = document.createElement('div');
        body.className = 'pcard-body';
        body.innerHTML = `
            <h2 class="pcard-title">${project.title}</h2>
            <p class="pcard-tag">${project.tag}</p>
            <p class="pcard-blurb" data-i18n="${project.blurb}">${window.t(project.blurb)}</p>
            <div class="pcard-stack">${project.stack.map(s => `<span>${s}</span>`).join('')}</div>
            <div class="pcard-actions">
                <a class="pcard-btn" href="${caseUrl}" data-i18n="all.case">${window.t('all.case')}</a>
                ${hasLive ? `<a class="pcard-btn is-ghost" href="${project.link}" target="_blank" rel="noopener noreferrer" data-i18n="all.liveSite">${window.t('all.liveSite')}</a>` : ''}
            </div>
        `;

        card.append(media, body);

        if (project.video && !isTouch) {
            const video = card.querySelector('video');
            card.addEventListener('mouseenter', () => {
                card.classList.add('is-playing');
                video.play().catch(() => {});
            });
            card.addEventListener('mouseleave', () => {
                card.classList.remove('is-playing');
                video.pause();
            });
        }

        return card;
    };

    const buildRow = (project, index) => {
        const row = document.createElement('a');
        row.className = 'pindex-row';
        row.dataset.category = project.category;
        row.dataset.cover = project.cover;
        row.href = 'index.html?project=' + encodeURIComponent(project.key);
        row.innerHTML = `
            <span class="pindex-num">${pad(index + 1)}</span>
            <span class="pindex-title">${project.title}</span>
            <span class="pindex-meta">
                <span class="pindex-stack">${project.stack.slice(0, 2).join(' · ')}</span>
                <span class="pindex-cat" data-i18n="cat.${project.category}">${window.t('cat.' + project.category)}</span>
            </span>
            <span class="pindex-arrow" aria-hidden="true">${ARROW_ICON}</span>
        `;
        return row;
    };

    ARCHIVE_PROJECTS.forEach((project, index) => {
        const card = buildCard(project, index);
        grid.appendChild(card);
        reveal.observe(card);
        if (list) list.appendChild(buildRow(project, index));
    });

    const items = () => [
        ...grid.querySelectorAll('.pcard'),
        ...(list ? list.querySelectorAll('.pindex-row') : [])
    ];

    let currentView = document.documentElement.dataset.view === 'index' ? 'index' : 'grid';

    const activeContainer = () => (currentView === 'index' && list ? list : grid);
    const visibleContainerItems = () => [
        ...activeContainer().querySelectorAll('.pcard, .pindex-row')
    ];

    // Guards the pinned height against an older filter run finishing late and
    // releasing it while a newer one is still animating.
    let filterRun = 0;

    const applyFilter = (id) => {
        // Flip measures the old positions, then animates every surviving item to
        // its new slot instead of letting the layout jump. Only the container on
        // screen is measured — a hidden one has no geometry to animate.
        const host = activeContainer();
        const shell = host.closest('main') || host;
        const state = hasFlip && !reduceMotion ? Flip.getState(visibleContainerItems()) : null;
        const fromHeight = state ? shell.getBoundingClientRect().height : 0;
        let shown = 0;

        items().forEach((el) => {
            const match = id === 'all' || el.dataset.category === id;
            el.hidden = !match;
            if (!match) return;
            el.classList.add('is-in');
            if (el.classList.contains('pcard')) shown += 1;
        });

        if (state) {
            // absolute:true lifts the cards out of the flow, so without a pinned
            // height the section collapses and everything below it (marquee, CTA)
            // snaps up the page and back again. The shell keeps its own animated
            // height instead, so the page below only ever glides.
            const toHeight = shell.getBoundingClientRect().height;
            const run = ++filterRun;
            gsap.killTweensOf(shell);
            shell.style.overflow = 'hidden';
            shell.style.height = fromHeight + 'px';

            // The CSS reveal transition would fight GSAP's per-frame writes and
            // smear the motion, so it is parked for the duration of the Flip.
            host.classList.add('is-flipping');
            const flip = Flip.from(state, {
                duration: 0.6,
                ease: 'power2.inOut',
                absolute: true,
                stagger: 0.03,
                onEnter: (els) => gsap.fromTo(els,
                    { opacity: 0, scale: 0.92 },
                    { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }),
                onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.25 })
            });

            // The stagger makes the Flip outlast its own duration, so the pin has
            // to survive until the very last card is back in the flow.
            gsap.to(shell, {
                height: toHeight,
                duration: Math.max(flip.duration(), 0.6),
                ease: 'power2.inOut'
            });

            const release = () => {
                if (run !== filterRun) return;
                shell.style.height = '';
                shell.style.overflow = '';

                // Flip clears its inline transform/opacity as it ends. Re-enabling
                // the CSS transition in that same frame makes the browser animate
                // the hand-off, which replays the reveal as a second pass, so the
                // styles are handed back a frame later with motion still parked.
                requestAnimationFrame(() => {
                    if (run !== filterRun) return;
                    items().forEach((el) => { el.style.transitionDelay = ''; });
                    host.classList.remove('is-flipping');
                    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                });
            };

            flip.eventCallback('onComplete', release);
            // Safety net for an interrupted timeline that never reports completion.
            gsap.delayedCall(flip.duration() + 0.2, release);
        }

        filterWrap.querySelectorAll('.archive-chip').forEach((chip) => {
            chip.classList.toggle('is-active', chip.dataset.filter === id);
        });

        if (empty) empty.hidden = shown > 0;
    };

    ARCHIVE_FILTERS.forEach((filter) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'archive-chip' + (filter.id === 'all' ? ' is-active' : '');
        chip.dataset.filter = filter.id;
        chip.dataset.i18n = filter.label;
        chip.textContent = window.t(filter.label);
        chip.addEventListener('click', () => applyFilter(filter.id));
        filterWrap.appendChild(chip);
    });

    document.querySelectorAll('#langToggle [data-lang]').forEach((btn) => {
        btn.addEventListener('click', () => window.applyLang(btn.dataset.lang));
    });

    window.applyLang(window.getLang());

    // --- Grid / Index layout switch ---
    (function initViewToggle() {
        const toggle = document.querySelector('#viewToggle');
        if (!toggle) return;
        const buttons = [...toggle.querySelectorAll('button')];
        let staggerCleanup = 0;

        const setView = (view) => {
            currentView = view === 'index' ? 'index' : 'grid';
            document.documentElement.dataset.view = currentView;
            buttons.forEach((btn) => {
                const on = btn.dataset.view === currentView;
                btn.classList.toggle('is-active', on);
                btn.setAttribute('aria-pressed', String(on));
            });
            try { localStorage.setItem('archiveView', currentView); } catch (_) {}

            // The container was display:none, so its items never tripped the
            // scroll observer — stagger them in now that they have geometry.
            const shown = visibleContainerItems().filter((el) => !el.hidden);
            shown.forEach((el, i) => {
                el.style.transitionDelay = reduceMotion ? '0ms' : `${Math.min(i, 8) * 55}ms`;
                el.classList.add('is-in');
            });

            // A stale delay left on the element would postpone every later
            // transition on it, including the filter hand-off.
            clearTimeout(staggerCleanup);
            staggerCleanup = setTimeout(() => {
                shown.forEach((el) => { el.style.transitionDelay = ''; });
            }, 1200);

            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        };

        buttons.forEach((btn) => {
            btn.addEventListener('click', () => setView(btn.dataset.view));
        });

        setView(currentView);
    })();

    // --- Index view: artwork preview trailing the pointer ---
    (function initHoverPreview() {
        const preview = document.querySelector('#hoverPreview');
        if (isTouch || !list || !preview) return;
        const img = preview.querySelector('img');

        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let x = targetX;
        let y = targetY;
        let scale = 0.85;
        let on = false;

        window.addEventListener('pointermove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        }, { passive: true });

        list.addEventListener('pointerover', (e) => {
            const row = e.target.closest('.pindex-row');
            if (!row || !row.dataset.cover) return;
            list.classList.add('is-hovering');
            if (img.getAttribute('src') !== row.dataset.cover) img.src = row.dataset.cover;
            on = true;
            preview.classList.add('is-on');
        });

        list.addEventListener('pointerleave', () => {
            list.classList.remove('is-hovering');
            on = false;
            preview.classList.remove('is-on');
        });

        const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

        const tick = () => {
            const prevX = x;
            x += (targetX - x) * 0.12;
            y += (targetY - y) * 0.12;
            scale += ((on ? 1 : 0.85) - scale) * 0.15;
            // Leaning into the direction of travel is what makes it feel physical.
            const tilt = clamp((x - prevX) * 0.5, -14, 14);
            preview.style.transform =
                `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${tilt}deg) scale(${scale})`;
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    })();

    // --- Grid view: spotlight tracking the pointer inside each card ---
    (function initSpotlight() {
        if (isTouch) return;
        grid.querySelectorAll('.pcard').forEach((card) => {
            let rect = null;
            card.addEventListener('pointerenter', () => {
                rect = card.getBoundingClientRect();
            });
            card.addEventListener('pointermove', (e) => {
                if (!rect) rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                card.style.setProperty('--my', `${e.clientY - rect.top}px`);
            }, { passive: true });
            card.addEventListener('pointerleave', () => {
                rect = null;
            });
        });
    })();

    // --- Intro + scroll motion ---
    (function initMotion() {
        if (!hasGsap || reduceMotion) return;

        gsap.timeline({ defaults: { ease: 'power3.out' } })
            .from('.archive-title', { yPercent: 118, duration: 1.1 })
            .from('.archive-eyebrow-rule', { scaleX: 0, transformOrigin: 'left center', duration: 0.7 }, 0.15)
            .from('.archive-eyebrow span:last-child', { opacity: 0, y: 12, duration: 0.6 }, 0.25)
            .from('.archive-lead', { opacity: 0, y: 18, duration: 0.7 }, 0.4)
            .from('.archive-stat', { opacity: 0, y: 22, duration: 0.6, stagger: 0.08 }, 0.5);

        if (typeof ScrollTrigger === 'undefined') return;

        const rtl = document.documentElement.dir === 'rtl';
        gsap.to('#archiveGhost', {
            xPercent: rtl ? 16 : -16,
            ease: 'none',
            scrollTrigger: {
                trigger: '.archive-head',
                start: 'top top',
                end: 'bottom top',
                scrub: 0.6
            }
        });
    })();

    // --- Page chrome: nav state, progress bar, back to top ---
    (function initChrome() {
        const nav = document.querySelector('#archiveNav');
        const progress = document.querySelector('#scrollProgress');
        const backToTop = document.querySelector('#backToTop');
        let raf = null;

        const update = () => {
            raf = null;
            const y = window.scrollY;
            if (nav) nav.classList.toggle('is-scrolled', y > 24);
            if (progress) {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
            }
            if (backToTop) {
                const on = y > 600;
                backToTop.classList.toggle('opacity-0', !on);
                backToTop.classList.toggle('translate-y-10', !on);
            }
        };

        window.addEventListener('scroll', () => {
            if (raf === null) raf = requestAnimationFrame(update);
        }, { passive: true });
        update();

        if (backToTop) {
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
            });
        }
    })();

    // The tab bar highlight is static here (the archive *is* the work section),
    // but it still needs measuring once the bar has been laid out.
    (function initMobileNavPill() {
        const mobileNav = document.querySelector('#mobileNav');
        if (!mobileNav) return;
        const pill = mobileNav.querySelector('.mnav-pill');
        const active = mobileNav.querySelector('.mnav-item.is-active');
        if (!pill || !active) return;

        const place = () => {
            if (!active.offsetWidth) return;
            pill.style.width = `${active.offsetWidth}px`;
            pill.style.transform = `translateX(${active.offsetLeft - 6}px)`;
        };

        requestAnimationFrame(place);
        window.addEventListener('resize', () => requestAnimationFrame(place));
        window.addEventListener('langchange', () => requestAnimationFrame(place));
    })();

    // --- Custom cursor (pointer devices only) ---
    (function initCursor() {
        if (isTouch) return;
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');
        if (!cursor || !follower) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let followX = mouseX;
        let followY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        const tick = () => {
            followX += (mouseX - followX) * 0.15;
            followY += (mouseY - followY) * 0.15;
            cursor.style.transform = `translate(${mouseX - 10}px, ${mouseY - 10}px)`;
            follower.style.transform = `translate(${followX - 20}px, ${followY - 20}px)`;
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        const hoverTargets = '.pcard-media, .pcard-btn, .archive-chip, .archive-back, .archive-cta-btn, .archive-nav-links a, .lang-toggle button, .view-toggle button, #backToTop';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) cursor.classList.add('active');
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverTargets)) cursor.classList.remove('active');
        });
    })();
});
