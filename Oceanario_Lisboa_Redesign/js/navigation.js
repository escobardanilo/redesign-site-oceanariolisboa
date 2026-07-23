import { gsap, ScrollTrigger, getLenis } from './gsap-config.js';
import { qs, qsa } from './utils.js';

/**
 * Header scroll state (shrink + solid background) and smooth in-page
 * anchor scrolling. Kept deliberately small: the primary navigation
 * experience lives in js/menu.js.
 */
export function initNavigation() {
  const header = qs('[data-site-header]');
  if (header) {
    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      toggleClass: { targets: header, className: 'is-scrolled' },
    });
  }

  qsa('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = qs(id);
      if (!target) return;

      event.preventDefault();
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(target, { offset: -72, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}
