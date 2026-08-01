import { gsap, EASE, DURATION, isReducedMotion, setScrollLocked } from './gsap-config.js';
import { qs, qsa } from './utils.js';
import { createFocusTrap, pushEscapeHandler, popEscapeHandler, announce } from './accessibility.js';

/**
 * "Get Started" -> speed-test modal, replicating the Starlink app's
 * speed-test screen (circular gauge, live Mbps count-up, ping/jitter/
 * loss tiles) as a real animated UI rather than a static screenshot.
 * After the download phase finishes, a "Next" link fades in and takes
 * the visitor to starlink.com/residential — see docs/CREDITS.md for
 * why this is built live instead of using an image asset.
 */
export function initSpeedTestModal() {
  const modal = qs('[data-speedtest-modal]');
  const openers = qsa('[data-get-started]');
  if (!modal || openers.length === 0) return;

  const backdrop = qs('[data-speedtest-backdrop]', modal);
  const panel = qs('.speedtest-modal__panel', modal);
  const gaugeFill = qs('.speedtest-modal__gauge-fill', modal);
  const valueEl = qs('[data-speedtest-value]', modal);
  const statusEl = qs('[data-speedtest-status]', modal);
  const progressFill = qs('[data-speedtest-progress]', modal);
  const downloadValueEl = qs('[data-speedtest-download]', modal);
  const cancelBtn = qs('[data-speedtest-cancel]', modal);
  const nextLink = qs('[data-speedtest-next]', modal);

  const TARGET_MBPS = 198;
  const MAX_SCALE = 300;
  const CIRCUMFERENCE = 251.2;
  const TEST_DURATION = 3.2;

  let isOpen = false;
  let focusTrap = null;
  let testTimeline = null;
  let lastTrigger = null;

  function setGauge(mbps) {
    const progress = Math.min(mbps / MAX_SCALE, 1);
    if (gaugeFill) gaugeFill.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progress));
    if (valueEl) valueEl.textContent = String(Math.round(mbps));
    if (downloadValueEl) downloadValueEl.textContent = `${Math.round(mbps)} Mbps`;
  }

  function resetUI() {
    setGauge(0);
    if (statusEl) statusEl.textContent = 'Testing download…';
    if (progressFill) progressFill.style.width = '0%';
    if (downloadValueEl) downloadValueEl.textContent = '0 Mbps';
    if (cancelBtn) gsap.set(cancelBtn, { autoAlpha: 1, pointerEvents: 'auto' });
    if (nextLink) gsap.set(nextLink, { autoAlpha: 0, pointerEvents: 'none' });
  }

  function runTest() {
    testTimeline?.kill();

    if (isReducedMotion()) {
      setGauge(TARGET_MBPS);
      if (progressFill) progressFill.style.width = '100%';
      if (statusEl) statusEl.textContent = 'Download test complete';
      revealNext();
      return;
    }

    const proxy = { mbps: 0, progress: 0 };
    testTimeline = gsap.timeline({
      onComplete: () => {
        if (statusEl) statusEl.textContent = 'Download test complete';
        announce('Download test complete. 198 Mbps.');
        gsap.delayedCall(0.5, revealNext);
      },
    });

    testTimeline
      .to(
        proxy,
        {
          mbps: TARGET_MBPS,
          duration: TEST_DURATION,
          ease: EASE.standard,
          onUpdate: () => setGauge(proxy.mbps),
        },
        0
      )
      .to(
        proxy,
        {
          progress: 100,
          duration: TEST_DURATION,
          ease: EASE.inOutSoft,
          onUpdate: () => {
            if (progressFill) progressFill.style.width = `${proxy.progress}%`;
          },
        },
        0
      );
  }

  function revealNext() {
    if (!nextLink) return;
    gsap.set(nextLink, { pointerEvents: 'auto' });
    if (isReducedMotion()) {
      gsap.set(nextLink, { autoAlpha: 1 });
      if (cancelBtn) gsap.set(cancelBtn, { autoAlpha: 0, pointerEvents: 'none' });
      return;
    }
    const tl = gsap.timeline();
    if (cancelBtn) {
      tl.to(cancelBtn, { autoAlpha: 0, pointerEvents: 'none', duration: DURATION.fast }, 0);
    }
    tl.fromTo(
      nextLink,
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: DURATION.base, ease: EASE.expo },
      0.05
    );
  }

  function open(trigger) {
    if (isOpen) return;
    isOpen = true;
    lastTrigger = trigger || null;

    resetUI();
    modal.classList.add('is-open');
    setScrollLocked(true);

    if (isReducedMotion()) {
      gsap.set(backdrop, { autoAlpha: 1 });
      gsap.set(panel, { autoAlpha: 1, y: 0, scale: 1 });
    } else {
      gsap.set(backdrop, { autoAlpha: 0 });
      gsap.set(panel, { autoAlpha: 0, y: 24, scale: 0.97 });
      gsap.to(backdrop, { autoAlpha: 1, duration: DURATION.base, ease: EASE.standard });
      gsap.to(panel, { autoAlpha: 1, y: 0, scale: 1, duration: DURATION.slow, ease: EASE.expo, delay: 0.05 });
    }

    focusTrap = createFocusTrap(modal, lastTrigger);
    focusTrap.activate();
    pushEscapeHandler(close);

    runTest();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    testTimeline?.kill();
    popEscapeHandler(close);
    focusTrap?.deactivate();
    setScrollLocked(false);

    if (isReducedMotion()) {
      modal.classList.remove('is-open');
      return;
    }

    gsap.to(panel, { autoAlpha: 0, y: 16, scale: 0.97, duration: DURATION.fast, ease: EASE.standard });
    gsap.to(backdrop, {
      autoAlpha: 0,
      duration: DURATION.fast,
      ease: EASE.standard,
      onComplete: () => modal.classList.remove('is-open'),
    });
  }

  openers.forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      open(el);
    });
  });

  cancelBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  qsa('[data-speedtest-close]', modal).forEach((el) => el.addEventListener('click', close));

  return { open, close };
}
