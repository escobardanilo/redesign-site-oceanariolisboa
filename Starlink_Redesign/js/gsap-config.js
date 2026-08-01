import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { prefersReducedMotion, hasFinePointer, motionBus } from './utils.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Central rhythm tokens — mirror the CSS custom properties in
 * css/variables.css so JS-driven and CSS-driven motion stay in sync.
 */
export const EASE = {
  standard: 'power3.out',
  soft: 'power2.out',
  expo: 'expo.out',
  inOutSoft: 'sine.inOut',
  back: 'back.out(1.6)',
};

export const DURATION = {
  instant: 0.15,
  fast: 0.3,
  base: 0.8,
  slow: 1.2,
  cinematic: 1.8,
};

gsap.defaults({
  duration: DURATION.base,
  ease: EASE.standard,
});

ScrollTrigger.config({
  ignoreMobileResize: true,
});

/** Live reduced-motion flag, exported as a getter so it always reads fresh. */
let reducedMotion = prefersReducedMotion();
export const isReducedMotion = () => reducedMotion;

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const handleMotionChange = (event) => {
  reducedMotion = event.matches;
  document.documentElement.classList.toggle('reduced-motion', reducedMotion);
  motionBus.dispatchEvent(new CustomEvent('change', { detail: { reducedMotion } }));
  if (reducedMotion) {
    ScrollTrigger.getAll().forEach((trigger) => trigger.refresh());
  }
};
motionQuery.addEventListener('change', handleMotionChange);
document.documentElement.classList.toggle('reduced-motion', reducedMotion);

let lenisInstance = null;

/**
 * Starts Lenis smooth scroll and wires it to gsap.ticker + ScrollTrigger.
 * Skipped for reduced-motion users and coarse/touch pointers, where
 * native momentum scrolling already feels right and is cheaper.
 */
export function initSmoothScroll() {
  if (reducedMotion || !hasFinePointer()) {
    ScrollTrigger.normalizeScroll(false);
    return null;
  }

  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1,
  });

  lenisInstance.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  motionBus.addEventListener('change', (event) => {
    if (event.detail.reducedMotion) {
      lenisInstance?.destroy();
      lenisInstance = null;
    }
  });

  return lenisInstance;
}

export function getLenis() {
  return lenisInstance;
}

/** Pause/resume Lenis — used by the mobile menu and the speed-test modal to lock scroll. */
export function setScrollLocked(locked) {
  if (lenisInstance) {
    locked ? lenisInstance.stop() : lenisInstance.start();
  }
  document.body.classList.toggle('no-scroll', locked);
}

export { gsap, ScrollTrigger };
