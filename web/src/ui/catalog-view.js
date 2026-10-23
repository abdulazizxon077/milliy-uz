import { CATEGORIES, categoryDesc, categoryName } from '../../../shared/catalog.js';
import { countByCategory, filterPlaces } from '../lib/catalog.js';
import {
  directionsUrl,
  distanceKm,
  escapeHtml,
  formatDistance,
  getLocalizedPlace,
  getOpenStatus,
  safeImageUrl,
  telHref,
} from '../lib/format.js';
import { t } from '../lib/i18n.js';
import { state } from '../state.js';
import { refreshIcons } from './icons.js';

export function renderCategories() {
  const grid = document.getElementById('all-categories-grid');
  if (!grid) return;
  const lang = state.lang;
  const counts = countByCategory(state.places, state.filters);
  const viewText = t('categoryViewLink', lang);
  const countSuffix = t('categoryCountSuffix', lang);

  grid.innerHTML = CATEGORIES.map((c) => {
    const count = counts[c.id] ?? 0;
    const name = categoryName(c.id, lang);
    const desc = categoryDesc(c.id, lang);
    const isActive = state.filters.category === c.id;
    return `
    <button type="button" class="category-card glass-panel rounded-3xl p-5 text-left flex flex-col gap-3 ${
      isActive ? 'active border-[#b4f73a]' : ''
    }" data-action="select-category" data-category="${escapeHtml(c.id)}">
      <div class="category-icon-wrapper w-11 h-11 rounded-2xl flex items-center justify-center">
        <i data-lucide="${escapeHtml(c.icon)}" class="w-5 h-5 ${isActive ? 'text-[#071510]' : 'text-[#b4f73a]'}"></i>
      </div>
      <div>
        <h3 class="text-sm font-extrabold text-white">${escapeHtml(name)}</h3>
        <p class="text-[11px] text-[#94a3b8] mt-1">${escapeHtml(desc)}</p>
      </div>
      <span class="mt-auto flex items-center justify-between text-[11px] font-bold">
        <span class="text-[#b4f73a]">${escapeHtml(viewText)}</span>
        <span class="category-count ${count ? 'text-white' : 'text-[#64748b]'}" data-category-count="${escapeHtml(c.id)}">${count} ${escapeHtml(countSuffix)}</span>
      </span>
    </button>`;
  }).join('');
}

