/**
 * Small, dependency-free helpers shared across the JS modules.
 */

export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

export function debounce(fn, wait = 150) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), wait);
  };
}

export function throttle(fn, limit = 100) {
  let waiting = false;
  let lastArgs = null;
  return (...args) => {
    if (!waiting) {
      fn(...args);
      waiting = true;
      setTimeout(() => {
        waiting = false;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const lerp = (start, end, t) => start + (end - start) * t;

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function isTouchDevice() {
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

/** Small pub/sub used to broadcast the reduced-motion state without tight coupling. */
export const motionBus = new EventTarget();

/**
 * Runs `callback` once per element the first time it becomes visible.
 * A thin wrapper over IntersectionObserver used for lazy video sources
 * and other non-ScrollTrigger driven lazy work.
 */
export function onFirstIntersect(elements, callback, options = { rootMargin: '200px 0px' }) {
  const list = Array.isArray(elements) ? elements : [elements];
  if (!list.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, options);

  list.forEach((el) => el && observer.observe(el));
  return observer;
}

export function formatIndex(number) {
  return String(number).padStart(2, '0');
}
