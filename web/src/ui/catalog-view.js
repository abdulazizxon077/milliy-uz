import { CATEGORIES, categoryName } from '../../../shared/catalog.js';
import { countByCategory, DEFAULT_FILTERS, filterPlaces, hasPhone } from '../lib/catalog.js';
import {
  directionsUrl,
  distanceKm,
  escapeHtml,
  formatDistance,
  getOpenStatus,
  telHref,
} from '../lib/format.js';
import { state } from '../state.js';
import { refreshIcons } from './icons.js';
import { placeMediaHtml } from './place-media.js';

export const PAGE_SIZE = 24;

export function renderCategories() {
  const grid = document.getElementById('all-categories-grid');
  if (!grid) return;
  const counts = countByCategory(state.places, state.filters);
  grid.innerHTML = CATEGORIES.map((c) => {
    const count = counts[c.id] ?? 0;
    const active = state.filters.category === c.id;
    return `
    <button type="button" class="category-card cat-${escapeHtml(c.id)} glass-panel rounded-3xl p-4 sm:p-5 text-left flex flex-col gap-3 ${
      active ? 'is-active' : ''
    }" data-action="select-category" data-category="${escapeHtml(c.id)}" aria-pressed="${active}">
      <span class="category-icon-wrapper w-11 h-11 rounded-2xl flex items-center justify-center">
        <i data-lucide="${escapeHtml(c.icon)}" class="w-5 h-5"></i>
      </span>
      <span class="block">
        <span class="block text-sm font-extrabold text-white">${escapeHtml(c.name)}</span>
        <span class="block text-[11px] text-[#94a3b8] mt-1 leading-snug">${escapeHtml(c.desc)}</span>
      </span>
      <span class="mt-auto text-[11px] font-bold category-count ${count ? 'text-white' : 'text-[#64748b]'}" data-category-count="${escapeHtml(c.id)}">${count} ta joy</span>
    </button>`;
  }).join('');
}

function ratingHtml(place) {
  if (!place.reviewsCount) {
    return `<span class="text-[#64748b]" data-rating="0">Hali baholanmagan</span>`;
  }
  const rating = Number(place.rating).toFixed(1);
  return `<span class="text-[#b4f73a] font-bold" data-rating="${escapeHtml(place.rating)}">★ ${escapeHtml(rating)}</span> <span class="text-[#64748b]">(${escapeHtml(place.reviewsCount)})</span>`;
}

export function placeCardHtml(place) {
  const dist = formatDistance(distanceKm(state.userLocation, place));
  const status = getOpenStatus(place);
  const saved = state.bookmarks.includes(place.id);
  const id = escapeHtml(place.id);
  const call = hasPhone(place)
    ? `<a href="${escapeHtml(telHref(place.phone))}" class="neon-btn rounded-2xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"><i data-lucide="phone" class="w-3.5 h-3.5"></i>Qo'ng'iroq</a>`
    : `<button type="button" class="neon-btn rounded-2xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5" data-action="open-detail" data-id="${id}"><i data-lucide="info" class="w-3.5 h-3.5"></i>Batafsil</button>`;
  return `
  <article class="object-card glass-panel rounded-3xl overflow-hidden flex flex-col animate-fade-in">
    <div class="object-image-container relative h-44 cursor-pointer" data-action="open-detail" data-id="${id}">
      ${placeMediaHtml(place)}
      <div class="absolute top-3 left-3 right-14 flex flex-wrap gap-1.5">
        ${dist ? `<span class="badge-distance text-[10px] font-bold px-2.5 py-1 rounded-full">${escapeHtml(dist)}</span>` : ''}
        <span class="${status.cssClass} text-[10px] font-bold px-2.5 py-1 rounded-full">${escapeHtml(status.label)}</span>
      </div>
      <button type="button" class="bookmark-btn ${saved ? 'active' : ''} absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center" data-action="toggle-bookmark" data-id="${id}" aria-label="Saqlash" aria-pressed="${saved}">
        <i data-lucide="bookmark" class="w-4 h-4"></i>
      </button>
      <span class="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white">${escapeHtml(categoryName(place.category))}</span>
    </div>
    <div class="p-5 flex flex-col gap-3 flex-1">
      <div>
        <h3 class="text-base font-extrabold text-white leading-snug"><button type="button" class="text-left hover:text-[#b4f73a] focus-visible:text-[#b4f73a]" data-action="open-detail" data-id="${id}">${escapeHtml(place.name)}</button></h3>
        <p class="text-[11px] text-[#94a3b8] mt-1 line-clamp-2">${escapeHtml(place.subCategory)}</p>
      </div>
      <p class="text-[11px] text-[#94a3b8] flex items-start gap-1.5"><i data-lucide="map-pin" class="w-3.5 h-3.5 shrink-0 mt-0.5"></i><span class="line-clamp-2">${escapeHtml(place.address || 'Manzil ko\u2018rsatilmagan')}</span></p>
      <p class="text-[11px]">${ratingHtml(place)}</p>
      <div class="grid grid-cols-2 gap-2 mt-auto">
        ${call}
        <a href="${escapeHtml(directionsUrl(place))}" target="_blank" rel="noopener noreferrer" class="neon-btn-secondary rounded-2xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"><i data-lucide="navigation" class="w-3.5 h-3.5"></i>Marshrut</a>
      </div>
    </div>
  </article>`;
}

const filtersActive = (f) =>
  f.query?.trim() ||
  f.category !== DEFAULT_FILTERS.category ||
  f.region !== DEFAULT_FILTERS.region ||
  f.onlyOpenNow ||
  f.onlyWithPhone;

function emptyStateHtml() {
  return `
  <div class="col-span-full glass-panel rounded-3xl p-10 text-center space-y-3" data-empty-state>
    <span class="mx-auto w-12 h-12 rounded-2xl bg-[#0f271e] border border-[#183a2d] text-[#b4f73a] flex items-center justify-center"><i data-lucide="search" class="w-5 h-5"></i></span>
    <p class="text-base font-extrabold text-white">Hech narsa topilmadi</p>
    <p class="text-sm text-[#94a3b8] max-w-md mx-auto">Boshqa so'z bilan qidirib ko'ring yoki hudud va filtrlarni o'zgartiring.</p>
    <button type="button" data-action="reset-filters" class="neon-btn-secondary rounded-2xl px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5"><i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>Filtrlarni tozalash</button>
  </div>`;
}

export function renderPlaces() {
  const grid = document.getElementById('places-grid');
  const badge = document.getElementById('places-count-badge');
  const more = document.getElementById('places-more-btn');
  const reset = document.getElementById('catalog-reset-btn');
  if (!grid) return [];
  const list = filterPlaces(state.places, state.filters, state.userLocation);
  if (badge) badge.textContent = `${list.length} ta natija topildi`;
  const shown = list.slice(0, state.visibleCount);
  grid.innerHTML = list.length ? shown.map(placeCardHtml).join('') : emptyStateHtml();
  grid.setAttribute('aria-busy', 'false');
  if (more) {
    const rest = list.length - shown.length;
    more.classList.toggle('hidden', rest <= 0);
    const label = more.querySelector('span');
    if (label) label.textContent = `Yana ko'rsatish (${rest})`;
  }
  reset?.classList.toggle('hidden', !filtersActive(state.filters));
  refreshIcons();
  return list;
}
