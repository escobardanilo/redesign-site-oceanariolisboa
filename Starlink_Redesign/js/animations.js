import { gsap, EASE, DURATION, isReducedMotion } from './gsap-config.js';
import { qs, qsa, hasFinePointer } from './utils.js';

/** Hero entrance: eyebrow -> title -> subtitle -> CTAs -> quickfacts, staggered. */
export function runHeroIntro() {
  const hero = qs('[data-hero]');
  if (!hero) return;

  const targets = [
    qs('[data-hero-eyebrow]', hero),
    qs('[data-hero-title]', hero),
    qs('[data-hero-subtitle]', hero),
    qs('[data-hero-cta]', hero),
    qs('[data-hero-quickfacts]', hero),
  ].filter(Boolean);

  if (isReducedMotion()) {
    gsap.set(targets, { autoAlpha: 1, y: 0 });
    return;
  }

  gsap.set(targets, { autoAlpha: 0, y: 28 });
  gsap.to(targets, {
    autoAlpha: 1,
    y: 0,
    duration: DURATION.slow,
    ease: EASE.expo,
    stagger: 0.12,
    delay: 0.15,
  });
}

/** Subtle pointer-follow pull on buttons/links flagged data-magnetic="0.2..0.4" — fine-pointer only, additive. */
export function initMagneticButtons() {
  if (!hasFinePointer() || isReducedMotion()) return;

  qsa('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.25;
    el.classList.add('has-magnetic');

    el.addEventListener('mousemove', (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: DURATION.fast,
        ease: EASE.soft,
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: DURATION.base, ease: EASE.expo });
    });
  });
}

/**
 * Lightweight drifting-starfield canvas used behind the hero and the
 * final CTA section. Paused via gsap.ticker (so it stops for free
 * whenever the tab is hidden) and skipped entirely for reduced-motion,
 * where a static single frame is drawn instead.
 */
export function initStarfield(canvas) {
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let stars = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function buildStars() {
    const count = Math.round((width * height) / 9000);
    stars = Array.from({ length: clampCount(count) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1 + 0.2,
      speed: Math.random() * 0.15 + 0.02,
      twinkle: Math.random() * Math.PI * 2,
    }));
  }

  function clampCount(count) {
    return Math.max(40, Math.min(count, 220));
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    if (isReducedMotion()) drawStatic();
  }

  function drawStatic() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(245, 245, 247, 0.6)';
    stars.forEach((star) => {
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function tick() {
    if (isReducedMotion()) return;
    ctx.clearRect(0, 0, width, height);
    stars.forEach((star) => {
      star.y += star.speed;
      star.twinkle += 0.02;
      if (star.y > height) {
        star.y = 0;
        star.x = Math.random() * width;
      }
      const alpha = 0.35 + Math.abs(Math.sin(star.twinkle)) * 0.5;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#f5f5f7';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  gsap.ticker.add(tick);

  return {
    destroy() {
      gsap.ticker.remove(tick);
      resizeObserver.disconnect();
    },
  };
}
