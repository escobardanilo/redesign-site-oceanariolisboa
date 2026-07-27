import { gsap, ScrollTrigger, getLenis } from './gsap-config.js';
import { qs, qsa } from './utils.js';

/**
 * Header scroll state (shrink + solid background), per-section color
 * theming, and smooth in-page anchor scrolling. Kept deliberately small:
 * the primary navigation experience lives in js/menu.js.
 */
export function initNavigation() {
  const header = qs('[data-site-header]');
  if (header) {
    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      toggleClass: { targets: header, className: 'is-scrolled' },
    });

    // Every section/footer carries data-header-theme="light" | "dark" for
    // whatever's actually behind the fixed header, not just "have we
    // scrolled": .is-on-light (solid navy bar) while a light-background
    // section spans the header, released back to the transparent default
    // (the right look for dark sections, hero included) everywhere else.
    // One trigger per light section rather than a single scroll listener
    // doing hit-testing, so it stays declarative and in sync with Lenis
    // the same way every other scroll effect in this file does.
    qsa('[data-header-theme="light"]').forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        invalidateOnRefresh: true,
        toggleClass: { targets: header, className: 'is-on-light' },
      });
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
