import { gsap, ScrollTrigger, EASE, isReducedMotion, getLenis } from './gsap-config.js';
import { qs, qsa, formatIndex, clamp } from './utils.js';
import { fadeUp, countUp } from './animations.js';
import { initSpeciesGalleryDrag } from './sliders.js';

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

/**
 * News: cards start gathered at the grid's center — offset, rotated,
 * scaled down — and scrub apart into their real CSS grid position as the
 * section scrolls through (a "scatter to grid" reveal, not the generic
 * [data-reveal] fade-up the cards used before this).
 *
 * Offsets come from each card's offsetLeft/offsetTop rather than
 * getBoundingClientRect(): those reflect layout-flow position only, never
 * the transform GSAP is actively driving, so invalidateOnRefresh can
 * safely re-measure and recompute mid-scrub (e.g. a resize that reflows
 * the grid from 3 columns to 2) without the "from" values themselves
 * being thrown off by whatever position the scrub had already reached.
 * Requires .news__grid to be a positioned element (see components.css)
 * so offsetLeft/offsetTop resolve relative to it, not some ancestor.
 */
export function initNewsScatter() {
  const root = qs('[data-news-root]');
  const grid = qs('[data-news-grid]', root || undefined);
  if (!root || !grid) return;

  const cards = qsa('[data-news-card]', grid);
  if (!cards.length) return;

  if (isReducedMotion()) {
    ScrollTrigger.batch(cards, {
      start: 'top 85%',
      once: true,
      onEnter: (batch) => fadeUp(batch, { stagger: 0.08 }),
    });
    return;
  }

  const ROTATIONS = [-11, 8, -6, 12, -8, 5];

  gsap.from(cards, {
    x: (i, target) => grid.clientWidth / 2 - (target.offsetLeft + target.offsetWidth / 2),
    y: (i, target) => grid.clientHeight / 2 - (target.offsetTop + target.offsetHeight / 2),
    rotation: (i) => ROTATIONS[i % ROTATIONS.length],
    scale: 0.8,
    duration: 0.5,
    stagger: { each: 0.06, from: 'random' },
    ease: 'none',
    scrollTrigger: {
      trigger: grid,
      // Short and near the very top of the section, deliberately
      // decoupled from the grid's own height: the reveal is meant to
      // read as a quick "arrival" moment, resolved well before the grid
      // has scrolled through the viewport, not something still playing
      // out as the user is already on their way past the section. Two
      // earlier attempts tied the range to the full grid/viewport height
      // (start/end at the grid's top and bottom, or at fixed viewport
      // percentages spanning most of the screen) and both left the
      // second row of a two-row grid mid-flight well after the section
      // had mostly scrolled by — a fixed, short distance like this one
      // is what actually keeps "done dispersing" ahead of "still in
      // view", regardless of how many rows the grid has.
      start: 'top 95%',
      end: 'top 45%',
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  });
}

/**
 * Species: pinned "sticky scroll" on desktop with motion allowed — the
 * section stays fixed while cards crossfade in place, scrubbed to scroll
 * progress (not a fixed-duration animation, so it stays tied to exactly
 * how far the user has scrolled). Mobile/tablet and reduced-motion fall
 * back to the native drag/swipe track (js/sliders.js) — pinning a
 * multi-step sequence on a small screen or for a user who asked for less
 * motion is exactly what the reduced-motion and mobile rules in
 * docs/ANIMATIONS.md warn against.
 */
export function initSpeciesScroll() {
  const root = qs('[data-species-root]');
  const pinTarget = qs('[data-species-pin]', root || undefined);
  const track = qs('[data-species-track]', root || undefined);
  const stage = qs('[data-species-stage]', root || undefined);
  if (!root || !pinTarget || !track || !stage) return;

  const counterCurrent = qs('[data-species-counter-current]', root);
  const progressFill = qs('[data-species-progress-fill]', root);
  const prevBtn = qs('[data-species-prev]', root);
  const nextBtn = qs('[data-species-next]', root);

  function setCounter(index, total) {
    if (counterCurrent) counterCurrent.textContent = formatIndex(index + 1);
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === total - 1;
  }

  function setupSticky() {
    const cards = qsa('[data-species-card]', track);
    const n = cards.length;
    if (!n) return () => {};

    root.classList.add('species--sticky');
    const labels = cards.map((card) => card.querySelector('.species-card__label')).filter(Boolean);
    gsap.set(cards, { opacity: 0, scale: 0.94 });
    gsap.set(labels, { opacity: 0 });
    gsap.set(cards[0], { opacity: 1, scale: 1 });
    if (labels[0]) gsap.set(labels[0], { opacity: 1 });
    setCounter(0, n);

    const distancePerStep = 500; // px of scroll per species step

    const trigger = ScrollTrigger.create({
      trigger: pinTarget,
      start: 'top top',
      end: () => `+=${Math.max(n - 1, 1) * distancePerStep}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const virtual = self.progress * (n - 1);
        cards.forEach((card, i) => {
          const closeness = clamp(1 - Math.abs(virtual - i), 0, 1);
          gsap.set(card, { opacity: closeness, scale: 0.94 + closeness * 0.06 });
          // The name/latin label uses a steeper falloff (closeness³) than the
          // image: two names both partway visible read as illegible overlap,
          // where two partially-crossfaded photos still read fine.
          const label = card.querySelector('.species-card__label');
          if (label) gsap.set(label, { opacity: closeness ** 3 });
        });
        setCounter(Math.round(virtual), n);
        if (progressFill) progressFill.style.width = `${self.progress * 100}%`;
      },
    });

    function goToIndex(index) {
      const target = clamp(index, 0, n - 1);
      const progress = n > 1 ? target / (n - 1) : 0;
      const scrollPos = trigger.start + (trigger.end - trigger.start) * progress;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(scrollPos, { duration: isReducedMotion() ? 0 : 1 });
      else window.scrollTo({ top: scrollPos, behavior: isReducedMotion() ? 'auto' : 'smooth' });
    }

    const currentIndex = () => Math.round(trigger.progress * (n - 1));
    const onPrev = () => goToIndex(currentIndex() - 1);
    const onNext = () => goToIndex(currentIndex() + 1);
    prevBtn?.addEventListener('click', onPrev);
    nextBtn?.addEventListener('click', onNext);

    const onKeydown = (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToIndex(currentIndex() + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToIndex(currentIndex() - 1);
      }
    };
    stage.addEventListener('keydown', onKeydown);

    return () => {
      trigger.kill();
      prevBtn?.removeEventListener('click', onPrev);
      nextBtn?.removeEventListener('click', onNext);
      stage.removeEventListener('keydown', onKeydown);
      root.classList.remove('species--sticky');
      gsap.set(cards, { clearProps: 'all' });
      gsap.set(labels, { clearProps: 'all' });
    };
  }

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => (isReducedMotion() ? initSpeciesGalleryDrag() : setupSticky()));
  mm.add('(max-width: 899.98px)', () => initSpeciesGalleryDrag());
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
  initSpeciesScroll();
  initNewsScatter();
  refreshOnSettle();
}
