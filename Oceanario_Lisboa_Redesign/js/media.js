import { qsa, onFirstIntersect } from './utils.js';

/**
 * Video infrastructure — pause-offscreen and lazy source loading. No
 * build in this repository ships real video (see docs/ASSET_SOURCES.md),
 * so these no-op safely until a real `<video data-auto-pause data-lazy-src="…">`
 * element exists; both are ordinary DOM APIs, ready to use as soon as
 * licensed footage is added.
 */

export function initVideoVisibility() {
  const videos = qsa('video[data-auto-pause]');
  if (!videos.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play?.().catch(() => {});
        } else {
          video.pause?.();
        }
      });
    },
    { threshold: 0.25 }
  );
  videos.forEach((video) => observer.observe(video));
}

export function initLazyVideoSources() {
  const videos = qsa('video[data-lazy-src]');
  if (!videos.length) return;

  onFirstIntersect(videos, (video) => {
    const src = video.dataset.lazySrc;
    if (!src) return;
    const source = document.createElement('source');
    source.src = src;
    source.type = video.dataset.lazyType || 'video/mp4';
    video.appendChild(source);
    video.load();
  });
}

/** Belt-and-braces lazy loading for any <img> that missed the loading="lazy" attribute. */
export function initImageLazyFallback() {
  if ('loading' in HTMLImageElement.prototype) return;
  const images = qsa('img[loading="lazy"]');
  onFirstIntersect(images, (img) => {
    if (img.dataset.src) img.src = img.dataset.src;
  });
}

export function initMedia() {
  initVideoVisibility();
  initLazyVideoSources();
  initImageLazyFallback();
}
