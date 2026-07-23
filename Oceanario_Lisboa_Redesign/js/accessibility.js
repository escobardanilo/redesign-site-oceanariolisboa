import { qsa } from './utils.js';

/**
 * Focus trap for the fullscreen menu (and any future modal/dialog).
 * Deliberately dependency-free: cycles Tab/Shift+Tab within `container`
 * and restores focus to `returnTo` on deactivate.
 */
export function createFocusTrap(container, returnTo) {
  let focusables = [];
  let handleKeydown;

  function refresh() {
    focusables = qsa(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container
    ).filter((el) => el.offsetParent !== null);
  }

  return {
    activate() {
      refresh();
      const first = focusables[0];
      first?.focus();

      handleKeydown = (event) => {
        if (event.key !== 'Tab' || focusables.length === 0) return;
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === firstEl) {
          event.preventDefault();
          lastEl.focus();
        } else if (!event.shiftKey && document.activeElement === lastEl) {
          event.preventDefault();
          firstEl.focus();
        }
      };
      container.addEventListener('keydown', handleKeydown);
    },
    deactivate() {
      container.removeEventListener('keydown', handleKeydown);
      returnTo?.focus();
    },
  };
}

/**
 * LIFO stack of Escape-key handlers so nested/overlapping overlays
 * (menu, a future modal) each close in the right order with one listener.
 */
const escapeStack = [];
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || escapeStack.length === 0) return;
  const handler = escapeStack[escapeStack.length - 1];
  handler();
});

export function pushEscapeHandler(handler) {
  escapeStack.push(handler);
}

export function popEscapeHandler(handler) {
  const index = escapeStack.lastIndexOf(handler);
  if (index !== -1) escapeStack.splice(index, 1);
}

/** Single shared polite live region for async status messages (forms, sliders). */
let liveRegion;
export function announce(message) {
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  liveRegion.textContent = '';
  // Forces screen readers to re-announce even if the message repeats.
  requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}
