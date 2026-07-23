import { gsap, EASE, DURATION, isReducedMotion } from './gsap-config.js';
import { qs, qsa, hasFinePointer } from './utils.js';

/**
 * Reusable animation primitives. Section-specific ScrollTrigger wiring
 * lives in scroll-effects.js and imports these rather than duplicating
 * timeline logic — see docs/ANIMATIONS.md for the full catalogue.
 *
 * Hero/editorial titles use hand-authored line spans in the markup
 * (`[data-hero-line] > span`, `.split-line`) instead of a runtime
 * line-splitter: real line breaks depend on rendered layout, and
 * measuring/re-splitting on every resize is fragile. Word-level splits
 * (`splitWords`) are resize-safe because words simply reflow, so that's
 * used for anything not hand-authored.
 */

export function splitWords(el) {
  if (!el || el.dataset.split === 'done') return [];
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map((word) => `<span class="split-word"><span>${word}</span></span>`)
    .join(' ');
  el.dataset.split = 'done';
  return qsa('.split-word > span', el);
}

export function fadeUp(targets, vars = {}) {
  const reduced = isReducedMotion();
  const { y, duration, stagger, ease, ...rest } = vars;
  return gsap.from(targets, {
    ...rest,
    y: reduced ? 0 : y ?? 32,
    autoAlpha: 0,
    duration: reduced ? Math.min(duration ?? DURATION.base, DURATION.fast) : duration ?? DURATION.base,
    ease: ease ?? EASE.standard,
    stagger: reduced ? 0 : stagger ?? 0,
  });
}

/** Animates a numeric counter (e.g. "1996" or "60") as an integer proxy. */
export function countUp(el, { to, duration = DURATION.cinematic, suffix = '' } = {}) {
  if (!el) return null;
  const proxy = { value: 0 };
  return gsap.to(proxy, {
    value: to,
    duration: isReducedMotion() ? 0.4 : duration,
    ease: 'power2.out',
    onUpdate: () => {
      el.textContent = `${Math.round(proxy.value)}${suffix}`;
    },
  });
}

/** Preloader boot sequence: simulated + real-load-aware progress, mask exit. */
export function runPreloader({ onComplete } = {}) {
  const preloader = qs('[data-preloader]');
  if (!preloader) {
    onComplete?.();
    return;
  }

  const fill = qs('[data-preloader-fill]', preloader);
  const countEl = qs('[data-preloader-count]', preloader);
  const reduced = isReducedMotion();
  const state = { value: 0 };

  const paint = () => {
    const rounded = Math.round(state.value);
    if (fill) fill.style.width = `${rounded}%`;
    if (countEl) countEl.textContent = `${rounded}%`;
  };

  const simTween = gsap.to(state, {
    value: 88,
    duration: reduced ? 0.25 : 1.5,
    ease: 'power1.inOut',
    onUpdate: paint,
  });

  const windowLoaded = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', () => resolve(), { once: true });
  });
  const safetyTimeout = new Promise((resolve) => {
    setTimeout(resolve, reduced ? 350 : 2400);
  });

  Promise.race([windowLoaded, safetyTimeout]).then(() => {
    simTween.kill();
    gsap.to(state, {
      value: 100,
      duration: reduced ? 0.2 : 0.45,
      ease: 'power2.out',
      onUpdate: paint,
      onComplete: () => exitPreloader(preloader, reduced, onComplete),
    });
  });
}

function exitPreloader(preloader, reduced, onComplete) {
  const tl = gsap.timeline({
    onComplete: () => {
      preloader.setAttribute('hidden', '');
      onComplete?.();
    },
  });

  if (reduced) {
    tl.to(preloader, { autoAlpha: 0, duration: DURATION.fast });
  } else {
    tl.to(preloader, {
      clipPath: 'inset(0 0 100% 0)',
      duration: DURATION.cinematic * 0.5,
      ease: EASE.expo,
    });
  }
}

/** Header + hero boot: nav drop-in, title line reveal, staggered CTA/facts. */
export function runHeroIntro() {
  const header = qs('[data-site-header]');
  const title = qs('[data-hero-title]');
  const media = qs('[data-hero-media] img, [data-hero-media] video');
  const lines = title ? qsa('[data-hero-line] > span', title) : [];
  const rest = qsa('[data-hero-animate]');
  const reduced = isReducedMotion();

  const tl = gsap.timeline({ defaults: { ease: EASE.expo } });

  if (header) tl.from(header, { yPercent: -100, duration: DURATION.base }, 0);

  if (reduced) {
    tl.set([lines, rest], { clearProps: 'all' });
    return tl;
  }

  // One-time "settle" zoom on the hero background — ends at the media's
  // natural scale(1) so nothing stays enlarged at rest (see components.css
  // for why a persistent resting transform isn't used here).
  if (media) tl.from(media, { scale: 1.1, duration: DURATION.cinematic, ease: EASE.soft }, 0);

  if (lines.length) {
    tl.from(lines, { yPercent: 115, duration: DURATION.slow, stagger: 0.12 }, 0.15);
  }
  if (rest.length) {
    tl.from(rest, { autoAlpha: 0, y: 22, duration: DURATION.base, stagger: 0.08 }, '-=0.6');
  }

  return tl;
}

/** Magnetic pull for buttons/links flagged with [data-magnetic] (desktop only). */
export function initMagneticButtons() {
  if (!hasFinePointer() || isReducedMotion()) return;

  qsa('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.35;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: EASE.soft });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: EASE.soft });

    el.addEventListener('mousemove', (event) => {
      const rect = el.getBoundingClientRect();
      xTo((event.clientX - rect.left - rect.width / 2) * strength);
      yTo((event.clientY - rect.top - rect.height / 2) * strength);
    });
    el.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

/** Contextual cursor: grows + labels itself over [data-cursor-explore] targets. */
export function initCustomCursor() {
  if (!hasFinePointer() || isReducedMotion()) return;

  const cursor = document.createElement('div');
  cursor.className = 'cursor-dot';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: EASE.soft });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: EASE.soft });

  window.addEventListener('pointermove', (event) => {
    xTo(event.clientX);
    yTo(event.clientY);
    cursor.classList.add('is-visible');
  });
  document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));

  qsa('[data-cursor-explore]').forEach((el) => {
    const label = el.dataset.cursorExplore || 'Explorar';
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-explore');
      cursor.textContent = label;
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-explore');
      cursor.textContent = '';
    });
  });
}
