function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function smoothScrollTo(targetY, duration) {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutQuad(progress));

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

const header = document.querySelector('header');
const hero = document.querySelector('.hero');

function updateHeaderBackground() {
    const threshold = hero.offsetHeight - header.offsetHeight;
    header.classList.toggle('scrolled', window.pageYOffset >= threshold);
}

window.addEventListener('scroll', updateHeaderBackground);
window.addEventListener('resize', updateHeaderBackground);
updateHeaderBackground();

document.querySelectorAll('.nav-menu a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;

        e.preventDefault();

        const headerHeight = document.querySelector('header').offsetHeight;
        const targetY = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        smoothScrollTo(targetY, 600);
    });
});
