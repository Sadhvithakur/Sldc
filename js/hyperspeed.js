(function () {
    // Respect user preferences and small screens: don't run heavy animation
    try {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return; // user prefers reduced motion
        }
    } catch (e) { }

    if (window.innerWidth && window.innerWidth < 800) {
        // avoid running on small screens to save battery and keep content clear
        return;
    }

    const canvas = document.getElementById('hyperspeed-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = 0, h = 0, cx = 0, cy = 0;
    let stars = [];
    let depth = 1200; // max z
    let speed = 20; // base speed
    let starCount = 600; // default, will adapt
    // brand color (matches --brand: #0f4c81)
    const starRGB = { r: 15, g: 76, b: 129 };

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        cx = w / 2; cy = h / 2;
        // adapt star count to viewport
        starCount = Math.max(200, Math.floor((w * h) / 6000));
        initStars();
    }

    function randRange(a, b) { return a + Math.random() * (b - a); }

    function initStars() {
        stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: randRange(-cx, cx),
                y: randRange(-cy, cy),
                z: randRange(1, depth)
            });
        }
    }

    let last = performance.now();
    function loop(now) {
        const dt = Math.min(50, now - last) / 16.666; // normalize by ~60fps frame
        last = now;

        // translucent background to create trails
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, w, h);

        // focal length
        const f = (w + h) / 2;

        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            const prevZ = s.z;
            s.z -= (speed * dt);
            if (s.z <= 1) {
                s.x = randRange(-cx, cx);
                s.y = randRange(-cy, cy);
                s.z = depth + Math.random() * 200;
                continue;
            }

            const sx = (s.x / s.z) * f + cx;
            const sy = (s.y / s.z) * f + cy;
            const px = (s.x / prevZ) * f + cx;
            const py = (s.y / prevZ) * f + cy;

            // skip if offscreen
            if ((sx < -50 || sx > w + 50) || (sy < -50 || sy > h + 50)) continue;

            const v = 1 - s.z / depth; // 0..1
            const alpha = Math.min(1, 0.8 + v);
            const strokeA = Math.max(0.12, alpha);
            ctx.strokeStyle = `rgba(${starRGB.r},${starRGB.g},${starRGB.b},${strokeA})`;
            ctx.lineWidth = Math.max(0.4, v * 3);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(sx, sy);
            ctx.stroke();

            // small head
            const fillA = Math.min(0.9, 0.6 + v);
            ctx.fillStyle = `rgba(${starRGB.r},${starRGB.g},${starRGB.b},${fillA})`;
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(0.3, v * 1.6), 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(loop);
    }

    // mouse to increase speed affordance
    let targetSpeed = speed;
    window.addEventListener('mousemove', (e) => {
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const max = Math.sqrt(cx * cx + cy * cy);
        const t = Math.min(1, dist / max);
        targetSpeed = 12 + t * 40; // speed range when moving
        speed = speed + (targetSpeed - speed) * 0.08;
    });

    window.addEventListener('resize', resize);
    // start
    resize();
    requestAnimationFrame(loop);
})();
