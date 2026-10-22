import { CATEGORIES } from '../../../shared/catalog.js';
import { escapeHtml, safeImageUrl } from '../lib/format.js';

const iconFor = (category) => CATEGORIES.find((c) => c.id === category)?.icon ?? 'map-pin';

/**
 * The picture of a place: a licensed photo when the catalog has one, otherwise
 * a category illustration. Photos fall back to the illustration if they fail.
 */
export function placeMediaHtml(place, { eager = false } = {}) {
  const icon = escapeHtml(iconFor(place.category));
  const placeholder = `<div class="place-placeholder cat-${escapeHtml(place.category)}" aria-hidden="true"><i data-lucide="${icon}" class="w-10 h-10"></i></div>`;
  const src = safeImageUrl(place.image);
  if (!src) return placeholder;
  return `${placeholder}<img src="${escapeHtml(src)}" alt="${escapeHtml(place.name)}" ${eager ? '' : 'loading="lazy"'} decoding="async" width="800" height="450" class="place-photo" />`;
}

/** Attribution line for a Commons photo, required by its licence. */
export function imageCreditHtml(place) {
  if (!safeImageUrl(place.image) || !place.imageCredit) return '';
  const text = `Rasm: ${escapeHtml(place.imageCredit)}`;
  const source = safeImageUrl(place.imageSource);
  return source
    ? `<a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer" class="image-credit">${text}</a>`
    : `<span class="image-credit">${text}</span>`;
}

/** Small square picture for lists: the photo or the category icon. */
export function placeThumbHtml(place, size = 56) {
  const src = safeImageUrl(place.image);
  const box = `width:${size}px;height:${size}px`;
  if (src) {
    return `<img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" width="${size}" height="${size}" style="${box}" class="place-thumb rounded-xl object-cover shrink-0" />`;
  }
  return `<span style="${box}" class="place-thumb place-placeholder cat-${escapeHtml(place.category)} rounded-xl shrink-0" aria-hidden="true"><i data-lucide="${escapeHtml(iconFor(place.category))}" class="w-5 h-5"></i></span>`;
}