export function placeCardHtml(rawPlace) {
  const lang = state.lang;
  const place = getLocalizedPlace(rawPlace, lang);
  const showDist = Boolean(state.hasGpsLocation);
  const dist = showDist ? formatDistance(distanceKm(state.userLocation, place), lang) : null;
  const status = getOpenStatus(place, new Date(), lang);
  const saved = state.bookmarks.includes(place.id);
  const id = escapeHtml(place.id);
  const catName = categoryName(place.category, lang);
  const bookmarkLabel = t('bookmarkSave', lang);

  const isFree = Boolean(
    place.isFree ||
      String(place.priceRange || '').toLowerCase().includes('bepul') ||
      String(place.priceRange || '').toLowerCase().includes('free') ||
      String(place.priceRange || '').toLowerCase().includes('бесплатно'),
  );
  const priceBadgeClass = isFree
    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
  const priceBadgeText = isFree
    ? lang === 'ru'
      ? 'БЕСПЛАТНО'
      : lang === 'en'
      ? 'FREE'
      : 'BEPUL'
    : lang === 'ru'
    ? 'ПЛАТНО'
    : lang === 'en'
    ? 'PAID'
    : 'PULLIK';

  return `
  <article class="object-card glass-panel rounded-3xl overflow-hidden flex flex-col animate-fade-in">
    <div class="object-image-container relative h-44 cursor-pointer" data-action="open-detail" data-id="${id}">
      <img src="${escapeHtml(safeImageUrl(place.image))}" alt="${escapeHtml(place.name)}" loading="lazy" decoding="async" width="800" height="352" class="w-full h-full object-cover" />
      <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
        ${showDist ? `<span class="badge-distance text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><i data-lucide="navigation" class="w-3 h-3 text-[#b4f73a]"></i>${escapeHtml(dist)}</span>` : ''}
        <span class="${status.cssClass} text-[10px] font-bold px-2.5 py-1 rounded-full">${escapeHtml(status.label)}</span>
        <span class="${priceBadgeClass} text-[10px] font-black px-2 py-0.5 rounded-full">${priceBadgeText}</span>
      </div>
      <button type="button" class="bookmark-btn ${saved ? 'active' : ''} absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center" data-action="toggle-bookmark" data-id="${id}" aria-label="${escapeHtml(bookmarkLabel)}" aria-pressed="${saved}">
        <i data-lucide="bookmark" class="w-4 h-4"></i>
      </button>
      <span class="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white">${escapeHtml(catName)}</span>
    </div>
    <div class="p-5 flex flex-col gap-3 flex-1">
      <div>
        <h3 class="text-base font-extrabold text-white leading-snug"><button type="button" class="text-left hover:text-[#b4f73a] focus-visible:text-[#b4f73a]" data-action="open-detail" data-id="${id}">${escapeHtml(place.name)}</button></h3>
        <p class="text-[11px] text-[#94a3b8] mt-1 line-clamp-2">${escapeHtml(place.subCategory)}</p>
      </div>
      <div class="grid grid-cols-2 gap-2 text-[11px]">
        <div class="rounded-2xl bg-[#071510] border border-[#183a2d] p-3 space-y-1">
          <p class="text-[#94a3b8]">${t('experienceLabel', lang)} <span class="text-white font-bold">${escapeHtml(place.experienceYears)} ${t('yearsSuffix', lang)}</span></p>
          <p class="text-[#94a3b8] truncate">${t('specialistLabel', lang)} <span class="text-white font-bold">${escapeHtml(place.chiefSpecialist)}</span></p>
          <p class="text-[#94a3b8]">${t('ratingLabel', lang)} <span class="text-[#b4f73a] font-bold" data-rating="${escapeHtml(place.rating)}">★ ${escapeHtml(place.rating)}</span> (${escapeHtml(place.reviewsCount)})</p>
        </div>
        <div class="rounded-2xl bg-[#071510] border border-[#183a2d] p-3 flex flex-col justify-between">
          <div>
            <p class="text-[#94a3b8]">${t('pricesLabel', lang)}</p>
            <p class="text-white font-bold mt-0.5 text-xs">${escapeHtml(place.priceRange)}</p>
          </div>
          <p class="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <i data-lucide="clock" class="w-3 h-3"></i>
            <span>${escapeHtml(place.is247 ? "24/7 Tunu-kun" : `${place.openTime} - ${place.closeTime}`)}</span>
          </p>
        </div>
      </div>
      <p class="text-[11px] text-[#94a3b8] flex items-start gap-1.5"><i data-lucide="map-pin" class="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400"></i>${escapeHtml(place.address)}</p>
      <div class="grid grid-cols-2 gap-2 mt-auto">
        <a href="${escapeHtml(telHref(place.phone))}" class="neon-btn rounded-2xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"><i data-lucide="phone" class="w-3.5 h-3.5"></i>${t('callBtn', lang)}</a>
        <a href="${escapeHtml(directionsUrl(place))}" target="_blank" rel="noopener noreferrer" class="neon-btn-secondary rounded-2xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"><i data-lucide="navigation" class="w-3.5 h-3.5"></i>${t('routeBtn', lang)}</a>
      </div>
    </div>
  </article>`;
}

export function renderPlaces() {
  const grid = document.getElementById('places-grid');
  const badge = document.getElementById('places-count-badge');
  if (!grid) return [];
  const list = filterPlaces(state.places, state.filters, state.userLocation);
  const lang = state.lang;
  if (badge) badge.textContent = t('resultsFound', lang, { count: list.length });
  grid.innerHTML = list.length
    ? list.map(placeCardHtml).join('')
    : `<div class="col-span-full glass-panel rounded-3xl p-10 text-center text-sm text-[#94a3b8]">${escapeHtml(t('noResults', lang))}</div>`;
  refreshIcons();
  return list;
}
