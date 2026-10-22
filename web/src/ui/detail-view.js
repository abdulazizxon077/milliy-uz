import { categoryName, REPORT_REASONS } from '../../../shared/catalog.js';
import { api } from '../api.js';
import {
  directionsUrl,
  distanceKm,
  escapeHtml,
  formatDistance,
  getOpenStatus,
  safeImageUrl,
  telegramShareUrl,
  telHref,
  yandexDirectionsUrl,
} from '../lib/format.js';
import { placePath, placeUrl } from '../lib/routes.js';
import { findPlace, notify, state, upsertPlace } from '../state.js';
import { copyText } from './clipboard.js';
import { refreshIcons } from './icons.js';
import { closeModal, isOpen, openModal } from './modal.js';
import { showToast } from './toast.js';

let currentId = null;
const DEFAULT_TITLE = "MILLIY.UZ — O'zbekiston xizmatlar katalogi";
const secondaryBtn =
  'neon-btn-secondary rounded-2xl py-3 text-xs font-bold flex items-center justify-center gap-1.5';
const ghostBtn =
  'rounded-xl px-3 py-2 text-[11px] font-bold text-[#cbd5e1] border border-[#183a2d] hover:border-[#b4f73a] hover:text-white flex items-center gap-1.5';

function reportFormHtml() {
  return `
  <form id="detail-report-form" class="hidden rounded-3xl bg-[#071510] border border-[#183a2d] p-5 space-y-3 text-xs" novalidate>
    <h3 class="text-sm font-extrabold text-white">Ma'lumotdagi xatolik haqida xabar berish</h3>
    <p class="text-[#94a3b8]">Moderator tekshirib, ma'lumotni yangilaydi.</p>
    <label class="block space-y-1" for="report-reason"><span class="text-[#94a3b8]">Nima noto'g'ri?</span>
      <select id="report-reason" class="w-full bg-[#0d221a] border border-[#183a2d] rounded-xl p-3 text-white outline-none">
        ${REPORT_REASONS.map((r) => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)}</option>`).join('')}
      </select></label>
    <label class="block space-y-1" for="report-details"><span class="text-[#94a3b8]">Izoh <span id="report-details-hint">(ixtiyoriy)</span></span>
      <textarea id="report-details" maxlength="1000" rows="3" placeholder="Masalan: to'g'ri raqam +998 90 123 45 67" class="w-full bg-[#0d221a] border border-[#183a2d] rounded-xl p-3 text-white outline-none focus:border-[#b4f73a]"></textarea></label>
    <label class="block space-y-1" for="report-contact"><span class="text-[#94a3b8]">Aloqa uchun (ixtiyoriy)</span>
      <input id="report-contact" maxlength="120" placeholder="Telefon yoki Telegram" class="w-full bg-[#0d221a] border border-[#183a2d] rounded-xl p-3 text-white outline-none focus:border-[#b4f73a]" /></label>
    <div class="flex gap-2">
      <button type="submit" class="neon-btn flex-1 rounded-xl py-3 font-bold">Yuborish</button>
      <button type="button" data-action="toggle-report" class="neon-btn-secondary rounded-xl px-4 py-3 font-bold">Bekor qilish</button>
    </div>
  </form>`;
}

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

    <div class="space-y-2">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <a href="${escapeHtml(telHref(place.phone))}" class="neon-btn rounded-2xl py-3 text-xs font-bold flex items-center justify-center gap-1.5"><i data-lucide="phone" class="w-4 h-4"></i>Qo'ng'iroq</a>
        <a href="${escapeHtml(directionsUrl(place))}" target="_blank" rel="noopener noreferrer" class="${secondaryBtn}"><i data-lucide="navigation" class="w-4 h-4"></i>Google Maps</a>
        <a href="${escapeHtml(yandexDirectionsUrl(place))}" target="_blank" rel="noopener noreferrer" class="${secondaryBtn}"><i data-lucide="map" class="w-4 h-4"></i>Yandex Maps</a>
        <button type="button" class="${secondaryBtn}" data-action="toggle-bookmark" data-id="${id}" aria-pressed="${saved}"><i data-lucide="bookmark" class="w-4 h-4"></i><span data-bookmark-label>${saved ? 'Saqlangan' : 'Saqlash'}</span></button>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="${ghostBtn}" data-action="share-place" data-id="${id}"><i data-lucide="share-2" class="w-3.5 h-3.5"></i>Ulashish</button>
        <a href="${escapeHtml(telegramShareUrl(placeUrl(place.id), place.name))}" target="_blank" rel="noopener noreferrer" class="${ghostBtn}"><i data-lucide="send" class="w-3.5 h-3.5"></i>Telegram</a>
        <button type="button" class="${ghostBtn} sm:ml-auto" data-action="toggle-report" aria-controls="detail-report-form" aria-expanded="false"><i data-lucide="flag" class="w-3.5 h-3.5"></i>Xatolik haqida xabar berish</button>
      </div>
      ${reportFormHtml()}
    </div>

    <div class="grid sm:grid-cols-3 gap-3">
      ${infoCard('Mutaxassis', `<p class="text-white font-bold">${escapeHtml(place.chiefSpecialist)}</p><p class="text-[#94a3b8]">${escapeHtml(place.experienceText)}</p><p class="text-[#94a3b8]"><a class="hover:text-[#b4f73a] underline-offset-2 hover:underline" href="${escapeHtml(telHref(place.phone))}">${escapeHtml(place.phone)}</a>${place.secondaryPhone ? `, <a class="hover:text-[#b4f73a] underline-offset-2 hover:underline" href="${escapeHtml(telHref(place.secondaryPhone))}">${escapeHtml(place.secondaryPhone)}</a>` : ''}</p>`)}
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

/**
 * Opens a place. Unless the change came from the browser history, the address
 * moves to /joy/<id> so the page can be bookmarked, shared and closed with Back.
 */
export async function openDetail(id, { fromHistory = false } = {}) {
  const cached = findPlace(id);
  if (!cached) return false;
  if (!fromHistory && location.pathname !== placePath(id)) {
    const method = isOpen('place-detail-modal') ? 'replaceState' : 'pushState';
    history[method](
      { placeId: id, pushed: method === 'pushState' || history.state?.pushed },
      '',
      placePath(id) + location.search,
    );
  }
  currentId = id;
  document.title = `${cached.name} — MILLIY.UZ`;
  render(cached);
  openModal('place-detail-modal');
  try {
    const full = await api.place(id);
    // Only swap the reviews list so focus and any half-typed text survive.
    const box = document.getElementById('detail-reviews');
    if (currentId === id && box) box.innerHTML = reviewsHtml(full.reviews);
  } catch {
    const box = document.getElementById('detail-reviews');
    if (currentId === id && box) {
      box.innerHTML = `<p class="text-xs text-[#94a3b8]">Sharhlarni yuklab bo'lmadi.</p>`;
    }
  }
  return true;
}

