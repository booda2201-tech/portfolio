/* Case-study overlay used on both the home slider and the archive page.
   Call window.initProjectDetail() once the #projectDetail markup is in the DOM. */
(function () {
    const isSmallScreen = () => window.__IS_MOBILE__ || window.matchMedia('(max-width: 767px)').matches;

    const getLenis = () => window.__lenis || null;

    window.getProjectMedia = (data, fallbackSrc) => {
        let media = [];
        if (data && data.media && data.media.length) {
            media = data.media;
        } else if (data && data.images && data.images.length) {
            media = data.images.map((src) => ({ type: 'image', src }));
        } else if (fallbackSrc) {
            media = [{ type: 'image', src: fallbackSrc }];
        }

        // On phones show a lightweight image first so opening a project never
        // starts by downloading a multi-megabyte reel.
        if (isSmallScreen() && media.some((m) => m.type === 'video')) {
            media = [
                ...media.filter((m) => m.type !== 'video'),
                ...media.filter((m) => m.type === 'video')
            ];
        }

        return media;
    };

    window.initProjectDetail = () => {
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
        const skillIcons = window.SKILL_ICONS || {};

        if (!projectDetail || !detailImg) {
            window.openProjectDetail = () => {};
            window.closeProjectDetail = () => {};
            return;
        }

        let activeDetail = { media: [], index: 0 };
        let detailAutoplay = null;
        let overlayPushed = false;

        const fadeTargets = () => [detailImg, detailVideo].filter(Boolean);

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

            const run = () => {
                renderDetailMedia(item);
                if (typeof gsap !== 'undefined') {
                    gsap.to(fadeTargets(), { opacity: 1, duration: 0.2 });
                }
            };

            if (typeof gsap !== 'undefined') {
                gsap.to(fadeTargets(), {
                    opacity: 0,
                    duration: 0.15,
                    onComplete: run
                });
            } else {
                run();
            }

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
            const lenis = getLenis();
            if (lenis && typeof lenis.start === 'function') lenis.start();
        };

        const stripProjectQuery = () => {
            const url = new URL(location.href);
            if (!url.searchParams.has('project')) return;
            url.searchParams.delete('project');
            const next = url.pathname + (url.search || '') + url.hash;
            history.replaceState(null, '', next);
        };

        const closeProjectDetail = ({ fromPop } = {}) => {
            if (!projectDetail.classList.contains('is-open')) return;
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
            if (!fromPop && overlayPushed) {
                overlayPushed = false;
                history.back();
                return;
            }
            overlayPushed = false;
            stripProjectQuery();
        };

        const openProjectDetail = (title, dataFull, fallbackSrc, { fromQuery } = {}) => {
            stopDetailAutoplay();
            const data = dataFull || (window.PROJECT_DATA && window.PROJECT_DATA[title]) || {};
            activeDetail = { media: window.getProjectMedia(data, fallbackSrc), index: 0 };

            detailTitle.innerText = title;
            detailTag.innerText = data.tag || 'Project';
            const isAr = typeof window.getLang === 'function' && window.getLang() === 'ar';
            detailDesc.innerText = (isAr ? data.desc : (data.descEn || data.desc)) || '';
            detailDesc.dir = isAr ? 'rtl' : 'ltr';
            detailFeatures.dir = isAr ? 'rtl' : 'ltr';
            detailIdeas.dir = isAr ? 'rtl' : 'ltr';
            detailCounter.innerText = `1 / ${activeDetail.media.length || 1}`;
            renderDetailMedia(activeDetail.media[0]);

            const hasLink = data.link && data.link !== '#';
            if (hasLink) {
                detailActions.style.display = '';
                detailLink.href = data.link;
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
            (data.stack || []).forEach((s) => {
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

            renderPointList(detailFeatures, isAr ? data.features : (data.featuresEn || data.features));
            renderPointList(detailIdeas, isAr ? data.ideas : (data.ideasEn || data.ideas));

            const featuresWrap = detailFeatures.closest('.detail-reveal');
            const ideasWrap = detailIdeas.closest('.detail-reveal');
            if (featuresWrap) featuresWrap.style.display = (data.features && data.features.length) ? '' : 'none';
            if (ideasWrap) ideasWrap.style.display = (data.ideas && data.ideas.length) ? '' : 'none';

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
            const lenis = getLenis();
            if (lenis && typeof lenis.stop === 'function') lenis.stop();
            startDetailAutoplay();

            if (typeof gsap !== 'undefined') {
                gsap.fromTo('#projectDetail .detail-reveal',
                    { y: 28, autoAlpha: 0 },
                    { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.08, ease: 'power3.out', delay: 0.2 }
                );
            }

            const url = new URL(location.href);
            const current = (url.searchParams.get('project') || '').toUpperCase();
            if (current !== String(title).toUpperCase()) {
                url.searchParams.set('project', title);
                history.pushState({ project: title }, '', url.pathname + url.search + url.hash);
                overlayPushed = true;
            } else {
                overlayPushed = !fromQuery;
            }
        };

        window.openProjectDetail = openProjectDetail;
        window.closeProjectDetail = closeProjectDetail;

        unlockPageScroll();

        closeDetail.addEventListener('click', () => closeProjectDetail());

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
                if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
                showDetailMedia(activeDetail.index + (dx < 0 ? 1 : -1));
                startDetailAutoplay();
            }, { passive: true });
        }

        window.addEventListener('popstate', () => {
            if (!projectDetail.classList.contains('is-open')) return;
            overlayPushed = false;
            closeProjectDetail({ fromPop: true });
        });
    };
})();
