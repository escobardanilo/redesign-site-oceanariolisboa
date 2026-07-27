import content from '../data/content.json';
import exhibitionsData from '../data/exhibitions.json';
import experiencesData from '../data/experiences.json';
import speciesData from '../data/species.json';
import newsData from '../data/news.json';
import placeholderUrl from '../assets/svg/media-placeholder.svg?url';
import { qs, qsa, formatIndex } from './utils.js';

/**
 * Renders every data-driven section from the JSON files in /data before
 * any GSAP/ScrollTrigger wiring runs. This is the single source of truth
 * for copy: editing content means editing the JSON, never the HTML (see
 * README.md → "Como substituir conteúdos"). Sections keep a <noscript>
 * fallback in their markup so the underlying information stays reachable
 * without JavaScript, per the project's accessibility rules.
 *
 * Images: every `image`/`media` path in data/*.json is looked up against
 * whatever real files actually exist under assets/images/ at build time
 * (via import.meta.glob below). If the file is there, Vite bundles it and
 * it's used as-is — no code change needed, just drop the file in with the
 * exact name referenced in the JSON and rebuild. If it's not there yet,
 * placeholderImg() falls back to the local placeholder SVG so the console
 * never shows a 404, with real alt text and a `data-pending-asset` marker.
 */

const officialImageModules = import.meta.glob('../assets/images/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const officialImages = Object.fromEntries(
  Object.entries(officialImageModules).map(([path, url]) => [path.replace(/^\.\.\//, ''), url])
);

function resolveImageSrc(pending) {
  const realUrl = officialImages[pending];
  return { src: realUrl || placeholderUrl, isPlaceholder: !realUrl };
}

function placeholderImg({ alt = '', pending = '', className = 'media-cover-img' } = {}) {
  const { src, isPlaceholder } = resolveImageSrc(pending);
  const pendingAttr = isPlaceholder ? ` data-pending-asset="${pending}"` : '';
  return `<img class="${className}" src="${src}" alt="${alt}" loading="lazy" decoding="async"${pendingAttr} width="800" height="600" />`;
}

function iconMarkup(key) {
  const icons = {
    clock: '<path d="M12 7v5l3 3M12 21a9 9 0 100-18 9 9 0 000 18Z"/>',
    calendar: '<path d="M4 5h16v16H4V5Zm0 4h16M8 3v4M16 3v4"/>',
    ticket: '<path d="M4 8a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 000-4V8Z"/>',
    pin: '<path d="M12 22s7-7.58 7-12A7 7 0 105 10c0 4.42 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
    access: '<circle cx="12" cy="5" r="2"/><path d="M5 21l4-9 3 3 3-3 4 9M9 12l3-7 3 7"/>',
  };
  return `<svg class="quick-info__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${icons[key] || icons.pin}</svg>`;
}

function renderTicketLinks() {
  qsa('[data-tickets-link]').forEach((el) => {
    el.href = content.nav.tickets.href;
  });
}

function renderMenu() {
  const list = qs('[data-menu-nav-list]');
  if (list) {
    list.innerHTML = content.nav.primary
      .map(
        (item) => `
      <li class="site-menu__item">
        <a class="site-menu__link" href="${item.href}" data-menu-link="${item.key}" data-menu-close>${item.label}</a>
      </li>`
      )
      .join('');
  }
}

function renderHero() {
  const root = qs('[data-hero-root]');
  if (!root) return;
  const { hero } = content;

  const eyebrow = qs('[data-hero-eyebrow]', root);
  if (eyebrow) eyebrow.textContent = hero.eyebrow;

  const title = qs('[data-hero-title]', root);
  if (title) {
    title.innerHTML = hero.titleLines
      .map((line) => `<span class="split-line" data-hero-line><span>${line}</span></span>`)
      .join(' ');
  }

  const subtitle = qs('[data-hero-subtitle]', root);
  if (subtitle) subtitle.textContent = hero.subtitle;

  const primary = qs('[data-hero-primary-cta]', root);
  if (primary) {
    primary.href = hero.primaryCta.href;
    primary.textContent = hero.primaryCta.label;
  }
  const secondary = qs('[data-hero-secondary-cta]', root);
  if (secondary) {
    secondary.href = hero.secondaryCta.href;
    const secondaryLabel = qs('[data-hero-secondary-label]', secondary);
    if (secondaryLabel) secondaryLabel.textContent = hero.secondaryCta.label;
    else secondary.textContent = hero.secondaryCta.label;
  }

  const facts = qs('[data-hero-quickfacts]', root);
  if (facts) {
    facts.innerHTML = hero.quickFacts
      .map((f) => `<span><strong>${f.label}</strong>${f.value}</span>`)
      .join('');
  }
}

function renderQuickInfo() {
  const root = qs('[data-quick-info-root]');
  if (!root) return;
  const eyebrow = qs('[data-quick-info-eyebrow]', root);
  if (eyebrow) eyebrow.textContent = content.quickInfo.eyebrow;
  const title = qs('[data-quick-info-title]', root);
  if (title) title.textContent = content.quickInfo.title;

  const list = qs('[data-quick-info-list]', root);
  if (list) {
    list.innerHTML = content.quickInfo.items
      .map(
        (item) => `
      <li class="quick-info__item" data-reveal>
        <a href="${item.href}" class="stack" style="gap: 0;">
          ${iconMarkup(item.icon)}
          <span class="quick-info__label text-label">${item.label}</span>
          <span class="quick-info__value">${item.value}</span>
        </a>
      </li>`
      )
      .join('');
  }
}

function renderHighlights() {
  const root = qs('[data-highlights-root]');
  if (!root) return;
  qs('[data-highlights-eyebrow]', root) && (qs('[data-highlights-eyebrow]', root).textContent = content.highlights.eyebrow);
  qs('[data-highlights-title]', root) && (qs('[data-highlights-title]', root).textContent = content.highlights.title);
  qs('[data-highlights-text]', root) && (qs('[data-highlights-text]', root).textContent = content.highlights.text);

  const track = qs('[data-highlights-track]', root);
  if (track) {
    track.innerHTML = content.highlights.items
      .map(
        (item) => `
      <article class="highlight-card" data-cursor-explore="Ver mais">
        <div class="highlight-card__media">${placeholderImg({ alt: item.imageAlt, pending: item.image })}</div>
        <div class="highlight-card__scrim"></div>
        <div class="highlight-card__body">
          <span class="highlight-card__category text-label">${item.category}</span>
          <h3 class="highlight-card__title">${item.title}</h3>
          <p class="highlight-card__text">${item.text}</p>
          <a class="btn btn-sm btn-accent highlight-card__cta" href="${item.cta.href}" target="_blank" rel="noopener noreferrer">${item.cta.label}</a>
        </div>
      </article>`
      )
      .join('');
  }
}

function renderExhibitions() {
  const root = qs('[data-exhibitions-root]');
  if (!root) return;
  qs('[data-exhibitions-eyebrow]', root) && (qs('[data-exhibitions-eyebrow]', root).textContent = exhibitionsData.eyebrow);
  qs('[data-exhibitions-title]', root) && (qs('[data-exhibitions-title]', root).textContent = exhibitionsData.title);
  qs('[data-exhibitions-text]', root) && (qs('[data-exhibitions-text]', root).textContent = exhibitionsData.text);

  const track = qs('[data-exhibitions-track]', root);
  if (track) {
    track.innerHTML = exhibitionsData.items
      .map(
        (item) => `
      <article class="exhibition-panel" data-exhibition-panel>
        <div class="exhibition-panel__media">${placeholderImg({ alt: item.imageAlt, pending: item.image })}</div>
        <div class="exhibition-panel__copy">
          <span class="exhibition-panel__index">${formatIndex(item.index)}</span>
          <p class="text-label" style="margin-top: var(--space-2xs); color: var(--color-lime);">${item.category}</p>
          <h3 class="exhibition-panel__title">${item.title}</h3>
          <p class="exhibition-panel__text">${item.text}</p>
          <a class="btn btn-outline btn-on-dark exhibition-panel__cta" href="${item.cta.href}" target="_blank" rel="noopener noreferrer">${item.cta.label}</a>
        </div>
      </article>`
      )
      .join('');
  }

  const total = qs('[data-exhibitions-counter-total]', root);
  if (total) total.textContent = formatIndex(exhibitionsData.items.length);
}

function renderExperiences() {
  const root = qs('[data-experiences-root]');
  if (!root) return;
  qs('[data-experiences-eyebrow]', root) && (qs('[data-experiences-eyebrow]', root).textContent = experiencesData.eyebrow);
  qs('[data-experiences-title]', root) && (qs('[data-experiences-title]', root).textContent = experiencesData.title);
  qs('[data-experiences-text]', root) && (qs('[data-experiences-text]', root).textContent = experiencesData.text);

  const grid = qs('[data-experiences-grid]', root);
  if (grid) {
    grid.innerHTML = experiencesData.items
      .map(
        (item) => `
      <a class="experience-card" href="${item.href}" target="_blank" rel="noopener noreferrer" data-reveal data-cursor-explore="Explorar">
        <div class="experience-card__media">${placeholderImg({ alt: item.imageAlt, pending: item.image })}</div>
        <div class="experience-card__scrim"></div>
        <div class="experience-card__body">
          <span class="experience-card__eyebrow text-label">${item.eyebrow}</span>
          <h3 class="experience-card__title">${item.title}</h3>
          <p class="experience-card__reveal text-body-sm">${item.reveal}</p>
          <span class="experience-card__cta">${item.cta}
            <svg class="experience-card__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>
          </span>
        </div>
      </a>`
      )
      .join('');
  }
}

function renderConservation() {
  const root = qs('[data-conservation-root]');
  if (!root) return;
  const c = content.conservation;
  qs('[data-conservation-kicker]', root) && (qs('[data-conservation-kicker]', root).textContent = c.kicker);
  qs('[data-conservation-title]', root) && (qs('[data-conservation-title]', root).textContent = c.title);
  qs('[data-conservation-text]', root) && (qs('[data-conservation-text]', root).textContent = c.text);
  qs('[data-conservation-text2]', root) && (qs('[data-conservation-text2]', root).textContent = c.text2);

  const cta = qs('[data-conservation-cta]', root);
  if (cta) {
    cta.href = c.cta.href;
    cta.textContent = c.cta.label;
  }

  const stats = qs('[data-conservation-stats]', root);
  if (stats) {
    stats.innerHTML = c.stats
      .map(
        (s, i) => `
      <div class="stack" style="gap: var(--space-2xs);">
        <span class="conservation__stat-value" data-count-to="${s.value}" data-count-suffix="${s.suffix}" data-stat-index="${i}">0${s.suffix}</span>
        <span class="conservation__stat-label text-body-sm">${s.label}</span>
      </div>`
      )
      .join('');
  }

  const media = qs('[data-conservation-media]', root);
  if (media) media.innerHTML = placeholderImg({ alt: c.mediaAlt, pending: c.media, className: 'media-cover-img' });
}

function renderSpecies() {
  const root = qs('[data-species-root]');
  if (!root) return;
  qs('[data-species-eyebrow]', root) && (qs('[data-species-eyebrow]', root).textContent = speciesData.eyebrow);
  qs('[data-species-title]', root) && (qs('[data-species-title]', root).textContent = speciesData.title);
  qs('[data-species-text]', root) && (qs('[data-species-text]', root).textContent = speciesData.text);

  const track = qs('[data-species-track]', root);
  if (track) {
    track.innerHTML = speciesData.items
      .map(
        (item, i) => `
      <article class="species-card" data-species-card="${i}" tabindex="0" aria-label="${item.name}${item.latin ? `, ${item.latin}` : ''}">
        ${placeholderImg({ alt: `${item.name}${item.latin ? ` (${item.latin})` : ''}`, pending: item.image })}
        <div class="species-card__scrim"></div>
        <div class="species-card__label">
          <p class="species-card__name">${item.name}</p>
          ${item.latin ? `<p class="species-card__latin">${item.latin}</p>` : ''}
        </div>
      </article>`
      )
      .join('');
  }

  const counterTotal = qs('[data-species-counter-total]', root);
  if (counterTotal) counterTotal.textContent = formatIndex(speciesData.items.length);
}

function renderRecognition() {
  const root = qs('[data-recognition-root]');
  if (!root) return;
  qs('[data-recognition-eyebrow]', root) && (qs('[data-recognition-eyebrow]', root).textContent = content.recognition.eyebrow);
  qs('[data-recognition-title]', root) && (qs('[data-recognition-title]', root).textContent = content.recognition.title);
  qs('[data-recognition-note]', root) && (qs('[data-recognition-note]', root).textContent = content.recognition.note);

  const track = qs('[data-recognition-track]', root);
  const dots = qs('[data-recognition-dots]', root);
  if (track) {
    track.innerHTML = content.recognition.items
      .map(
        (item, i) => `
      <div class="milestone${i === 0 ? ' is-active' : ''}" data-milestone="${i}">
        <p class="milestone__statement">"${item.statement}"</p>
        <span class="milestone__source text-label">${item.source}</span>
      </div>`
      )
      .join('');
  }
  if (dots) {
    dots.innerHTML = content.recognition.items
      .map((_, i) => `<button type="button" class="milestone__dot${i === 0 ? ' is-active' : ''}" data-milestone-dot="${i}" aria-label="Ver marco ${i + 1}"></button>`)
      .join('');
  }
}

function renderNews() {
  const root = qs('[data-news-root]');
  if (!root) return;
  qs('[data-news-eyebrow]', root) && (qs('[data-news-eyebrow]', root).textContent = newsData.eyebrow);
  qs('[data-news-title]', root) && (qs('[data-news-title]', root).textContent = newsData.title);
  qs('[data-news-text]', root) && (qs('[data-news-text]', root).textContent = newsData.text);

  const grid = qs('[data-news-grid]', root);
  if (grid) {
    grid.innerHTML = newsData.items
      .map(
        (item) => `
      <article class="news-card" data-news-card>
        <a href="${item.href}" target="_blank" rel="noopener noreferrer">
          <div class="news-card__media">${placeholderImg({ alt: item.imageAlt, pending: item.image })}</div>
          <div class="news-card__meta text-label">
            <span>${item.category}</span>
          </div>
          <h3 class="news-card__title">${item.title}</h3>
          <p class="news-card__excerpt text-body-sm">${item.excerpt}</p>
          <span class="link-inline news-card__link">Ler mais</span>
        </a>
      </article>`
      )
      .join('');
  }
}

function renderPlanVisit() {
  const root = qs('[data-plan-visit-root]');
  if (!root) return;
  const p = content.planVisit;
  qs('[data-plan-visit-eyebrow]', root) && (qs('[data-plan-visit-eyebrow]', root).textContent = p.eyebrow);
  qs('[data-plan-visit-title]', root) && (qs('[data-plan-visit-title]', root).textContent = p.title);
  qs('[data-plan-visit-text]', root) && (qs('[data-plan-visit-text]', root).textContent = p.text);

  const list = qs('[data-plan-visit-list]', root);
  if (list) {
    list.innerHTML = p.items
      .map(
        (item) => `
      <div class="plan-visit__item">
        <dt class="plan-visit__term text-label">${item.term}</dt>
        <dd class="plan-visit__desc">${item.desc}${item.href ? ` <a href="${item.href}" target="_blank" rel="noopener noreferrer">${item.linkLabel}</a>` : ''}</dd>
      </div>`
      )
      .join('');
  }

  const mapLink = qs('[data-plan-visit-map-link]', root);
  if (mapLink) mapLink.href = p.mapHref;

  // insertAdjacentHTML (not innerHTML=) so the static map-link anchor
  // already inside [data-plan-visit-media] survives the render.
  const mapMedia = qs('[data-plan-visit-media]', root);
  if (mapMedia) {
    mapMedia.insertAdjacentHTML(
      'afterbegin',
      placeholderImg({ alt: `Mapa de acesso ao Oceanário de Lisboa — ${p.mapAddress}`, pending: 'assets/images/visit/mapa-acesso.jpg' })
    );
  }
}

function renderNewsletter() {
  const root = qs('[data-newsletter-root]');
  if (!root) return;
  const n = content.newsletter;
  qs('[data-newsletter-eyebrow]', root) && (qs('[data-newsletter-eyebrow]', root).textContent = n.eyebrow);
  qs('[data-newsletter-title]', root) && (qs('[data-newsletter-title]', root).textContent = n.title);
  qs('[data-newsletter-text]', root) && (qs('[data-newsletter-text]', root).textContent = n.text);
  const privacy = qs('[data-newsletter-privacy]', root);
  if (privacy) privacy.href = n.privacyHref;
  qs('[data-newsletter-disclaimer]', root) && (qs('[data-newsletter-disclaimer]', root).textContent = n.disclaimer);
}

function renderFooter() {
  const root = qs('[data-footer-root]');
  if (!root) return;

  const columns = qs('[data-footer-columns]', root);
  if (columns) {
    columns.innerHTML = content.footer.columns
      .map(
        (col) => `
      <div class="footer-col">
        <p class="footer-col__title text-label">${col.title}</p>
        <ul>
          ${col.links
            .map((l) => `<li><a href="${l.href}"${l.href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${l.label}</a></li>`)
            .join('')}
        </ul>
      </div>`
      )
      .join('');
  }

  const legal = qs('[data-footer-legal]', root);
  if (legal) {
    legal.innerHTML = content.footer.legal
      .map((l) => `<a href="${l.href}" target="_blank" rel="noopener noreferrer">${l.label}</a>`)
      .join('');
  }

  const socials = qs('[data-footer-socials]', root);
  if (socials) {
    socials.innerHTML = content.social
      .map((s) => `<a href="${s.href}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}">${s.label}</a>`)
      .join('');
  }

  const disclaimer = qs('[data-footer-disclaimer]', root);
  if (disclaimer) disclaimer.textContent = content.footer.disclaimer;
}

export function renderAll() {
  renderMenu();
  renderHero();
  renderQuickInfo();
  renderHighlights();
  renderExhibitions();
  renderExperiences();
  renderConservation();
  renderSpecies();
  renderRecognition();
  renderNews();
  renderPlanVisit();
  renderNewsletter();
  renderFooter();
  renderTicketLinks();
}

export { content, exhibitionsData, experiencesData, speciesData, newsData };
