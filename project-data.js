/* Shared case-study copy, media, and skill badges. Both the home slider and
   the archive overlay read from here so a project only has one source of truth. */
window.SKILL_ICONS = {
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
    'Firebase': { slug: 'firebase', color: 'ffca28' },
    'Bootstrap': { slug: 'bootstrap', color: '7952b3' },
    'AOS': { slug: 'css3', color: '1572b6' }
};

window.PROJECT_DATA = {
    "T4T STORE": {
        desc: "منصة متكاملة لبراند \"تي فور تي\" لاستعراض وبيع منتجات الشاي الفاخرة، تتميز بنظام سلة تسوق ذكي، وتتبع مباشر لحالة الطلبات والتوصيل.",
        descEn: "A complete store for the T4T tea brand, with a smart cart and live tracking from checkout to delivery.",
        stack: ["Angular", "TypeScript", "Node.js", "Express", "Tailwind CSS"],
        features: [
            "سلة تسوق ذكية بتحديث فوري للكميات والأسعار",
            "تتبع مباشر لحالة الطلب من التأكيد حتى التوصيل",
            "كتالوج منتجات فاخر يبرز نكهات الشاي بهوية بصرية نظيفة",
            "رحلة شراء مبسطة من التصفح للدفع بدون تعقيد"
        ],
        featuresEn: [
            "Smart cart with live quantity and price updates",
            "Order tracking from confirmation to delivery",
            "A clean catalog that puts the tea flavors first",
            "A short path from browsing to checkout"
        ],
        ideas: [
            "ربط هوية البراند الفاخرة بتجربة تجارة إلكترونية سريعة وواضحة",
            "شفافية كاملة للعميل عبر تتبع الطلب لحظة بلحظة",
            "واجهة minimalist تركّز على المنتج بدل الإزعاج البصري"
        ],
        ideasEn: [
            "Carry a luxury brand into a fast, clear shopping flow",
            "Full transparency through live order tracking",
            "A minimal interface that keeps the product in focus"
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
        descEn: "A live auction platform with second-by-second bids, a points system, and a dashboard for realtime countdowns.",
        stack: ["Angular", "TypeScript", "Node.js", "Express", "Socket.io", "Tailwind CSS"],
        features: [
            "مزايدات حية تتحدث بالثانية عبر Socket.io بدون إعادة تحميل",
            "عدّاد تنازلي متزامن لكل المستخدمين في نفس الجلسة",
            "نظام نقاط دقيق لإدارة الرصيد والمزايدات",
            "لوحة تحكم احترافية لمراقبة العمليات المباشرة والمعاملات"
        ],
        featuresEn: [
            "Live bids over Socket.io with no page refresh",
            "A shared countdown across every open session",
            "A precise points system for balance and bidding",
            "An admin dashboard for live operations"
        ],
        ideas: [
            "منصة مزاد realtime كاملة بدون ريفرش للصفحة",
            "مزامنة العدّاد عبر كل الجلسات النشطة في نفس اللحظة",
            "تجربة مزاد تنافسية أقرب للبث المباشر من المواقع التقليدية"
        ],
        ideasEn: [
            "A full realtime auction without reloading the page",
            "One countdown kept in sync for every active session",
            "A competitive feel closer to a live stream than a classic site"
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
        descEn: "A luxury digital face for Fortno car care, mixing Arabic elegance with a refined interactive experience.",
        stack: ["Angular", "TypeScript", "Tailwind CSS", "GSAP"],
        features: [
            "واجهة فاخرة تعكس جودة خدمات العناية بالسيارات",
            "دمج هوية \"شياكة\" العربية داخل تصميم ويب عصري",
            "معرض صور عالي الدقة للنتائج والخدمات",
            "تجربة متجاوبة كاملة للجوال والديسكتوب"
        ],
        featuresEn: [
            "A luxury interface that matches the quality of the service",
            "Arabic brand identity inside a modern web layout",
            "A high-resolution gallery for results and services",
            "A fully responsive experience on phone and desktop"
        ],
        ideas: [
            "ترجمة الفخامة العربية إلى لغة ويب حديثة بدون فقدان الهوية",
            "تجربة بصرية cinematic تقنع بالجودة قبل الحجز",
            "تحسين تحميل الأصول لمعارض الصور عالية الدقة"
        ],
        ideasEn: [
            "Translate Arabic luxury into a modern web language",
            "A cinematic first impression before the booking",
            "Careful loading for large photo galleries"
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
        descEn: "The official site for Al Hendal Holding, with full Arabic/English RTL-LTR support and GSAP motion.",
        stack: ["Angular", "TypeScript", "ngx-translate", "GSAP", "AOS", "Tailwind CSS"],
        features: [
            "دعم كامل للعربية والإنجليزية مع تبديل RTL/LTR",
            "أنيميشن مؤسسي متقدم بـ GSAP و AOS",
            "بنية ترجمة مركزية قابلة للتوسع عبر صفحات المجموعة",
            "حضور رقمي يعكس هوية هولدينج متعدد الأنشطة"
        ],
        featuresEn: [
            "Full Arabic and English with RTL/LTR switching",
            "Corporate motion with GSAP and AOS",
            "A central translation layer that scales across pages",
            "A digital presence that fits a multi-activity holding"
        ],
        ideas: [
            "تبديل اتجاه الصفحة بسلاسة بدون كسر التخطيط أو الأنيميشن",
            "حركة GSAP تحافظ على الفخامة المؤسسية بدل التأثيرات الاستعراضية",
            "معمارية Angular قابلة لإعادة الاستخدام عبر مشاريع الهولدينج"
        ],
        ideasEn: [
            "Switch page direction without breaking layout or motion",
            "GSAP that keeps a corporate tone instead of showing off",
            "An Angular setup that can be reused across group sites"
        ],
        link: "https://alhendalgroup.com/",
        tag: "Al Hendal Holding Group",
        images: [
            "assets/imges/a1.png",
            "assets/imges/a2.png"
        ]
    },
    "BUBBLE HOPE": {
        desc: "منصة تسوق إلكترونية متطورة مصممة لتجربة تصفح سلسة، تهدف إلى تسهيل عمليات عرض وبيع المنتجات عبر واجهة مستخدم عصرية وأنيقة.",
        descEn: "An e-commerce platform built for smooth browsing and a clear path from product to purchase.",
        stack: ["Angular", "TypeScript", "Node.js", "Tailwind CSS"],
        features: [
            "تصفح متعدد الفئات بتجربة سلسة وسريعة",
            "واجهة عصرية لعرض وبيع المنتجات بوضوح",
            "تنقل واضح ونقاط تفاعل آمنة للمستخدم",
            "تجربة تسوق مبسطة ومتجاوبة على كل الشاشات"
        ],
        featuresEn: [
            "Fast browsing across multiple categories",
            "A modern layout that keeps products easy to scan",
            "Clear navigation and safe interaction points",
            "A simple shopping flow on every screen size"
        ],
        ideas: [
            "تبسيط رحلة الشراء لتقليل خطوات التحويل",
            "تصميم يعطي أولوية للمنتج مع حركة ناعمة غير مشتتة",
            "تجربة تصفح أقرب للتطبيق من المواقع التقليدية"
        ],
        ideasEn: [
            "Fewer steps between interest and checkout",
            "Motion that stays quiet so the product stays first",
            "A browsing feel closer to an app than a classic shop"
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
        descEn: "A dark-mode platform for a Saudi events house, built to showcase large productions like Boulevard World.",
        stack: ["JavaScript", "GSAP", "Tailwind CSS", "HTML5"],
        features: [
            "Dark Mode فاخر يناسب هوية الفعاليات الليلية",
            "بورتفوليو بصري لمشاريع ضخمة مثل Boulevard World",
            "أنيميشن GSAP سينمائي مرتبط بالتمرير",
            "تصميم متجاوب لعرض الفعاليات الكبرى بوضوح"
        ],
        featuresEn: [
            "A luxury dark mode that fits night-time events",
            "A visual portfolio for large productions like Boulevard World",
            "Cinematic GSAP tied to scroll",
            "A responsive layout that keeps big events readable"
        ],
        ideas: [
            "الهوية الليلية كتجربة كاملة وليس مجرد ثيم داكن",
            "سرد بصري للفعاليات الكبرى بدل الكتالوج التقليدي",
            "حركة GSAP تربط المشاهد كأنها عرض حدث حي"
        ],
        ideasEn: [
            "Night identity as a full experience, not just a dark theme",
            "Tell the event story visually instead of a catalog",
            "GSAP that links scenes like a live show"
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
    "ALAMANA": {
        desc: "متجر إلكتروني متكامل لشركة \"الأمانة لمواد البناء\"، متخصص في العزل المائي ولواصق البلاط والترويبات ومواد الترميم، بكتالوج تفاعلي وواجهة ثنائية اللغة تخدم فروع الشركة في الكويت ومصر وعمان وتركيا.",
        descEn: "A full store for Alamana Building Materials — waterproofing, tile adhesives, grouts and repair products — with an interactive catalog and a bilingual interface serving branches in Kuwait, Egypt, Oman and Turkey.",
        stack: ["Angular", "TypeScript", "Bootstrap", "Tailwind CSS", "SEO"],
        features: [
            "متجر كامل بسلة شراء وتسجيل دخول وسجل للطلبات السابقة",
            "كتالوج تفاعلي بتقليب الصفحات مع تحميل وطباعة المواصفات",
            "تبديل اللغة عربي/إنجليزي وتبديل البلد بين الكويت ومصر وعمان وتركيا",
            "بحث بالاسم العربي أو الإنجليزي وتصفية بالأقسام: لواصق، عوازل، ترميم"
        ],
        featuresEn: [
            "A full store with cart, login and a previous-orders history",
            "An interactive page-flip catalog with download and print",
            "Arabic/English switching plus a country switch for Kuwait, Egypt, Oman and Turkey",
            "Search by Arabic or English name with category filters for adhesives, insulation and repair"
        ],
        ideas: [
            "تحويل الكتالوج المطبوع لتجربة تفاعلية داخل الموقع بدل ملف PDF",
            "واجهة واحدة تخدم أربع أسواق بلغتين بدون تكرار المحتوى",
            "بحث يفهم أسماء مواد البناء بالعربي والإنجليزي معًا"
        ],
        ideasEn: [
            "Turn the printed catalog into an in-site experience instead of a PDF",
            "One interface serving four markets in two languages without duplicated content",
            "Search that understands material names in both Arabic and English"
        ],
        link: "https://alamanamarket.com/",
        tag: "Alamana Building Materials",
        images: [
            "assets/imges/am1.jpg",
            "assets/imges/am2.jpg",
            "assets/imges/am3.jpg",
            "assets/imges/am4.jpg"
        ]
    },
    "GULF FOOD": {
        desc: "واجهة رقمية متكاملة لمصنع أغذية رائد، تركز على استعراض جودة المخبوزات والمنتجات الغذائية بتصميم بصري جذاب، مع تنظيم دقيق للأقسام التعريفية وقوائم المنتجات والشهادات العالمية.",
        descEn: "A digital face for a leading food factory, with catalog pages, certificates, and a clear look at product quality.",
        stack: ["Angular", "TypeScript", "Tailwind CSS", "HTML5"],
        features: [
            "كتالوج منظم للمخبوزات والمنتجات الغذائية",
            "عرض الشهادات ومعايير الجودة العالمية",
            "أقسام تعريفية واضحة عن المصنع والإنتاج",
            "تصميم RTL بصري يبرز جودة المنتج قبل التفاصيل"
        ],
        featuresEn: [
            "An organized catalog for bakery and food products",
            "Certificates and global quality standards on display",
            "Clear sections about the factory and production",
            "An RTL visual design that shows quality before the details"
        ],
        ideas: [
            "موقع مصنع أغذية يبني الثقة بصريًا عبر الشهادات والجودة",
            "تنظيم الكتالوج ليخدم العملاء والشركاء معًا",
            "هوية خليجية حديثة بعيدًا عن قوالب مواقع المصانع التقليدية"
        ],
        ideasEn: [
            "Build trust visually through certificates and quality",
            "A catalog that serves both clients and partners",
            "A modern Gulf identity away from generic factory templates"
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
