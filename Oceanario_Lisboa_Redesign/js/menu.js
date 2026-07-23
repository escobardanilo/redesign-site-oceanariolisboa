import { gsap, EASE, DURATION, isReducedMotion, setScrollLocked } from './gsap-config.js';
import { qs, qsa, hasFinePointer } from './utils.js';
import { createFocusTrap, pushEscapeHandler, popEscapeHandler } from './accessibility.js';

/**
 * Fullscreen immersive menu: mask reveal, staggered item entrance,
 * hover-linked visuals (desktop only), focus trap, Escape-to-close.
 * The footer's static nav (html/components/footer.html) is the
 * no-JS-safe navigation fallback — this overlay is progressive
 * enhancement on top of it.
 */
export function initMenu() {
  const toggle = qs('[data-menu-toggle]');
  const menu = qs('[data-menu]');
  const header = qs('[data-site-header]');
  if (!toggle || !menu) return;

  const links = qsa('[data-menu-link]', menu);
  const visuals = qsa('[data-menu-visual-img]', menu);
  const footerEls = qsa('[data-menu-footer-anim]', menu);

  let isOpen = false;
  let timeline = null;
  let focusTrap = null;

  function buildTimeline() {
    const tl = gsap.timeline({ paused: true });

    if (isReducedMotion()) {
      tl.set(menu, { clipPath: 'inset(0 0 0% 0)' });
      tl.set(links, { clearProps: 'all' });
      return tl;
    }

    tl.set(menu, { clipPath: 'inset(0 0 100% 0)' })
      .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: DURATION.slow, ease: EASE.expo })
      .from(
        links,
        { yPercent: 115, duration: DURATION.base, ease: EASE.expo, stagger: 0.055 },
        '-=0.55'
      )
      .from(footerEls, { autoAlpha: 0, y: 16, duration: DURATION.fast, stagger: 0.05 }, '-=0.35');

    return tl;
  }

  function setActiveVisual(key) {
    if (!visuals.length) return;
    visuals.forEach((img) => img.classList.toggle('is-active', img.dataset.menuVisualImg === key));
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
    timeline.play(0);

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

    const playback = timeline;
    const finish = () => {
      menu.classList.remove('is-open');
      setScrollLocked(false);
    };

    if (isReducedMotion() || !playback) {
      finish();
      return;
    }

    playback.eventCallback('onReverseComplete', finish);
    playback.reverse();
  }

  toggle.addEventListener('click', () => (isOpen ? close() : open()));

  menu.querySelector('[data-menu-backdrop]')?.addEventListener('click', close);

  links.forEach((link) => {
    if (!hasFinePointer()) return;
    const key = link.dataset.menuLink;
    link.addEventListener('mouseenter', () => setActiveVisual(key));
    link.addEventListener('focus', () => setActiveVisual(key));
  });

  if (visuals[0]) visuals[0].classList.add('is-active');

  qsa('[data-menu-close]', menu).forEach((el) => el.addEventListener('click', close));

  window.addEventListener('resize', () => {
    if (isOpen && timeline) {
      timeline.progress(1);
    }
  });

  return { open, close };
}
