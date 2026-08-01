import { qs, qsa } from './utils.js';

const SCROLL_THRESHOLD = 24;

/** Fixed header: solid/blurred background past a small scroll threshold, plus current-page nav highlighting. */
export function initNavigation() {
  const header = qs('[data-site-header]');
  if (header) {
    const update = () => {
      header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  const current = document.body.dataset.page;
  if (!current) return;

  qsa('[data-nav-link]').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.navLink === current);
    if (link.dataset.navLink === current) {
      link.setAttribute('aria-current', 'page');
    }
  });
}
