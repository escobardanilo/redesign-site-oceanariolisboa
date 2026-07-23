import { isReducedMotion } from './gsap-config.js';
import { qs, qsa, clamp } from './utils.js';

/**
 * Species gallery — drag/swipe mode: a natively-scrollable, scroll-snapped
 * track (works with zero JS — touch swipe and trackpad scroll are native
 * browser behaviour) enhanced with desktop pointer-drag, prev/next buttons,
 * keyboard arrows and an IntersectionObserver-driven "active card" state.
 *
 * This is the fallback for mobile/tablet and for reduced-motion; on
 * desktop with motion allowed, js/scroll-effects.js → initSpeciesScroll()
 * uses the pinned "sticky scroll" mode instead. Both share the same
 * markup, so this returns a cleanup function — gsap.matchMedia() (in
 * scroll-effects.js) calls it when the viewport crosses back into this
 * mode's range, and needs every listener/observer torn down cleanly
 * rather than stacking duplicates.
 */
export function initSpeciesGalleryDrag() {
  const stage = qs('[data-species-stage]');
  const track = qs('[data-species-track]');
  if (!stage || !track) return () => {};

  const prevBtn = qs('[data-species-prev]');
  const nextBtn = qs('[data-species-next]');
  const counterCurrent = qs('[data-species-counter-current]');

  let activeIndex = 0;

  const cards = () => qsa('[data-species-card]', track);

  function setActive(index) {
    const list = cards();
    if (!list.length) return;
    activeIndex = clamp(index, 0, list.length - 1);
    list.forEach((card, i) => card.classList.toggle('is-active', i === activeIndex));
    if (counterCurrent) counterCurrent.textContent = String(activeIndex + 1).padStart(2, '0');
    if (prevBtn) prevBtn.disabled = activeIndex === 0;
    if (nextBtn) nextBtn.disabled = activeIndex === list.length - 1;
  }

  function scrollToIndex(index) {
    const list = cards();
    const target = list[clamp(index, 0, list.length - 1)];
    if (!target) return;
    track.scrollTo({
      left: target.offsetLeft - (track.clientWidth - target.clientWidth) / 2,
      behavior: isReducedMotion() ? 'auto' : 'smooth',
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          setActive(Number(entry.target.dataset.speciesCard));
        }
      });
    },
    { root: track, threshold: [0.6] }
  );
  cards().forEach((card) => observer.observe(card));

  const onPrevClick = () => scrollToIndex(activeIndex - 1);
  const onNextClick = () => scrollToIndex(activeIndex + 1);
  prevBtn?.addEventListener('click', onPrevClick);
  nextBtn?.addEventListener('click', onNextClick);

  const onStageKeydown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollToIndex(activeIndex + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollToIndex(activeIndex - 1);
    }
  };
  stage.addEventListener('keydown', onStageKeydown);

  // Desktop pointer drag-to-scroll — touch already scrolls natively via CSS.
  let isDown = false;
  let moved = false;
  let startX = 0;
  let startScroll = 0;
  let suppressClick = null;

  const onPointerDown = (event) => {
    if (event.pointerType === 'touch') return;
    isDown = true;
    moved = false;
    startX = event.clientX;
    startScroll = track.scrollLeft;
    stage.classList.add('is-dragging');
    track.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!isDown) return;
    const delta = event.clientX - startX;
    if (Math.abs(delta) > 4) moved = true;
    track.scrollLeft = startScroll - delta;
  };

  const endDrag = () => {
    if (!isDown) return;
    isDown = false;
    stage.classList.remove('is-dragging');
    if (moved) {
      suppressClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
      };
      track.addEventListener('click', suppressClick, { capture: true, once: true });
    }
  };
  track.addEventListener('pointerdown', onPointerDown);
  track.addEventListener('pointermove', onPointerMove);
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointerleave', endDrag);

  setActive(0);

  return () => {
    observer.disconnect();
    prevBtn?.removeEventListener('click', onPrevClick);
    nextBtn?.removeEventListener('click', onNextClick);
    stage.removeEventListener('keydown', onStageKeydown);
    track.removeEventListener('pointerdown', onPointerDown);
    track.removeEventListener('pointermove', onPointerMove);
    track.removeEventListener('pointerup', endDrag);
    track.removeEventListener('pointerleave', endDrag);
    if (suppressClick) track.removeEventListener('click', suppressClick, { capture: true });
    stage.classList.remove('is-dragging');
  };
}

/** Recognition (milestones) slider — one statement at a time, gentle autoplay. */
export function initRecognitionSlider() {
  const root = qs('[data-recognition-root]');
  if (!root) return;

  const prevBtn = qs('[data-milestone-prev]', root);
  const nextBtn = qs('[data-milestone-next]', root);
  let index = 0;
  let autoplayId = null;

  const slides = () => qsa('[data-milestone]', root);
  const dots = () => qsa('[data-milestone-dot]', root);

  function show(next) {
    const list = slides();
    if (!list.length) return;
    index = (next + list.length) % list.length;
    list.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots().forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  function stopAutoplay() {
    if (autoplayId) window.clearInterval(autoplayId);
    autoplayId = null;
  }

  function startAutoplay() {
    if (isReducedMotion() || slides().length < 2) return;
    autoplayId = window.setInterval(() => show(index + 1), 7000);
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  prevBtn?.addEventListener('click', () => {
    show(index - 1);
    resetAutoplay();
  });
  nextBtn?.addEventListener('click', () => {
    show(index + 1);
    resetAutoplay();
  });
  root.addEventListener('click', (event) => {
    const dot = event.target.closest('[data-milestone-dot]');
    if (!dot) return;
    show(Number(dot.dataset.milestoneDot));
    resetAutoplay();
  });

  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', startAutoplay);

  show(0);
  startAutoplay();
}

/** Highlights scroller: keeps prev/next affordance in sync (native snap scroll otherwise). */
export function initHighlightsScroller() {
  const root = qs('[data-highlights-root]');
  const scroller = qs('[data-highlights-track]', root || undefined);
  if (!scroller) return;

  scroller.setAttribute('tabindex', '0');
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', 'Destaques — deslize para ver mais');
  scroller.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scroller.scrollBy({ left: scroller.clientWidth * 0.8, behavior: isReducedMotion() ? 'auto' : 'smooth' });
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scroller.scrollBy({ left: -scroller.clientWidth * 0.8, behavior: isReducedMotion() ? 'auto' : 'smooth' });
    }
  });
}

export function initSliders() {
  // Species gallery is initialized by js/scroll-effects.js → initSpeciesScroll(),
  // which picks between this module's drag mode and the desktop sticky-scroll
  // mode via gsap.matchMedia() — see the doc comment on initSpeciesGalleryDrag().
  initRecognitionSlider();
  initHighlightsScroller();
}
