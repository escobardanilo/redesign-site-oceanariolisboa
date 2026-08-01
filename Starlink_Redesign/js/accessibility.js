import { qsa } from './utils.js';

let liveRegion = null;

/** Polite screen-reader announcements for state changes that have no other text cue. */
export function announce(message) {
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.className = 'live-region';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    document.body.appendChild(liveRegion);
  }
  liveRegion.textContent = '';
  // Forces the SR to re-announce even if the text is identical to last time.
  window.requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Simple focus trap for modals/menus: cycles Tab within `root`, restores focus to `returnEl` on deactivate. */
export function createFocusTrap(root, returnEl) {
  function handleKeydown(event) {
    if (event.key !== 'Tab') return;
    const focusable = qsa(FOCUSABLE, root).filter((el) => el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return {
    activate() {
      root.addEventListener('keydown', handleKeydown);
      const focusable = qsa(FOCUSABLE, root);
      focusable[0]?.focus();
    },
    deactivate() {
      root.removeEventListener('keydown', handleKeydown);
      returnEl?.focus();
    },
  };
}

const escapeStack = [];

function handleGlobalEscape(event) {
  if (event.key !== 'Escape') return;
  const top = escapeStack[escapeStack.length - 1];
  top?.();
}

document.addEventListener('keydown', handleGlobalEscape);

export function pushEscapeHandler(handler) {
  escapeStack.push(handler);
}

export function popEscapeHandler(handler) {
  const index = escapeStack.lastIndexOf(handler);
  if (index !== -1) escapeStack.splice(index, 1);
}
