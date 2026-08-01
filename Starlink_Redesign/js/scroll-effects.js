import { gsap, ScrollTrigger, EASE, DURATION, isReducedMotion } from './gsap-config.js';
import { qs, qsa } from './utils.js';

/** Generic fade/rise reveal for any [data-reveal] element, staggered per shared [data-reveal-group]. */
function initReveals() {
  if (isReducedMotion()) return;

  const groups = new Map();
  qsa('[data-reveal]').forEach((el) => {
    const key = el.dataset.revealGroup || el;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(el);
  });

  groups.forEach((els) => {
    gsap.to(els, {
      autoAlpha: 1,
      y: 0,
      duration: DURATION.slow,
      ease: EASE.expo,
      stagger: 0.1,
      scrollTrigger: {
        trigger: els[0],
        start: 'top 85%',
        once: true,
      },
    });
  });
}

/** Fills the reliability section's mini gauge from 0 to its target Mbps once it scrolls into view. */
function initGaugePreview() {
  const gauge = qs('[data-gauge-preview]');
  if (!gauge) return;

  const fill = qs('.gauge-preview__fill', gauge);
  const valueEl = qs('[data-gauge-value]', gauge);
  const target = Number(gauge.dataset.gaugePreview) || 0;
  const circumference = 2 * Math.PI * 54;

  if (isReducedMotion()) {
    if (fill) fill.style.strokeDashoffset = String(circumference * (1 - target / 300));
    if (valueEl) valueEl.textContent = String(target);
    return;
  }

  if (fill) {
    fill.style.strokeDasharray = String(circumference);
    fill.style.strokeDashoffset = String(circumference);
  }

  const counter = { value: 0 };
  ScrollTrigger.create({
    trigger: gauge,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to(counter, {
        value: target,
        duration: DURATION.cinematic,
        ease: EASE.standard,
        onUpdate: () => {
          const progress = counter.value / 300;
          if (fill) fill.style.strokeDashoffset = String(circumference * (1 - progress));
          if (valueEl) valueEl.textContent = String(Math.round(counter.value));
        },
      });
    },
  });
}

/** Staggers the coverage map's dot markers in once the section is in view. */
function initCoverageMap() {
  const pins = qsa('[data-coverage-pin]');
  if (pins.length === 0) return;

  if (isReducedMotion()) {
    gsap.set(pins, { autoAlpha: 1, scale: 1 });
    return;
  }

  gsap.set(pins, { autoAlpha: 0, scale: 0 });
  gsap.to(pins, {
    autoAlpha: 1,
    scale: 1,
    duration: DURATION.base,
    ease: EASE.back,
    stagger: 0.06,
    scrollTrigger: {
      trigger: '[data-coverage-map]',
      start: 'top 75%',
      once: true,
    },
  });
}

export function initAllScrollEffects() {
  initReveals();
  initGaugePreview();
  initCoverageMap();
  ScrollTrigger.refresh();
}
