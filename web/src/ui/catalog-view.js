import { CATEGORIES, categoryName } from '../../../shared/catalog.js';
import { filterPlaces } from '../lib/catalog.js';
import {
  directionsUrl,
  distanceKm,
  escapeHtml,
  formatDistance,
  getOpenStatus,
  safeImageUrl,
  telHref,
} from '../lib/format.js';
import { state } from '../state.js';
import { refreshIcons } from './icons.js';

export function renderCategories() {
  const grid = document.getElementById('all-categories-grid');
  if (!grid) return;
  grid.innerHTML = CATEGORIES.map(
    (c) => `
    <button type="button" class="category-card glass-panel rounded-3xl p-5 text-left flex flex-col gap-3 ${
      state.filters.category === c.id ? 'border-[#b4f73a]' : ''
    }" data-action="select-category" data-category="${escapeHtml(c.id)}">
      <div class="category-icon-wrapper w-11 h-11 rounded-2xl flex items-center justify-center">
        <i data-lucide="${escapeHtml(c.icon)}" class="w-5 h-5 text-[#b4f73a]"></i>
      </div>
      <div>
        <h3 class="text-sm font-extrabold text-white">${escapeHtml(c.name)}</h3>
        <p class="text-[11px] text-[#94a3b8] mt-1">${escapeHtml(c.desc)}</p>
      </div>
      <span class="text-[11px] font-bold text-[#b4f73a] mt-auto">Ko'rish →</span>
    </button>`,
  ).join('');
}

export function placeCardHtml(place) {
  const dist = formatDistance(distanceKm(state.userLocation, place));
  const status = getOpenStatus(place);
  const saved = state.bookmarks.includes(place.id);
  const id = escapeHtml(place.id);
  return `
  <article class="object-card glass-panel rounded-3xl overflow-hidden flex flex-col animate-fade-in">
    <div class="object-image-container relative h-44 cursor-pointer" data-action="open-detail" data-id="${id}">
      <img src="${escapeHtml(safeImageUrl(place.image))}" alt="${escapeHtml(place.name)}" loading="lazy" decoding="async" width="800" height="352" class="w-full h-full object-cover" />
      <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
        <span class="badge-distance text-[10px] font-bold px-2.5 py-1 rounded-full">${escapeHtml(dist)}</span>
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
      <div class="grid grid-cols-2 gap-2 text-[11px]">
        <div class="rounded-2xl bg-[#071510] border border-[#183a2d] p-3 space-y-1">
          <p class="text-[#94a3b8]">Tajriba: <span class="text-white font-bold">${escapeHtml(place.experienceYears)} yil</span></p>
          <p class="text-[#94a3b8] truncate">Mutaxassis: <span class="text-white font-bold">${escapeHtml(place.chiefSpecialist)}</span></p>
          <p class="text-[#94a3b8]">Reyting: <span class="text-[#b4f73a] font-bold">★ ${escapeHtml(place.rating)}</span> (${escapeHtml(place.reviewsCount)})</p>
        </div>
        <div class="rounded-2xl bg-[#071510] border border-[#183a2d] p-3">
          <p class="text-[#94a3b8]">Narxlar</p>
          <p class="text-white font-bold mt-1">${escapeHtml(place.priceRange)}</p>
        </div>
      </div>
      <p class="text-[11px] text-[#94a3b8] flex items-start gap-1.5"><i data-lucide="map-pin" class="w-3.5 h-3.5 shrink-0 mt-0.5"></i>${escapeHtml(place.address)}</p>
      <div class="grid grid-cols-2 gap-2 mt-auto">
        <a href="${escapeHtml(telHref(place.phone))}" class="neon-btn rounded-2xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"><i data-lucide="phone" class="w-3.5 h-3.5"></i>Qo'ng'iroq</a>
        <a href="${escapeHtml(directionsUrl(place))}" target="_blank" rel="noopener noreferrer" class="neon-btn-secondary rounded-2xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"><i data-lucide="navigation" class="w-3.5 h-3.5"></i>Marshrut</a>
      </div>
    </div>
  </article>`;
}

export function renderPlaces() {
  const grid = document.getElementById('places-grid');
  const badge = document.getElementById('places-count-badge');
  if (!grid) return [];
  const list = filterPlaces(state.places, state.filters, state.userLocation);
  if (badge) badge.textContent = `${list.length} ta natija topildi`;
  grid.innerHTML = list.length
    ? list.map(placeCardHtml).join('')
    : `<div class="col-span-full glass-panel rounded-3xl p-10 text-center text-sm text-[#94a3b8]">Ushbu parametrlar bo'yicha ma'lumot topilmadi</div>`;
  refreshIcons();
  return list;
}
