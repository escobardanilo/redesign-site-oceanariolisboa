import { gsap, ScrollTrigger, EASE, isReducedMotion } from './gsap-config.js';
import { qs, qsa, formatIndex } from './utils.js';
import { fadeUp, countUp } from './animations.js';

/**
 * All ScrollTrigger wiring lives here, one function per section. Each is
 * safe to call even if its section isn't present in the DOM. Breakpoint
 * behaviour is handled with gsap.matchMedia() rather than manual resize
 * listeners, per docs/ANIMATIONS.md.
 */

/** Generic fade-up-on-enter for any element flagged [data-reveal]. */
export function initScrollReveals() {
  const items = qsa('[data-reveal]');
  if (!items.length) return;

  ScrollTrigger.batch(items, {
    start: 'top 85%',
    once: true,
    onEnter: (batch) => fadeUp(batch, { stagger: 0.1 }),
  });
}

/** Very subtle hero media parallax — disabled under reduced motion. */
export function initHeroParallax() {
  const hero = qs('[data-hero-root]');
  const media = qs('[data-hero-media]', hero || undefined);
  if (!hero || !media || isReducedMotion()) return;

  gsap.to(media, {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
}

/** Expanding rule under the quick-info strip title. */
export function initQuickInfoLines() {
  const root = qs('[data-quick-info-root]');
  if (!root) return;
  const divider = qs('.divider', root);
  if (!divider) return;

  gsap.to(divider, {
    scaleX: 1,
    duration: 1,
    ease: EASE.expo,
    scrollTrigger: { trigger: root, start: 'top 80%', once: true },
  });
}

/**
 * Exhibitions: pinned horizontal narrative on desktop, native scroll-snap
 * slider on tablet/mobile/reduced-motion. Both modes keep the counter and
 * progress bar in sync.
 */
export function initExhibitionsScroll() {
  const root = qs('[data-exhibitions-root]');
  const pinTarget = qs('[data-exhibitions-pin]', root || undefined);
  const track = qs('[data-exhibitions-track]', root || undefined);
  if (!root || !pinTarget || !track) return;

  const progressFill = qs('[data-exhibitions-progress-fill]', root);
  const counterCurrent = qs('[data-exhibitions-counter-current]', root);

  const setCounter = (index) => {
    if (counterCurrent) counterCurrent.textContent = formatIndex(index + 1);
  };

  function setupSlider() {
    const panels = qsa('[data-exhibition-panel]', track);
    root.classList.add('exhibitions--slider');

    const onScroll = () => {
      const index = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
      setCounter(Math.min(index, panels.length - 1));
      if (progressFill) {
        const max = track.scrollWidth - track.clientWidth || 1;
        progressFill.style.width = `${(track.scrollLeft / max) * 100}%`;
      }
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      track.removeEventListener('scroll', onScroll);
      root.classList.remove('exhibitions--slider');
    };
  }

  function setupPin() {
    const panels = qsa('[data-exhibition-panel]', track);
    root.classList.remove('exhibitions--slider');
    gsap.set(track, { x: 0 });
    const distance = () => Math.max(track.scrollWidth - pinTarget.clientWidth, 0);

    const tween = gsap.to(track, { x: () => -distance(), ease: 'none' });

    const trigger = ScrollTrigger.create({
      trigger: pinTarget,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: tween,
      onUpdate: (self) => {
        const index = Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1)));
        setCounter(index);
        if (progressFill) progressFill.style.width = `${self.progress * 100}%`;
      },
    });

    return () => {
      trigger.kill();
      tween.kill();
    };
  }

  // Two mutually-exclusive string queries, each guaranteed by GSAP to
  // evaluate (and fire once immediately if it matches) independently —
  // unlike the multi-condition object form of matchMedia, which only
  // invokes its callback when at least one named condition is currently
  // true, and stayed silent here whenever isDesktop and reduced were both
  // false at once (e.g. a narrow viewport with motion not reduced).
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => (isReducedMotion() ? setupSlider() : setupPin()));
  mm.add('(max-width: 899.98px)', () => setupSlider());
}

/** Conservation: line-by-line title reveal, clip-path media, stat count-up. */
export function initConservationScroll() {
  const root = qs('[data-conservation-root]');
  if (!root) return;

  const title = qs('[data-conservation-title]', root);
  const media = qs('[data-conservation-media]', root);
  const paragraphs = qsa('[data-conservation-text], [data-conservation-text2]', root);
  const stats = qsa('[data-count-to]', root);

  const tl = gsap.timeline({
    scrollTrigger: { trigger: root, start: 'top 70%', once: true },
  });

  if (title) tl.from(title, { autoAlpha: 0, y: isReducedMotion() ? 0 : 28, duration: isReducedMotion() ? 0.3 : 0.9, ease: EASE.expo });
  if (paragraphs.length) tl.from(paragraphs, { autoAlpha: 0, y: isReducedMotion() ? 0 : 16, duration: isReducedMotion() ? 0.2 : 0.7, stagger: 0.12 }, '-=0.5');
  if (media) {
    tl.fromTo(
      media,
      { clipPath: isReducedMotion() ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)' },
      { clipPath: 'inset(0 0 0% 0)', duration: isReducedMotion() ? 0.3 : 1.3, ease: EASE.expo },
      '-=0.6'
    );
  }

  stats.forEach((stat) => {
    ScrollTrigger.create({
      trigger: stat,
      start: 'top 85%',
      once: true,
      onEnter: () => countUp(stat, { to: Number(stat.dataset.countTo), suffix: stat.dataset.countSuffix || '' }),
    });
  });
}

/** Species stage: fade/scale entrance only — drag/keyboard logic lives in sliders.js. */
export function initSpeciesReveal() {
  const root = qs('[data-species-root]');
  const stage = qs('[data-species-stage]', root || undefined);
  if (!root || !stage) return;

  fadeUp(stage, {
    y: 24,
    scrollTrigger: { trigger: stage, start: 'top 85%', once: true },
  });
}

/** Recalculates all ScrollTriggers after layout-affecting async work (fonts, dynamic render). */
export function refreshOnSettle() {
  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts?.ready) {
    document.fonts.ready.then(refresh).catch(() => {});
  }
  window.addEventListener('load', refresh, { once: true });
}

export function initAllScrollEffects() {
  initScrollReveals();
  initHeroParallax();
  initQuickInfoLines();
  initExhibitionsScroll();
  initConservationScroll();
  initSpeciesReveal();
  refreshOnSettle();
}
