/**
 * Photoreal solar-system backdrop.
 * Uses Solar System Scope / Three.js planet maps (CC BY 4.0 — Solar System Scope).
 * Local files in /textures/planets for reliability.
 */
(function (global) {
    'use strict';

    const TEX = {
        sun: 'textures/planets/2k_sun.jpg',
        mercury: 'textures/planets/2k_mercury.jpg',
        venus: 'textures/planets/2k_venus_surface.jpg',
        earth: 'textures/planets/earth_atmos_2048.jpg',
        earthNormal: 'textures/planets/earth_normal_2048.jpg',
        earthSpec: 'textures/planets/earth_specular_2048.jpg',
        earthClouds: 'textures/planets/2k_earth_clouds.jpg',
        mars: 'textures/planets/2k_mars.jpg',
        jupiter: 'textures/planets/2k_jupiter.jpg',
        saturn: 'textures/planets/2k_saturn.jpg',
        saturnRing: 'textures/planets/2k_saturn_ring_alpha.png',
        uranus: 'textures/planets/2k_uranus.jpg',
        neptune: 'textures/planets/2k_neptune.jpg',
        stars: 'textures/planets/2k_stars_milky_way.jpg'
    };

    // Compact system — readable up close while still fitting in one frame.
    const PLANETS = [
        { name: 'mercury', radius: 0.3, orbit: 3.6, speed: 1.35, tilt: 0.01, map: 'mercury', rough: 0.95 },
        { name: 'venus', radius: 0.42, orbit: 4.9, speed: 1.0, tilt: 0.03, map: 'venus', rough: 0.72 },
        { name: 'earth', radius: 0.46, orbit: 6.4, speed: 0.85, tilt: 0.41, map: 'earth', rough: 0.48, earth: true },
        { name: 'mars', radius: 0.36, orbit: 8.0, speed: 0.68, tilt: 0.44, map: 'mars', rough: 0.9 },
        { name: 'jupiter', radius: 1.2, orbit: 11.4, speed: 0.36, tilt: 0.05, map: 'jupiter', rough: 0.55 },
        { name: 'saturn', radius: 1.0, orbit: 15.0, speed: 0.26, tilt: 0.47, map: 'saturn', rough: 0.52, rings: true },
        { name: 'uranus', radius: 0.6, orbit: 18.2, speed: 0.18, tilt: 1.0, map: 'uranus', rough: 0.42 },
        { name: 'neptune', radius: 0.58, orbit: 21.2, speed: 0.14, tilt: 0.49, map: 'neptune', rough: 0.45 }
    ];

    const SYSTEM_SCALE = 1.7;
    const SUN_RADIUS = 1.55;
    // Tour stops: overview, sun, then each planet in order. Higher dwell = longer pause.
    const DWELL = 0.45;

    function clamp(v, a, b) {
        return Math.max(a, Math.min(b, v));
    }

    function easeInOut(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    const QUALITY_DESKTOP = {
        lite: false,
        antialias: true,
        maxDpr: 1.75,
        minDpr: 1.75,
        maxTex: 0,
        aniso: 8,
        planetSeg: [72, 56],
        cloudSeg: [64, 48],
        atmoSeg: [48, 32],
        sunSeg: [72, 56],
        ringSeg: 128,
        skySeg: [64, 40],
        drift: 1400,
        earthDetail: true
    };

    // Phones: same tour, cheaper pixels. Textures are downscaled before upload
    // so GPU memory stays well under what mobile Safari tolerates.
    const QUALITY_MOBILE = {
        lite: true,
        antialias: false,
        maxDpr: 1.5,
        minDpr: 0.85,
        maxTex: 1024,
        aniso: 2,
        planetSeg: [40, 28],
        cloudSeg: [36, 24],
        atmoSeg: [28, 18],
        sunSeg: [40, 30],
        ringSeg: 64,
        skySeg: [32, 20],
        drift: 450,
        earthDetail: false
    };

    let Q = QUALITY_DESKTOP;

    function downscale(image, max) {
        if (!max || !image || image.width <= max) return image;
        const c = document.createElement('canvas');
        c.width = max;
        c.height = Math.round(image.height * (max / image.width));
        c.getContext('2d').drawImage(image, 0, 0, c.width, c.height);
        return c;
    }

    function loadTextures(onDone) {
        const loader = new THREE.TextureLoader();
        const keys = Object.keys(TEX).filter(function (key) {
            return Q.earthDetail || (key !== 'earthNormal' && key !== 'earthSpec');
        });
        const out = {};
        let left = keys.length;

        keys.forEach(function (key) {
            loader.load(
                TEX[key],
                function (tex) {
                    tex.image = downscale(tex.image, Q.maxTex);
                    tex.colorSpace = THREE.SRGBColorSpace;
                    tex.anisotropy = Q.aniso;
                    // Normal / specular stay linear
                    if (key === 'earthNormal' || key === 'earthSpec' || key === 'saturnRing') {
                        tex.colorSpace = THREE.NoColorSpace || THREE.LinearSRGBColorSpace;
                    }
                    out[key] = tex;
                    left -= 1;
                    if (left <= 0) onDone(out);
                },
                undefined,
                function () {
                    console.warn('[space] missing texture', TEX[key]);
                    out[key] = null;
                    left -= 1;
                    if (left <= 0) onDone(out);
                }
            );
        });
    }

    function fresnelAtmo(hex, power, intensity) {
        const col = new THREE.Color(hex);
        return new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            uniforms: {
                glowColor: { value: col },
                power: { value: power || 2.8 },
                intensity: { value: intensity || 0.55 }
            },
            vertexShader: [
                'varying vec3 vNormal;',
                'varying vec3 vView;',
                'void main(){',
                '  vNormal = normalize(normalMatrix * normal);',
                '  vec4 mv = modelViewMatrix * vec4(position,1.0);',
                '  vView = normalize(-mv.xyz);',
                '  gl_Position = projectionMatrix * mv;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform vec3 glowColor;',
                'uniform float power;',
                'uniform float intensity;',
                'varying vec3 vNormal;',
                'varying vec3 vView;',
                'void main(){',
                '  float f = pow(1.0 - abs(dot(vView, normalize(vNormal))), power);',
                '  gl_FragColor = vec4(glowColor, f * intensity);',
                '}'
            ].join('\n')
        });
    }

    function makeOrbitLine(radius) {
        const pts = [];
        for (let i = 0; i <= 256; i++) {
            const a = (i / 256) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
        }
        return new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            new THREE.LineBasicMaterial({ color: 0x8a9bb0, transparent: true, opacity: 0.05 })
        );
    }

    // The ring texture is a 1D radial strip: u runs inner → outer edge.
    function fixRingUVs(geometry, inner, outer) {
        const pos = geometry.attributes.position;
        const uv = geometry.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
            const d = Math.hypot(pos.getX(i), pos.getY(i));
            uv.setXY(i, (d - inner) / (outer - inner), 0.5);
        }
        uv.needsUpdate = true;
    }

    function makeDotTexture() {
        const c = document.createElement('canvas');
        c.width = 64; c.height = 64;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.25, 'rgba(255,255,255,0.8)');
        g.addColorStop(0.6, 'rgba(180,200,255,0.15)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
    }

    // Star dust that lives in camera space and streams past the lens, twinkling.
    const DRIFT = { w: 90, h: 55, near: -2, far: -140 };

    function makeDriftStars(count) {
        const pos = new Float32Array(count * 3);
        const seed = new Float32Array(count);
        const size = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * DRIFT.w;
            pos[i * 3 + 1] = (Math.random() - 0.5) * DRIFT.h;
            pos[i * 3 + 2] = DRIFT.far + Math.random() * (DRIFT.near - DRIFT.far);
            seed[i] = Math.random() * 100;
            size[i] = 0.6 + Math.pow(Math.random(), 3) * 2.4;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
        geo.setAttribute('size', new THREE.BufferAttribute(size, 1));

        const mat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            fog: false,
            uniforms: {
                uTime: { value: 0 },
                uMap: { value: makeDotTexture() },
                uPixel: { value: Math.min(window.devicePixelRatio || 1, 1.75) }
            },
            vertexShader: [
                'attribute float seed;',
                'attribute float size;',
                'uniform float uTime;',
                'uniform float uPixel;',
                'varying float vAlpha;',
                'void main(){',
                '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
                '  float twinkle = 0.55 + 0.45 * sin(uTime * (0.8 + fract(seed) * 2.2) + seed);',
                '  float fadeNear = smoothstep(-2.0, -12.0, mv.z);',
                '  float fadeFar = 1.0 - smoothstep(-100.0, -140.0, mv.z);',
                '  vAlpha = twinkle * fadeNear * fadeFar;',
                '  gl_PointSize = size * uPixel * (60.0 / -mv.z);',
                '  gl_Position = projectionMatrix * mv;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform sampler2D uMap;',
                'varying float vAlpha;',
                'void main(){',
                '  vec4 tex = texture2D(uMap, gl_PointCoord);',
                '  gl_FragColor = vec4(vec3(0.92, 0.95, 1.0), tex.a * vAlpha);',
                '}'
            ].join('\n')
        });

        const points = new THREE.Points(geo, mat);
        points.frustumCulled = false;
        return points;
    }

    function makePlanet(def, maps) {
        const group = new THREE.Group();
        group.userData.orbit = def.orbit;
        group.userData.speed = def.speed;
        group.userData.angle = Math.random() * Math.PI * 2;
        group.userData.name = def.name;

        const map = maps[def.map];
        const matOpts = {
            map: map || null,
            color: map ? 0xffffff : 0x888888,
            roughness: def.rough,
            metalness: 0.02
        };

        if (def.earth) {
            if (maps.earthNormal) {
                matOpts.normalMap = maps.earthNormal;
                matOpts.normalScale = new THREE.Vector2(0.65, 0.65);
            }
            if (maps.earthSpec) {
                matOpts.roughnessMap = maps.earthSpec;
                matOpts.metalnessMap = maps.earthSpec;
                matOpts.metalness = 0.15;
            }
        }

        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(def.radius, Q.planetSeg[0], Q.planetSeg[1]),
            new THREE.MeshStandardMaterial(matOpts)
        );
        mesh.rotation.z = def.tilt || 0;
        group.add(mesh);
        group.userData.mesh = mesh;

        if (def.earth && maps.earthClouds) {
            const clouds = new THREE.Mesh(
                new THREE.SphereGeometry(def.radius * 1.018, Q.cloudSeg[0], Q.cloudSeg[1]),
                new THREE.MeshStandardMaterial({
                    map: maps.earthClouds,
                    transparent: true,
                    opacity: 0.42,
                    depthWrite: false,
                    roughness: 1,
                    metalness: 0
                })
            );
            clouds.rotation.z = def.tilt;
            group.add(clouds);
            group.userData.clouds = clouds;

            const atmo = new THREE.Mesh(
                new THREE.SphereGeometry(def.radius * 1.09, Q.atmoSeg[0], Q.atmoSeg[1]),
                fresnelAtmo(0x6eb6ff, 2.6, 0.5)
            );
            group.add(atmo);
        } else if (def.name === 'mars') {
            group.add(new THREE.Mesh(
                new THREE.SphereGeometry(def.radius * 1.06, 40, 28),
                fresnelAtmo(0xc47a4a, 3.0, 0.28)
            ));
        } else if (def.name === 'venus') {
            group.add(new THREE.Mesh(
                new THREE.SphereGeometry(def.radius * 1.05, 40, 28),
                fresnelAtmo(0xe8c98a, 3.2, 0.22)
            ));
        } else if (def.name === 'neptune' || def.name === 'uranus') {
            group.add(new THREE.Mesh(
                new THREE.SphereGeometry(def.radius * 1.07, 40, 28),
                fresnelAtmo(def.name === 'neptune' ? 0x4a6fd8 : 0x9fd8e0, 2.8, 0.32)
            ));
        }

        if (def.rings && maps.saturnRing) {
            const inner = def.radius * 1.3;
            const outer = def.radius * 2.35;
            const ringGeo = new THREE.RingGeometry(inner, outer, Q.ringSeg);
            fixRingUVs(ringGeo, inner, outer);
            const ring = new THREE.Mesh(
                ringGeo,
                new THREE.MeshBasicMaterial({
                    map: maps.saturnRing,
                    transparent: true,
                    opacity: 0.95,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                    alphaTest: 0.02
                })
            );
            ring.rotation.x = Math.PI / 2.15;
            group.add(ring);
        }

        return group;
    }

    function makeSun(maps) {
        const group = new THREE.Group();
        const time = { value: 0 };
        const octaves = Q.lite ? 3 : 5;
        const noiseGLSL = [
            'float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }',
            'float noise(vec3 x){',
            '  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);',
            '  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),',
            '             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);',
            '}',
            'float fbm(vec3 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < ' + octaves + '; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }'
        ].join('\n');

        // Photosphere: boiling granulation over the real map, colour driven by heat, with limb darkening.
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(1.55, Q.sunSeg[0], Q.sunSeg[1]),
            new THREE.ShaderMaterial({
                uniforms: {
                    map: { value: maps.sun || null },
                    hasMap: { value: maps.sun ? 1.0 : 0.0 },
                    uTime: time
                },
                vertexShader: [
                    'varying vec2 vUv;',
                    'varying vec3 vPos;',
                    'varying vec3 vNormal;',
                    'varying vec3 vView;',
                    'void main(){',
                    '  vUv = uv;',
                    '  vPos = normalize(position);',
                    '  vNormal = normalize(normalMatrix * normal);',
                    '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
                    '  vView = normalize(-mv.xyz);',
                    '  gl_Position = projectionMatrix * mv;',
                    '}'
                ].join('\n'),
                fragmentShader: [
                    'uniform sampler2D map;',
                    'uniform float hasMap;',
                    'uniform float uTime;',
                    'varying vec2 vUv;',
                    'varying vec3 vPos;',
                    'varying vec3 vNormal;',
                    'varying vec3 vView;',
                    noiseGLSL,
                    'void main(){',
                    '  float mu = clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0);',
                    '  float t = uTime;',
                    '  float cells = fbm(vPos * 6.0 + vec3(0.0, t * 0.03, t * 0.02));',
                    '  float gran = noise(vPos * 34.0 + cells * 2.5 + vec3(t * 0.12));',
                    '  vec2 uv = vUv + (vec2(cells, gran) - 0.5) * 0.004;',
                    '  vec3 tex = mix(vec3(0.8, 0.55, 0.2), texture2D(map, uv).rgb, hasMap);',
                    '  float texL = dot(tex, vec3(0.299, 0.587, 0.114));',
                    '  float spot = 1.0 - smoothstep(0.18, 0.42, texL);',
                    '  float limb = 0.5 + 0.5 * pow(mu, 0.5);',
                    '  float heat = (0.62 + texL * 0.28 + (gran - 0.5) * 0.1 + (cells - 0.5) * 0.16) * limb;',
                    '  heat = clamp(heat * (1.0 - spot * 0.7), 0.0, 1.0);',
                    '  vec3 col = mix(vec3(0.3, 0.12, 0.02), vec3(0.95, 0.58, 0.16), smoothstep(0.1, 0.45, heat));',
                    '  col = mix(col, vec3(1.0, 0.8, 0.42), smoothstep(0.45, 0.7, heat));',
                    '  col = mix(col, vec3(1.0, 0.95, 0.8), smoothstep(0.7, 0.95, heat));',
                    '  col *= 0.8 + 0.35 * limb;',
                    '  gl_FragColor = vec4(col, 1.0);',
                    '}'
                ].join('\n')
            })
        );
        group.add(core);
        group.userData.core = core;
        group.userData.time = time;

        // Thin chromosphere rim hugging the limb.
        group.add(new THREE.Mesh(
            new THREE.SphereGeometry(1.63, Q.atmoSeg[0], Q.atmoSeg[1]),
            fresnelAtmo(0xffc060, 3.2, 0.45)
        ));

        // Corona: camera-facing plane with slowly shifting streamers radiating off the limb.
        const coronaSize = 1.55 * 5;
        const corona = new THREE.Mesh(
            new THREE.PlaneGeometry(coronaSize * 2, coronaSize * 2),
            new THREE.ShaderMaterial({
                uniforms: { uTime: time, uRatio: { value: coronaSize / 1.55 } },
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                vertexShader: [
                    'varying vec2 vUv;',
                    'void main(){',
                    '  vUv = uv;',
                    '  float s = length(modelViewMatrix[0].xyz);',
                    '  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);',
                    '  mv.xy += position.xy * s;',
                    '  gl_Position = projectionMatrix * mv;',
                    '}'
                ].join('\n'),
                fragmentShader: [
                    'uniform float uTime;',
                    'uniform float uRatio;',
                    'varying vec2 vUv;',
                    noiseGLSL,
                    'void main(){',
                    '  vec2 q = vUv * 2.0 - 1.0;',
                    '  float rr = length(q) * uRatio;',
                    '  if (rr < 0.97) discard;',
                    '  float d = max(rr - 1.0, 0.0);',
                    '  vec2 dir = normalize(q);',
                    '  float streak = fbm(vec3(dir * 3.0, uTime * 0.04 - d * 0.35));',
                    '  float fine = noise(vec3(dir * 11.0, uTime * 0.07 - d * 0.6));',
                    '  float rays = 0.55 + 0.9 * streak + 0.25 * fine;',
                    '  float inner = exp(-d * 4.0);',
                    '  float outer = exp(-d * 1.1) * rays;',
                    '  float glow = inner * 0.5 + outer * 0.38;',
                    '  glow *= (1.0 - smoothstep(uRatio * 0.7, uRatio, rr)) * smoothstep(0.97, 1.05, rr);',
                    '  vec3 col = mix(vec3(1.0, 0.66, 0.3), vec3(1.0, 0.9, 0.7), inner);',
                    '  gl_FragColor = vec4(col * glow, 1.0);',
                    '}'
                ].join('\n')
            })
        );
        corona.renderOrder = 2;
        group.add(corona);

        // Soft additive corona sprite
        const c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        g.addColorStop(0, 'rgba(255,240,200,0.95)');
        g.addColorStop(0.22, 'rgba(255,205,120,0.45)');
        g.addColorStop(0.5, 'rgba(255,170,70,0.1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 256, 256);
        const glowTex = new THREE.CanvasTexture(c);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: glowTex,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        }));
        sprite.scale.set(7.5, 7.5, 1);
        group.add(sprite);

        const sprite2 = sprite.clone();
        sprite2.material = sprite.material.clone();
        sprite2.material.opacity = 0.18;
        sprite2.scale.set(11, 11, 1);
        group.add(sprite2);

        return group;
    }

    function makeStarfield(maps) {
        if (maps.stars) {
            const sky = new THREE.Mesh(
                new THREE.SphereGeometry(250, Q.skySeg[0], Q.skySeg[1]),
                new THREE.MeshBasicMaterial({
                    map: maps.stars,
                    side: THREE.BackSide,
                    transparent: true,
                    opacity: 0.7,
                    depthWrite: false,
                    fog: false
                })
            );
            sky.renderOrder = -1;
            return sky;
        }
        // Fallback dots
        const count = 2000;
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 60 + Math.random() * 80;
            const t = Math.random() * Math.PI * 2;
            const p = Math.acos(2 * Math.random() - 1);
            pos[i * 3] = r * Math.sin(p) * Math.cos(t);
            pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t) * 0.5;
            pos[i * 3 + 2] = r * Math.cos(p);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        return new THREE.Points(geo, new THREE.PointsMaterial({
            color: 0xffffff, size: 0.04, transparent: true, opacity: 0.5, depthWrite: false, sizeAttenuation: true
        }));
    }

    function SpaceJourney() {
        this.mount = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        this.sun = null;
        this.planets = [];
        this.system = null;
        this.stars = null;
        this.path = null;
        this.lookPath = null;
        this.progress = 0;
        this.targetProgress = 0;
        this.running = false;
        this.reduceMotion = false;
        this._raf = 0;
        this._onResize = null;
    }

    SpaceJourney.prototype.init = function (options) {
        options = options || {};
        if (typeof THREE === 'undefined') return null;

        this.mount = options.mount || document.querySelector('#spaceStage');
        if (!this.mount) return null;

        const isMobile = window.__IS_MOBILE__ || window.matchMedia('(max-width: 767px)').matches;
        if (isMobile && !options.force) return null;

        Q = isMobile ? QUALITY_MOBILE : QUALITY_DESKTOP;
        this.lite = Q.lite;
        this.dpr = Math.min(window.devicePixelRatio || 1, Q.maxDpr);

        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const self = this;
        const size = this._viewport();
        const w = size.w;
        const h = size.h;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x020308, 0.0055);

        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.05, 400);
        this.camera.position.set(SUN_RADIUS * SYSTEM_SCALE * 6, SUN_RADIUS * SYSTEM_SCALE * 5, SUN_RADIUS * SYSTEM_SCALE * 16);
        this.lookCurrent = new THREE.Vector3();
        this._stopA = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
        this._stopB = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
        this._tmpPos = new THREE.Vector3();
        this._tmpLook = new THREE.Vector3();

        this.renderer = new THREE.WebGLRenderer({
            antialias: Q.antialias,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(this.dpr);
        this.renderer.setSize(w, h, false);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;
        this.mount.appendChild(this.renderer.domElement);

        // Near-black ambient — sun is the only real light source.
        this.scene.add(new THREE.AmbientLight(0x080c18, 0.12));
        // No distance falloff so the outer planets stay visible up close.
        const sunLight = new THREE.PointLight(0xfff0d0, 2.6, 0, 0);
        this.scene.add(sunLight);
        this.sunLight = sunLight;

        const fill = new THREE.DirectionalLight(0x152038, 0.18);
        fill.position.set(-14, 3, -10);
        this.scene.add(fill);

        this.system = new THREE.Group();
        this.system.rotation.x = 0.12;
        this.system.scale.setScalar(SYSTEM_SCALE);
        this.scene.add(this.system);

        this._bindScroll(options);
        this._bindResize();

        loadTextures(function (maps) {
            self.stars = makeStarfield(maps);
            self.scene.add(self.stars);

            self.drift = makeDriftStars(Q.drift);
            self.drift.material.uniforms.uPixel.value = self.dpr;
            self.camera.add(self.drift);
            self.scene.add(self.camera);

            self.sun = makeSun(maps);
            self.system.add(self.sun);

            PLANETS.forEach(function (def) {
                self.system.add(makeOrbitLine(def.orbit));
                const planet = makePlanet(def, maps);
                planet.userData.radius = def.radius;
                planet.position.set(def.orbit, 0, 0);
                self.system.add(planet);
                self.planets.push(planet);
            });

            self.mount.classList.add('is-ready');
            if (typeof gsap !== 'undefined' && !self.reduceMotion) {
                // Inline opacity is dropped afterwards so CSS states like .is-dimmed can take over.
                gsap.fromTo(self.mount, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: 'power2.out', clearProps: 'opacity' });
            }

            self.clock = new THREE.Clock();
            self.running = true;
            self._tick();
        });

        return this;
    };

    SpaceJourney.prototype._bindScroll = function (options) {
        const self = this;
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || this.reduceMotion) return;
        ScrollTrigger.create({
            trigger: options.trigger || document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
            onUpdate: function (st) { self.targetProgress = st.progress; }
        });
    };

    // Phones size the canvas to the stable large viewport (100lvh in CSS) so the
    // address bar showing/hiding never forces a WebGL resize mid-scroll.
    SpaceJourney.prototype._viewport = function () {
        if (this.lite && this.mount && this.mount.clientHeight) {
            return { w: this.mount.clientWidth || window.innerWidth, h: this.mount.clientHeight };
        }
        return { w: window.innerWidth, h: window.innerHeight };
    };

    SpaceJourney.prototype._bindResize = function () {
        const self = this;
        let lastW = window.innerWidth;
        this._onResize = function () {
            if (!self.camera || !self.renderer) return;
            if (self.lite && window.innerWidth === lastW) return;
            lastW = window.innerWidth;
            const size = self._viewport();
            self.camera.aspect = size.w / size.h;
            self.camera.updateProjectionMatrix();
            self.renderer.setSize(size.w, size.h, false);
        };
        window.addEventListener('resize', this._onResize, { passive: true });
    };

    // Phones only: step the render resolution down when frames run long, and
    // back up slowly when there's headroom, so scrolling never stutters.
    SpaceJourney.prototype._adaptQuality = function (now) {
        if (!this.lite) return;
        if (this._lastFrame) {
            const dt = Math.min(now - this._lastFrame, 100);
            this._frameAvg = this._frameAvg ? this._frameAvg * 0.94 + dt * 0.06 : dt;
        }
        this._lastFrame = now;
        this._adaptCooldown = (this._adaptCooldown || 0) - 1;
        if (this._adaptCooldown > 0 || !this._frameAvg) return;

        let next = this.dpr;
        if (this._frameAvg > 20) next = Math.max(Q.minDpr, this.dpr - 0.2);
        else if (this._frameAvg < 15) next = Math.min(Math.min(window.devicePixelRatio || 1, Q.maxDpr), this.dpr + 0.1);

        if (Math.abs(next - this.dpr) > 0.01) {
            this.dpr = next;
            this.renderer.setPixelRatio(next);
            const size = this._viewport();
            this.renderer.setSize(size.w, size.h, false);
            if (this.drift) this.drift.material.uniforms.uPixel.value = next;
            this._adaptCooldown = 90;
        } else {
            this._adaptCooldown = 30;
        }
    };

    SpaceJourney.prototype._tick = function () {
        const self = this;
        if (!this.running) return;
        this._raf = requestAnimationFrame(function () { self._tick(); });
        if (document.hidden || !this.clock) {
            this._lastFrame = 0;
            return;
        }
        this._adaptQuality(performance.now());

        const t = this.clock.getElapsedTime();
        this.progress += (this.targetProgress - this.progress) * 0.075;
        const p = clamp(this.progress, 0, 1);

        this.planets.forEach(function (planet) {
            const d = planet.userData;
            d.angle += d.speed * 0.0015;
            planet.position.x = Math.cos(d.angle) * d.orbit;
            planet.position.z = Math.sin(d.angle) * d.orbit;
            if (d.mesh) d.mesh.rotation.y += 0.0022;
            if (d.clouds) d.clouds.rotation.y += 0.0028;
        });

        if (this.sun && this.sun.userData.core) {
            this.sun.userData.core.rotation.y = t * 0.025;
            this.sun.userData.time.value = t;
            this.sun.scale.setScalar(1 + Math.sin(t * 0.5) * 0.006);
        }

        if (this.stars && this.stars.rotation) {
            this.stars.position.copy(this.camera.position);
            this.stars.rotation.y = t * 0.004;
            this.stars.rotation.x = Math.sin(t * 0.03) * 0.03;
        }

        if (this.drift) {
            // Idle drift plus a burst of speed while the visitor is scrolling.
            const velocity = Math.abs(this.progress - (this._lastProgress || 0));
            this._lastProgress = this.progress;
            this._driftBoost = (this._driftBoost || 0) * 0.92 + velocity * 60;
            const speed = 0.05 + Math.min(this._driftBoost, 2.2);

            const arr = this.drift.geometry.attributes.position.array;
            for (let k = 0; k < arr.length; k += 3) {
                arr[k + 2] += speed;
                arr[k] += Math.sin(t * 0.2 + k) * 0.002;
                if (arr[k + 2] > DRIFT.near) {
                    arr[k] = (Math.random() - 0.5) * DRIFT.w;
                    arr[k + 1] = (Math.random() - 0.5) * DRIFT.h;
                    arr[k + 2] = DRIFT.far;
                }
            }
            this.drift.geometry.attributes.position.needsUpdate = true;
            this.drift.material.uniforms.uTime.value = t;
        }

        if (this.system) {
            this.system.rotation.x = 0.16 + Math.sin(t * 0.04) * 0.01;
        }

        if (this.camera && this.planets.length) {
            const stopCount = this.planets.length + 1;
            const seg = p * (stopCount - 1);
            const i = Math.min(Math.floor(seg), stopCount - 2);
            const local = seg - i;
            // Hold on each body, then glide to the next.
            const f = easeInOut(clamp((local - DWELL / 2) / (1 - DWELL), 0, 1));

            this._computeStop(i, this._stopA);
            this._computeStop(i + 1, this._stopB);

            this._tmpPos.lerpVectors(this._stopA.pos, this._stopB.pos, f);
            // Arc over the orbital plane while travelling so we never clip through bodies.
            const travel = this._stopA.pos.distanceTo(this._stopB.pos);
            this._tmpPos.y += Math.sin(f * Math.PI) * Math.min(travel * 0.22, 10);
            this._tmpLook.lerpVectors(this._stopA.look, this._stopB.look, f);

            this.camera.position.lerp(this._tmpPos, 0.1);
            this.lookCurrent.lerp(this._tmpLook, 0.12);
            this.camera.lookAt(this.lookCurrent);
        }

        this.renderer.render(this.scene, this.camera);
    };

    // Stop 0 = sun (with the inner system behind it), 1.. = planets (mercury → neptune).
    SpaceJourney.prototype._computeStop = function (index, out) {
        const s = SYSTEM_SCALE;

        if (index === 0) {
            const r = SUN_RADIUS * s;
            // Portrait screens are narrow, so pull back until the sun sits under the hero text instead of filling it.
            const k = this.camera.aspect < 1 ? 2.4 : 1;
            out.pos.set(r * 3.2 * k, r * 2.2 * k, r * 7.5 * k);
            out.look.set(0, k > 1 ? r * 6.2 : 0, 0);
            return;
        }

        const planet = this.planets[index - 1];
        const r = planet.userData.radius * s;
        const world = planet.getWorldPosition(out.look);

        // Sit between the sun and the planet (lit side), swung off-axis and slightly above.
        const toSun = this._tmpA || (this._tmpA = new THREE.Vector3());
        toSun.set(-world.x, 0, -world.z).normalize();
        const side = this._tmpB || (this._tmpB = new THREE.Vector3());
        side.set(-toSun.z, 0, toSun.x);

        const swing = index % 2 === 0 ? 1 : -1;
        const dist = r * (planet.userData.name === 'saturn' ? 7 : 5.2);
        out.pos.copy(world)
            .addScaledVector(toSun, dist * 0.8)
            .addScaledVector(side, dist * 0.6 * swing);
        out.pos.y += r * 1.6;

        out.look.copy(world);
    };

    SpaceJourney.prototype.destroy = function () {
        this.running = false;
        cancelAnimationFrame(this._raf);
        if (this._onResize) window.removeEventListener('resize', this._onResize);
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
    };

    global.SpaceJourney = SpaceJourney;
    global.initSpaceJourney = function (opts) {
        return new SpaceJourney().init(opts || {});
    };
})(typeof window !== 'undefined' ? window : this);
