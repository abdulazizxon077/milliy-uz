import { categoryName } from '../../../shared/catalog.js';
import { api } from '../api.js';
import {
  directionsUrl,
  distanceKm,
  escapeHtml,
  formatDistance,
  getOpenStatus,
  safeImageUrl,
  telHref,
} from '../lib/format.js';
import { findPlace, notify, state, upsertPlace } from '../state.js';
import { refreshIcons } from './icons.js';
import { closeModal, openModal } from './modal.js';
import { showToast } from './toast.js';

let currentId = null;

const infoCard = (title, rows) => `
  <div class="rounded-2xl bg-[#071510] border border-[#183a2d] p-4 space-y-1.5 text-xs">
    <p class="text-[10px] font-bold uppercase tracking-wider text-[#b4f73a]">${title}</p>
    ${rows}
  </div>`;

function reviewsHtml(reviews) {
  if (!reviews?.length) {
    return `<p class="text-xs text-[#94a3b8]">Hozircha sharhlar mavjud emas. Birinchi bo'lib fikr qoldiring!</p>`;
  }
  return reviews
    .map(
      (r) => `
    <div class="rounded-2xl bg-[#071510] border border-[#183a2d] p-4 text-xs space-y-1">
      <div class="flex justify-between gap-2">
        <span class="font-bold text-white">${escapeHtml(r.author)}</span>
        <span class="text-[#b4f73a] font-bold">${'★'.repeat(r.rating)}</span>
      </div>
      <p class="text-[10px] text-[#64748b]">${escapeHtml(r.date)}</p>
      <p class="text-[#cbd5e1] whitespace-pre-wrap break-words">${escapeHtml(r.comment)}</p>
    </div>`,
    )
    .join('');
}

