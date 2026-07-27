import { gsap, EASE, DURATION, isReducedMotion, setScrollLocked } from './gsap-config.js';
import { qs, qsa } from './utils.js';
import { createFocusTrap, pushEscapeHandler, popEscapeHandler } from './accessibility.js';

/**
 * Simple slide-in side menu: backdrop fade + panel slide from the right,
 * a short staggered entrance on the links themselves, focus trap,
 * Escape-to-close. The footer's static nav (html/components/footer.html)
 * is the no-JS-safe navigation fallback — this overlay is progressive
 * enhancement on top of it.
 */
export function initMenu() {
  const toggle = qs('[data-menu-toggle]');
  const menu = qs('[data-menu]');
  const header = qs('[data-site-header]');
  if (!toggle || !menu) return;

  const backdrop = qs('[data-menu-backdrop]', menu);
  const panel = qs('.site-menu__panel', menu);
  const links = qsa('[data-menu-link]', menu);

  // Reversing the open timeline at normal speed took ~1.9s (backdrop +
  // panel + the full link stagger, all played backward) — fine for an
  // entrance, sluggish for a dismiss. Closing plays that same timeline
  // at CLOSE_SPEED so it reads as snappy without needing a second,
  // separately-tuned close animation.
  const CLOSE_SPEED = 2.5;

  let isOpen = false;
  let timeline = null;
  let focusTrap = null;

  function buildTimeline() {
    const tl = gsap.timeline({ paused: true });

    if (isReducedMotion()) {
      tl.set(backdrop, { opacity: 0.6 }).set(panel, { xPercent: 0 }).set(links, { autoAlpha: 1, x: 0 });
      return tl;
    }

    tl.set(panel, { xPercent: 100 })
      .to(backdrop, { opacity: 0.6, duration: DURATION.base, ease: EASE.standard }, 0)
      .to(panel, { xPercent: 0, duration: DURATION.slow, ease: EASE.expo }, 0)
      .from(links, { autoAlpha: 0, x: 24, duration: DURATION.base, ease: EASE.expo, stagger: 0.045 }, '-=0.5');

    return tl;
  }

  function open() {
    if (isOpen) return;
    isOpen = true;

    menu.classList.add('is-open');
    header?.classList.add('is-menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.querySelector('[data-menu-label]') && (toggle.querySelector('[data-menu-label]').textContent = 'Fechar');
    setScrollLocked(true);

    timeline = buildTimeline();
    timeline.timeScale(1).play(0);

    focusTrap = createFocusTrap(menu, toggle);
    focusTrap.activate();
    pushEscapeHandler(close);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('[data-menu-label]') && (toggle.querySelector('[data-menu-label]').textContent = 'Menu');
    header?.classList.remove('is-menu-open');
    popEscapeHandler(close);
    focusTrap?.deactivate();
    // Unlocked immediately, not deferred to the close animation finishing:
    // a click on a [data-menu-link] fires this handler and navigation.js's
    // smooth-scroll handler on the same element, in that order, and Lenis
    // being stopped from open() made lenis.scrollTo() silently no-op if
    // the unlock hadn't happened yet — the link's own scroll never ran.
    // Nothing else here depends on the reverse animation's timing.
    setScrollLocked(false);

    const playback = timeline;
    const finish = () => {
      menu.classList.remove('is-open');
    };

    if (isReducedMotion() || !playback) {
      finish();
      return;
    }

    playback.eventCallback('onReverseComplete', finish);
    playback.timeScale(CLOSE_SPEED).reverse();
  }

  toggle.addEventListener('click', () => (isOpen ? close() : open()));

  backdrop?.addEventListener('click', close);

  qsa('[data-menu-close]', menu).forEach((el) => el.addEventListener('click', close));

  window.addEventListener('resize', () => {
    if (isOpen && timeline) {
      timeline.progress(1);
    }
  });

  return { open, close };
}
