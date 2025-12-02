(function () {
    // Toggle a wallpaper when the user scrolls past the hero section (Services page)
    const wallpaperClass = 'wallpaper-active';
    const body = document.body;
    const hero = document.getElementById('home') || document.querySelector('.page-hero') || document.querySelector('.hero');

    function shouldShow() {
        if (!hero) return window.scrollY > 200;
        return window.scrollY > (hero.offsetHeight * 0.5);
    }

    let lastState = null;
    function onScroll() {
        const show = shouldShow();
        if (show === lastState) return;
        lastState = show;
        if (show) body.classList.add(wallpaperClass);
        else body.classList.remove(wallpaperClass);
    }

    // Throttle scroll events with rAF
    let scheduled = false;
    window.addEventListener('scroll', () => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => { scheduled = false; onScroll(); });
    }, { passive: true });

    window.addEventListener('resize', () => { requestAnimationFrame(onScroll); });

    // init
    requestAnimationFrame(onScroll);
})();
