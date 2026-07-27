/**
 * CSS is linked directly from index.html (not imported here) so styling
 * never depends on JavaScript executing — see the <link rel="stylesheet">
 * tags in <head> for the real load order (reset → variables → … →
 * accessibility). Only the self-hosted fonts are pulled in via CSS
 * @import inside typography.css itself.
 */
import { gsap, DURATION, initSmoothScroll } from './gsap-config.js';
import { qs, qsa } from './utils.js';
import { renderAll } from './content.js';
import { runPreloader, runHeroIntro, initMagneticButtons, initCustomCursor } from './animations.js';
import { initAllScrollEffects } from './scroll-effects.js';
import { initNavigation } from './navigation.js';
import { initMenu } from './menu.js';
import { initSliders } from './sliders.js';
import { initMedia } from './media.js';
import { announce } from './accessibility.js';

function initCookieBanner() {
  const banner = qs('[data-cookie-banner]');
  if (!banner) return;
  const STORAGE_KEY = 'oceanario-redesign-cookie-consent';

  let stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }

  if (stored) {
    banner.hidden = true;
    return;
  }

  banner.hidden = false;

  const hide = () => {
    gsap.to(banner, {
      autoAlpha: 0,
      y: 16,
      duration: DURATION.fast,
      onComplete: () => {
        banner.hidden = true;
      },
    });
  };

  const persist = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* Storage unavailable (private browsing) — banner still dismisses for this visit. */
    }
  };

  qsa('[data-cookie-accept]', banner).forEach((btn) =>
    btn.addEventListener('click', () => {
      persist('accepted');
      hide();
    })
  );
  qsa('[data-cookie-decline]', banner).forEach((btn) =>
    btn.addEventListener('click', () => {
      persist('declined');
      hide();
    })
  );
}

function initNewsletterForm() {
  const form = qs('[data-newsletter-form]');
  if (!form) return;

  const emailInput = qs('input[type="email"]', form);
  const consentInput = qs('input[type="checkbox"]', form);
  const errorEl = qs('[data-newsletter-error]', form);
  const successEl = qs('[data-newsletter-success]', form);
  const submitBtn = qs('button[type="submit"]', form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (errorEl) errorEl.textContent = '';
    if (successEl) successEl.textContent = '';

    if (!emailInput || !emailInput.checkValidity()) {
      const message = 'Introduza um endereço de email válido.';
      if (errorEl) errorEl.textContent = message;
      announce(message);
      emailInput?.focus();
      return;
    }

    if (consentInput && !consentInput.checked) {
      const message = 'É necessário aceitar a política de privacidade para subscrever.';
      if (errorEl) errorEl.textContent = message;
      announce(message);
      consentInput.focus();
      return;
    }

    if (submitBtn) submitBtn.disabled = true;

    // Demonstrative only: no request is sent anywhere. See README.md → "Newsletter".
    window.setTimeout(() => {
      const message = 'Obrigado! Este é um protótipo demonstrativo — nenhum email foi enviado nem armazenado.';
      if (successEl) successEl.textContent = message;
      announce(message);
      form.reset();
      if (submitBtn) submitBtn.disabled = false;
    }, 550);
  });
}

function boot() {
  initSmoothScroll();
  initMenu();
  initSliders();
  initMedia();
  initMagneticButtons();
  initCustomCursor();
  initCookieBanner();
  initNewsletterForm();

  runHeroIntro();
  initAllScrollEffects();
  // After initAllScrollEffects: initNavigation's per-section header-theme
  // triggers (js/navigation.js) measure section positions at creation
  // time, and exhibitions/species pin their own scroll distance via a
  // spacer only initAllScrollEffects has inserted by this point — created
  // earlier, every section after either pin measured short by however
  // much scroll distance that pin's spacer hadn't been given yet.
  initNavigation();
}

function start() {
  renderAll();
  runPreloader({ onComplete: boot });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