export function closeDetail({ fromHistory = false } = {}) {
  currentId = null;
  document.title = DEFAULT_TITLE;
  closeModal('place-detail-modal');
  if (fromHistory || !location.pathname.startsWith('/joy/')) return;
  // Step back if we added the entry; otherwise (a direct visit) swap in the home page.
  if (history.state?.pushed) history.back();
  else history.replaceState(null, '', `/${location.search}`);
}

export async function sharePlace(id) {
  const place = findPlace(id);
  const url = placeUrl(id);
  if (navigator.share) {
    try {
      await navigator.share({ title: place?.name, url });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }
  if (await copyText(url)) showToast('Havola nusxalandi');
  else window.prompt('Havolani nusxalang:', url);
}

export function toggleReportForm(force) {
  const form = document.getElementById('detail-report-form');
  const toggle = document.querySelector('#detail-modal-body [aria-controls="detail-report-form"]');
  if (!form) return;
  const show = force ?? form.classList.contains('hidden');
  form.classList.toggle('hidden', !show);
  toggle?.setAttribute('aria-expanded', String(show));
  if (show) form.querySelector('#report-reason')?.focus();
  else toggle?.focus();
}

export function syncReportHint() {
  const other = document.getElementById('report-reason')?.value === 'other';
  const hint = document.getElementById('report-details-hint');
  if (hint) hint.textContent = other ? '(majburiy)' : '(ixtiyoriy)';
}

export async function submitReport(form) {
  if (!currentId) return;
  const reason = form.querySelector('#report-reason').value;
  const details = form.querySelector('#report-details').value.trim();
  const contact = form.querySelector('#report-contact').value.trim();
  if (reason === 'other' && details.length < 5) {
    showToast('Muammoni qisqacha tasvirlab bering');
    form.querySelector('#report-details').focus();
    return;
  }
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await api.reportPlace(currentId, { reason, details, contact });
    form.reset();
    syncReportHint();
    toggleReportForm(false);
    showToast('Rahmat! Xabaringiz moderatorga yuborildi');
  } catch (err) {
    showToast(
      err.status === 429
        ? "Juda ko'p xabar yuborildi. Birozdan so'ng urinib ko'ring"
        : err.message || "Xabarni yuborib bo'lmadi",
    );
  } finally {
    button.disabled = false;
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
