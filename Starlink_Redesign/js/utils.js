export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Shared EventTarget other modules can listen on for reduced-motion changes. */
export const motionBus = new EventTarget();

export function openInNewTab(url) {
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (win) win.opener = null;
}
