/**
 * CSS is linked directly from each page's <head> (not imported here) so
 * styling never depends on JavaScript executing.
 */
import { initSmoothScroll } from './gsap-config.js';
import { qs, qsa, openInNewTab } from './utils.js';
import { runHeroIntro, initMagneticButtons, initStarfield } from './animations.js';
import { initAllScrollEffects } from './scroll-effects.js';
import { initNavigation } from './navigation.js';
import { initMenu } from './menu.js';
import { initSpeedTestModal } from './speedtest-modal.js';
import { announce } from './accessibility.js';

const STARLINK_LOGIN_URL = 'https://www.starlink.com/auth/login';

function initSignInForm() {
  const form = qs('[data-signin-form]');
  if (!form) return;

  const submitBtn = qs('button[type="submit"]', form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (submitBtn) {
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = 'Redirecting to Starlink…';
      submitBtn.disabled = true;
    }
    announce('Redirecting to the official Starlink account portal.');

    // Demonstrative only: there is no real backend, so this hands off to
    // the real Starlink account login instead of pretending to authenticate.
    window.setTimeout(() => {
      openInNewTab(STARLINK_LOGIN_URL);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText;
      }
    }, 650);
  });
}

function initContactForm() {
  const form = qs('[data-contact-form]');
  if (!form) return;

  const successEl = qs('[data-contact-success]', form);
  const submitBtn = qs('button[type="submit"]', form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    window.setTimeout(() => {
      const message = 'This is a demonstration form — no message was actually sent. For real support, use the contact methods above.';
      if (successEl) successEl.textContent = message;
      announce(message);
      form.reset();
      if (submitBtn) submitBtn.disabled = false;
    }, 500);
  });
}

function initStarfields() {
  qsa('[data-starfield]').forEach((canvas) => initStarfield(canvas));
}

function initCurrentYear() {
  qsa('[data-current-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

function boot() {
  initSmoothScroll();
  initMenu();
  initSpeedTestModal();
  initMagneticButtons();
  initStarfields();
  initSignInForm();
  initContactForm();
  initCurrentYear();

  runHeroIntro();
  initAllScrollEffects();
  initNavigation();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