function render(place) {
  const dist = formatDistance(distanceKm(state.userLocation, place));
  const status = getOpenStatus(place);
  const saved = state.bookmarks.includes(place.id);
  const id = escapeHtml(place.id);
  const pricing = (place.pricingDetails ?? [])
    .map(
      (row) =>
        `<tr class="border-b border-[#183a2d]"><td class="py-2 pr-4 text-[#cbd5e1]">${escapeHtml(row.service)}</td><td class="py-2 text-right font-bold text-white">${escapeHtml(row.price)}</td></tr>`,
    )
    .join('');

  document.getElementById('detail-modal-body').innerHTML = `
  <div class="space-y-6">
    <div class="relative h-56 sm:h-72 rounded-3xl overflow-hidden">
      <img src="${escapeHtml(safeImageUrl(place.image))}" alt="${escapeHtml(place.name)}" decoding="async" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#071510] via-[#071510]/40 to-transparent"></div>
      <div class="absolute bottom-5 left-5 right-5 space-y-2">
        <div class="flex flex-wrap gap-1.5">
          <span class="badge-distance text-[10px] font-bold px-2.5 py-1 rounded-full">${escapeHtml(dist)} sizdan</span>
          <span class="${status.cssClass} text-[10px] font-bold px-2.5 py-1 rounded-full">${escapeHtml(status.label)}</span>
          <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white">${escapeHtml(categoryName(place.category))}</span>
        </div>
        <h2 id="detail-title" class="text-2xl sm:text-3xl font-extrabold text-white">${escapeHtml(place.name)}</h2>
        <p class="text-xs text-[#cbd5e1]">${escapeHtml(place.address)}${place.landmark ? ` · Mo'ljal: ${escapeHtml(place.landmark)}` : ''}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <a href="${escapeHtml(telHref(place.phone))}" class="neon-btn rounded-2xl py-3 text-xs font-bold flex items-center justify-center gap-1.5"><i data-lucide="phone" class="w-4 h-4"></i>Qo'ng'iroq</a>
      <a href="${escapeHtml(directionsUrl(place))}" target="_blank" rel="noopener noreferrer" class="neon-btn-secondary rounded-2xl py-3 text-xs font-bold flex items-center justify-center gap-1.5"><i data-lucide="navigation" class="w-4 h-4"></i>Google Maps</a>
      <button type="button" class="neon-btn-secondary rounded-2xl py-3 text-xs font-bold flex items-center justify-center gap-1.5" data-action="toggle-bookmark" data-id="${id}" aria-pressed="${saved}"><i data-lucide="bookmark" class="w-4 h-4"></i><span data-bookmark-label>${saved ? 'Saqlangan' : 'Saqlash'}</span></button>
      <button type="button" class="neon-btn-secondary rounded-2xl py-3 text-xs font-bold flex items-center justify-center gap-1.5" data-action="share-place" data-id="${id}"><i data-lucide="share-2" class="w-4 h-4"></i>Ulashish</button>
    </div>

    <div class="grid sm:grid-cols-3 gap-3">
      ${infoCard('Mutaxassis', `<p class="text-white font-bold">${escapeHtml(place.chiefSpecialist)}</p><p class="text-[#94a3b8]">${escapeHtml(place.experienceText)}</p><p class="text-[#94a3b8]">${escapeHtml(place.phone)}${place.secondaryPhone ? `, ${escapeHtml(place.secondaryPhone)}` : ''}</p>`)}
      ${infoCard('Ish tartibi', `<p class="text-white font-bold">${escapeHtml(place.workDays)}</p><p class="text-[#94a3b8]">${place.is247 ? '24/7' : `${escapeHtml(place.openTime)} – ${escapeHtml(place.closeTime)}`}</p>${(place.features ?? []).map((f) => `<p class="text-[#94a3b8]">✓ ${escapeHtml(f)}</p>`).join('')}`)}
      ${infoCard('Reyting', `<p class="text-3xl font-extrabold text-[#b4f73a]">★ ${escapeHtml(place.rating)}</p><p class="text-[#94a3b8]">${escapeHtml(place.reviewsCount)} ta baho</p>`)}
    </div>

    <div class="rounded-3xl bg-[#071510] border border-[#183a2d] p-5">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-sm font-extrabold text-white">Xizmatlar narxi</h3>
        <span class="text-[11px] font-bold text-[#b4f73a]">${escapeHtml(place.priceRange)}</span>
      </div>
      ${pricing ? `<table class="w-full text-xs"><tbody>${pricing}</tbody></table>` : `<p class="text-xs text-[#94a3b8]">Narxlar kelishiladi.</p>`}
    </div>

    <div class="grid lg:grid-cols-2 gap-4">
      <div class="space-y-3">
        <h3 class="text-sm font-extrabold text-white">Mijozlar sharhlari</h3>
        <div id="detail-reviews" class="space-y-2">${place.reviews ? reviewsHtml(place.reviews) : '<p class="text-xs text-[#94a3b8]">Yuklanmoqda...</p>'}</div>
      </div>
      <form id="detail-review-form" class="rounded-3xl bg-[#071510] border border-[#183a2d] p-5 space-y-3 text-xs">
        <h3 class="text-sm font-extrabold text-white">Fikr qoldirish</h3>
        <label class="block space-y-1"><span class="text-[#94a3b8]">Ismingiz</span>
          <input id="new-rev-author" required minlength="2" maxlength="60" class="w-full bg-[#0d221a] border border-[#183a2d] rounded-xl p-3 text-white outline-none focus:border-[#b4f73a]" /></label>
        <label class="block space-y-1"><span class="text-[#94a3b8]">Baho</span>
          <select id="new-rev-rating" class="w-full bg-[#0d221a] border border-[#183a2d] rounded-xl p-3 text-white outline-none">
            ${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${'★'.repeat(n)} (${n})</option>`).join('')}
          </select></label>
        <label class="block space-y-1"><span class="text-[#94a3b8]">Sharh</span>
          <textarea id="new-rev-comment" required minlength="3" maxlength="1000" rows="3" class="w-full bg-[#0d221a] border border-[#183a2d] rounded-xl p-3 text-white outline-none focus:border-[#b4f73a]"></textarea></label>
        <button type="submit" class="neon-btn w-full rounded-xl py-3 font-bold">Sharhni Chop Etish</button>
      </form>
    </div>
  </div>`;
  refreshIcons();
}

export async function openDetail(id) {
  const cached = findPlace(id);
  if (!cached) return;
  currentId = id;
  render(cached);
  openModal('place-detail-modal');
  try {
    const full = await api.place(id);
    if (currentId === id) render(full);
  } catch {
    const box = document.getElementById('detail-reviews');
    if (box) box.innerHTML = `<p class="text-xs text-[#94a3b8]">Sharhlarni yuklab bo'lmadi.</p>`;
  }
}

export function closeDetail() {
  currentId = null;
  closeModal('place-detail-modal');
  if (/^#[a-z0-9-]+$/.test(location.hash) && findPlace(location.hash.slice(1))) {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

export async function sharePlace(id) {
  const url = `${location.origin}${location.pathname}#${id}`;
  try {
    if (navigator.share) await navigator.share({ title: findPlace(id)?.name, url });
    else {
      await navigator.clipboard.writeText(url);
      showToast('Havola nusxalandi');
    }
  } catch {
    // The user cancelled the share sheet.
  }
}

export async function submitReview(form) {
  if (!currentId || !form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const { place } = await api.addReview(currentId, {
      author: form.querySelector('#new-rev-author').value.trim(),
      rating: Number(form.querySelector('#new-rev-rating').value),
      comment: form.querySelector('#new-rev-comment').value.trim(),
    });
    const { reviews: _reviews, ...summary } = place;
    upsertPlace(summary);
    render(place);
    notify();
    showToast('Sharhingiz qabul qilindi va chop etildi!');
  } catch (err) {
    showToast(err.message || "Sharhni yuborib bo'lmadi");
    button.disabled = false;
  }
}

export function syncDetailBookmark() {
  const label = document.querySelector('#detail-modal-body [data-bookmark-label]');
  if (label && currentId)
    label.textContent = state.bookmarks.includes(currentId) ? 'Saqlangan' : 'Saqlash';
}
