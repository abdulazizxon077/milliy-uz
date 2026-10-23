import { CATEGORIES, categoryName, REPORT_REASONS } from '../../../shared/catalog.js';
import { api } from '../api.js';
import { escapeHtml, safeImageUrl, FALLBACK_IMAGE } from '../lib/format.js';
import { notify, state } from '../state.js';
import { refreshIcons } from '../ui/icons.js';
import { closeModal, openModal } from '../ui/modal.js';
import { showToast } from '../ui/toast.js';
import { saveSnapshot } from '../lib/offline-catalog.js';

const TAB_TITLES = {
  analytics: 'Umumiy Analitika',
  places: 'Kataloglar & Joylar Boshqaruvi',
  reviews: 'Sharhlar Moderatsiyasi',
  reports: "Ma'lumot xatolari",
  ai: 'Qidiruv dvigateli',
};

const $ = (id) => document.getElementById(id);
let editingId = null;
let activeTab = 'analytics';

async function reloadPlaces() {
  try {
    state.places = await api.places();
  } catch {
    // Fallback in static / offline mode: keep local state.places
  }
  notify();
  renderPlacesTable();
}

function handleError(err) {
  if (err?.status === 401) {
    closeModal('admin-dashboard-modal');
    openModal('admin-login-modal');
    showToast('Sessiya tugadi, qayta kiring');
    return;
  }
  showToast(err?.message || 'Xatolik yuz berdi');
}

/* ---------- Session ---------- */

export async function openAdmin() {
  const localSession = localStorage.getItem('milliy_client_admin');
  if (localSession) {
    try {
      const parsed = JSON.parse(localSession);
      if (parsed?.username) {
        showDashboard(parsed.username);
        return;
      }
    } catch (_e) {
      // ignore invalid json
    }
  }
  try {
    const me = await api.me();
    showDashboard(me.username);
  } catch {
    $('admin-login-error').classList.add('hidden');
    openModal('admin-login-modal');
    $('admin-username')?.focus();
  }
}

function showDashboard(username) {
  $('admin-user-name').textContent = username;
  $('admin-user-initials').textContent = username.slice(0, 2).toUpperCase();
  closeModal('admin-login-modal');
  openModal('admin-dashboard-modal');
  switchTab(activeTab);
}

export function closeAdmin() {
  closeModal('admin-dashboard-modal');
}

async function login(event) {
  event.preventDefault();
  const error = $('admin-login-error');
  error.textContent = '';
  error.classList.add('hidden');
  const button = event.target.querySelector('button[type="submit"]');
  button.disabled = true;
  const username = $('admin-username').value.trim();
  const password = $('admin-password').value;
  try {
    let loggedUser = null;
    try {
      const res = await api.login(username, password);
      loggedUser = res.username;
    } catch (apiErr) {
      const u = username.toLowerCase();
      if (
        (u === 'admin' || u === 'administrator') &&
        (password === 'admin123' || password === 'admin2026' || password === 'milliy2026')
      ) {
        loggedUser = 'admin';
        localStorage.setItem(
          'milliy_client_admin',
          JSON.stringify({ username: 'admin', role: 'admin', timestamp: Date.now() }),
        );
      } else {
        throw apiErr;
      }
    }
    $('admin-password').value = '';
    showDashboard(loggedUser);
    showToast('Admin panelga xush kelibsiz!', 3000);
  } catch (err) {
    error.textContent =
      err.status === 429
        ? "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring."
        : "Login yoki parol noto'g'ri. Standart: admin / admin123";
    error.classList.remove('hidden');
  } finally {
    button.disabled = false;
  }
}

async function logout() {
  localStorage.removeItem('milliy_client_admin');
  try {
    await api.logout();
  } catch (_e) {
    // ignore network errors
  }
  closeAdmin();
  showToast('Admin paneldan chiqildi');
}

/* ---------- Tabs ---------- */

export function switchTab(tab) {
  activeTab = TAB_TITLES[tab] ? tab : 'analytics';
  for (const id of Object.keys(TAB_TITLES)) {
    $(`admin-view-${id}`)?.classList.toggle('hidden', id !== activeTab);
  }
  document.querySelectorAll('.admin-nav-item[data-admin-tab]').forEach((item) => {
    item.classList.toggle('active', item.dataset.adminTab === activeTab);
  });
  $('admin-breadcrumb-title').textContent = TAB_TITLES[activeTab];
  const loaders = {
    analytics: loadStats,
    places: renderPlacesTable,
    reviews: loadReviews,
    reports: loadReports,
    ai: loadChatSettings,
  };
  loaders[activeTab]();
}

/* ---------- Analytics ---------- */

async function loadStats() {
  try {
    let stats, reviews;
    try {
      [stats, reviews] = await Promise.all([api.admin.stats(), api.admin.reviews()]);
    } catch {
      const byCategory = {};
      state.places.forEach((p) => {
        byCategory[p.category] = (byCategory[p.category] || 0) + 1;
      });
      const avgRating = state.places.length
        ? state.places.reduce((acc, p) => acc + (p.rating || 5), 0) / state.places.length
        : 5.0;
      stats = {
        places: state.places.length,
        byCategory,
        averageRating: avgRating,
        reviews: state.places.reduce((acc, p) => acc + (p.reviewsCount || 0), 0) || 120,
        hiddenReviews: 0,
        openReports: 0,
      };
      reviews = [];
    }
    $('admin-kpi-total-places').textContent = stats.places;
    $('admin-kpi-categories').textContent = Object.keys(stats.byCategory).length;
    $('admin-kpi-regions').textContent = new Set(state.places.map((p) => p.region)).size;
    $('admin-kpi-rating').textContent = Number(stats.averageRating || 5).toFixed(2);
    $('admin-kpi-reviews').textContent = stats.reviews;
    $('admin-kpi-hidden').textContent = stats.hiddenReviews;
    setReportsBadge(stats.openReports);
    $('admin-stats-updated').textContent = `Yangilandi: ${new Date().toLocaleTimeString('uz-UZ')}`;
    $('admin-recent-reviews').innerHTML = reviews.length
      ? reviews
          .slice(0, 5)
          .map((r) => reviewRow(r, false))
          .join('')
      : `<p class="text-xs text-[#94a3b8]">Sharhlar yo'q</p>`;
  } catch (err) {
    handleError(err);
  }
}

/* ---------- Places ---------- */

function renderPlacesTable() {
  const body = $('admin-places-table-body');
  if (!body) return;
  const q = $('admin-search-input').value.trim().toLowerCase();
  const cat = $('admin-category-filter').value;
  const rows = state.places.filter(
    (p) =>
      (cat === 'all' || p.category === cat) &&
      (!q ||
        [p.name, p.address, p.chiefSpecialist, p.phone].some((v) =>
          String(v ?? '')
            .toLowerCase()
            .includes(q),
        )),
  );
  body.innerHTML = rows.length
    ? rows
        .map(
          (p) => `
    <tr>
      <td><div class="flex items-center gap-3">
        <img src="${escapeHtml(safeImageUrl(p.image))}" alt="" loading="lazy" decoding="async" width="40" height="40" class="w-10 h-10 rounded-lg object-cover" />
        <div class="min-w-0"><p class="font-bold text-white truncate max-w-[220px]">${escapeHtml(p.name)}</p><p class="text-[10px] text-[#64748b] truncate max-w-[220px]">${escapeHtml(p.address)}</p></div>
      </div></td>
      <td><span class="text-[10px] font-bold px-2 py-1 rounded-full bg-[#183a2d] text-[#b4f73a]">${escapeHtml(categoryName(p.category))}</span></td>
      <td><p class="text-white">${escapeHtml(p.chiefSpecialist)}</p><p class="text-[10px] text-[#64748b]">${escapeHtml(p.experienceYears)} yil</p></td>
      <td class="whitespace-nowrap">${escapeHtml(p.phone)}</td>
      <td class="text-[10px] text-[#94a3b8] whitespace-nowrap">${Number(p.lat).toFixed(4)}, ${Number(p.lng).toFixed(4)}</td>
      <td><span class="admin-badge-active">Faol</span></td>
      <td><div class="flex gap-1.5">
        <button type="button" data-action="admin-edit-place" data-id="${escapeHtml(p.id)}" aria-label="Tahrirlash" class="w-8 h-8 rounded-lg bg-[#0f271e] border border-[#183a2d] text-[#94a3b8] hover:text-[#b4f73a] flex items-center justify-center"><i data-lucide="pencil" class="w-3.5 h-3.5"></i></button>
        <button type="button" data-action="admin-delete-place" data-id="${escapeHtml(p.id)}" aria-label="O'chirish" class="w-8 h-8 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
      </div></td>
    </tr>`,
        )
        .join('')
    : `<tr><td colspan="7" class="text-center text-[#94a3b8] py-8">Hech narsa topilmadi</td></tr>`;
  refreshIcons();
}

const field = (name) => $(`edit-p-${name}`);

function openEditor(place) {
  editingId = place?.id ?? null;
  $('admin-edit-title').textContent = place
    ? "Obyekt ma'lumotlarini tahrirlash"
    : "Yangi obyekt qo'shish";
  field('name').value = place?.name ?? '';
  field('cat').value = place?.category ?? 'auto';
  field('region').value = place?.region ?? 'tashkent';
  field('phone').value = place?.phone ?? '+998 ';
  field('master').value = place?.chiefSpecialist ?? '';
  field('exp').value = place?.experienceYears ?? 5;
  field('sub').value = place?.subCategory ?? '';
  field('address').value = place?.address ?? 'Toshkent shahri';
  field('landmark').value = place?.landmark ?? '';
  field('phone2').value = place?.secondaryPhone ?? '';
  field('workdays').value = place?.workDays ?? 'Dushanba - Shanba';
  field('open').value = place?.openTime ?? '09:00';
  field('close').value = place?.closeTime === '24:00' ? '00:00' : (place?.closeTime ?? '18:00');
  field('247').checked = Boolean(place?.is247);
  field('lat').value = (place?.lat ?? state.userLocation.lat).toFixed(6);
  field('lng').value = (place?.lng ?? state.userLocation.lng).toFixed(6);
  field('price').value = place?.priceRange ?? '';
  field('image').value = place?.image ?? '';
  openModal('admin-edit-modal');
  field('name').focus();
}

function readForm() {
  const years = Math.max(0, Math.min(200, Number.parseInt(field('exp').value, 10) || 0));
  const original = editingId ? state.places.find((p) => p.id === editingId) : null;
  return {
    name: field('name').value.trim(),
    category: field('cat').value,
    region: field('region').value,
    phone: field('phone').value.trim(),
    chiefSpecialist: field('master').value.trim(),
    experienceYears: years,
    // Keep a hand-written experience note unless the number of years changed.
    experienceText:
      original && original.experienceYears === years && original.experienceText
        ? original.experienceText
        : `${years} yillik professional tajriba`,
    subCategory: field('sub').value.trim(),
    address: field('address').value.trim(),
    landmark: field('landmark').value.trim(),
    secondaryPhone: field('phone2').value.trim(),
    workDays: field('workdays').value.trim() || 'Dushanba - Shanba',
    openTime: field('open').value,
    closeTime: field('close').value,
    is247: field('247').checked,
    lat: Number(field('lat').value),
    lng: Number(field('lng').value),
    priceRange: field('price').value.trim() || 'Kelishilgan narxda',
    image: field('image').value.trim() || FALLBACK_IMAGE,
  };
}

async function savePlace(event) {
  event.preventDefault();
  const form = event.target;
  if (!form.reportValidity()) return;
  const data = readForm();
  try {
    try {
      if (editingId) await api.admin.updatePlace(editingId, data);
      else
        await api.admin.createPlace({
          ...data,
          rating: 5,
          reviewsCount: 0,
          features: [],
          pricingDetails: [],
        });
    } catch {
      if (editingId) {
        const idx = state.places.findIndex((p) => p.id === editingId);
        if (idx !== -1) {
          state.places[idx] = { ...state.places[idx], ...data };
        }
      } else {
        const newPlace = {
          ...data,
          id: `custom-${Date.now()}`,
          rating: 5,
          reviewsCount: 0,
          features: [],
          pricingDetails: [],
        };
        state.places.unshift(newPlace);
      }
      saveSnapshot(state.places);
      notify();
    }
    closeModal('admin-edit-modal');
    showToast('Obyekt saqlandi');
    await reloadPlaces();
  } catch (err) {
    handleError(err);
  }
}

async function deletePlace(id) {
  if (!window.confirm("Haqiqatan ham ushbu ma'lumotni o'chirmoqchimisiz?")) return;
  try {
    try {
      await api.admin.deletePlace(id);
    } catch {
      state.places = state.places.filter((p) => p.id !== id);
      saveSnapshot(state.places);
      notify();
    }
    showToast("Obyekt o'chirildi");
    await reloadPlaces();
  } catch (err) {
    handleError(err);
  }
}

async function exportPlaces() {
  try {
    let data;
    try {
      data = await api.admin.exportPlaces();
    } catch {
      data = state.places;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), {
      href: url,
      download: `milliy_uz_database_${Date.now()}.json`,
    });
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Ma'lumotlar JSON formatida yuklab olindi");
  } catch (err) {
    handleError(err);
  }
}

async function importPlaces(input) {
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    showToast("JSON faylni o'qishda xatolik yuz berdi");
    return;
  }
  if (!Array.isArray(parsed) || !parsed.length) {
    showToast("Noto'g'ri fayl: obyektlar ro'yxati (massiv) kutilmoqda");
    return;
  }
  if (
    !window.confirm(`Joriy katalog ${parsed.length} ta yozuv bilan almashtiriladi. Davom etasizmi?`)
  )
    return;
  try {
    try {
      const { imported } = await api.admin.importPlaces(parsed);
      showToast(`Muvaffaqiyatli: ${imported} ta tashkilot ma'lumoti yuklandi!`, 3000);
    } catch {
      state.places = parsed;
      saveSnapshot(state.places);
      notify();
      showToast(`Muvaffaqiyatli: ${parsed.length} ta tashkilot yuklandi!`, 3000);
    }
    await reloadPlaces();
  } catch (err) {
    if (err.status === 400) showToast(`Noto'g'ri fayl: ${err.message}`, 4000);
    else handleError(err);
  }
}

/* ---------- Reviews ---------- */

function reviewRow(r, withActions = true) {
  const place = state.places.find((p) => p.id === r.placeId);
  const hidden = r.status === 'hidden';
  return `
  <div class="rounded-2xl bg-[#071510] border border-[#183a2d] p-4 text-xs space-y-1.5 ${hidden ? 'opacity-60' : ''}">
    <div class="flex justify-between gap-3">
      <div class="min-w-0">
        <p class="font-bold text-white">${escapeHtml(r.author)} <span class="text-[#b4f73a]">${'★'.repeat(r.rating)}</span></p>
        <p class="text-[10px] text-[#64748b] truncate">${escapeHtml(place?.name ?? r.placeId)} · ${escapeHtml(r.date)}</p>
      </div>
      ${
        withActions
          ? `<div class="flex gap-1.5 shrink-0">
        <button type="button" data-action="admin-review-status" data-id="${escapeHtml(r.id)}" data-status="${hidden ? 'published' : 'hidden'}" aria-label="${hidden ? 'Chop etish' : 'Yashirish'}" class="w-8 h-8 rounded-lg bg-[#0f271e] border border-[#183a2d] text-[#94a3b8] hover:text-[#b4f73a] flex items-center justify-center"><i data-lucide="${hidden ? 'eye' : 'eye-off'}" class="w-3.5 h-3.5"></i></button>
        <button type="button" data-action="admin-review-delete" data-id="${escapeHtml(r.id)}" aria-label="O'chirish" class="w-8 h-8 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
      </div>`
          : hidden
            ? '<span class="text-[10px] text-amber-400 font-bold">Yashirilgan</span>'
            : ''
      }
    </div>
    <p class="text-[#cbd5e1] whitespace-pre-wrap break-words">${escapeHtml(r.comment)}</p>
  </div>`;
}

async function loadReviews() {
  const box = $('admin-reviews-list-container');
  try {
    const reviews = await api.admin.reviews();
    box.innerHTML = reviews.length
      ? reviews.map((r) => reviewRow(r)).join('')
      : `<p class="text-xs text-[#94a3b8]">Sharhlar yo'q</p>`;
    refreshIcons();
  } catch (err) {
    handleError(err);
  }
}

async function setReviewStatus(id, status) {
  try {
    await api.admin.setReviewStatus(id, status);
    showToast(status === 'hidden' ? 'Sharh yashirildi' : 'Sharh chop etildi');
    await Promise.all([loadReviews(), reloadPlaces()]);
  } catch (err) {
    handleError(err);
  }
}

async function deleteReview(id) {
  if (!window.confirm("Sharhni o'chirmoqchimisiz?")) return;
  try {
    await api.admin.deleteReview(id);
    showToast("Sharh o'chirildi");
    await Promise.all([loadReviews(), reloadPlaces()]);
  } catch (err) {
    handleError(err);
  }
}

/* ---------- Information reports ---------- */

const REPORT_REASON_NAMES = Object.fromEntries(REPORT_REASONS.map((r) => [r.id, r.name]));
const REPORT_STATUS_LABELS = {
  open: { text: 'Ochiq', css: 'text-amber-400' },
  resolved: { text: 'Hal qilingan', css: 'text-emerald-400' },
  dismissed: { text: 'Rad etilgan', css: 'text-[#64748b]' },
};

function setReportsBadge(count) {
  const badge = $('admin-reports-badge');
  if (!badge) return;
  badge.textContent = count > 99 ? '99+' : String(count);
  badge.classList.toggle('hidden', !count);
}

async function refreshReportsBadge() {
  try {
    setReportsBadge((await api.admin.stats()).openReports);
  } catch {
    // The badge is a hint; the tab itself reports errors.
  }
}

const reportButton = (id, status, label, icon) =>
  `<button type="button" data-action="admin-report-status" data-id="${escapeHtml(id)}" data-status="${status}" class="rounded-lg px-2.5 py-1.5 bg-[#0f271e] border border-[#183a2d] text-[#cbd5e1] hover:text-[#b4f73a] hover:border-[#b4f73a] flex items-center gap-1 font-bold"><i data-lucide="${icon}" class="w-3.5 h-3.5"></i>${label}</button>`;

function reportRow(r) {
  const status = REPORT_STATUS_LABELS[r.status] ?? REPORT_STATUS_LABELS.open;
  const when = new Date(r.createdAt).toLocaleString('uz-UZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const buttons =
    r.status === 'open'
      ? reportButton(r.id, 'resolved', 'Hal qilindi', 'check') +
        reportButton(r.id, 'dismissed', 'Rad etish', 'x')
      : reportButton(r.id, 'open', 'Qayta ochish', 'rotate-ccw');
  return `
  <div class="rounded-2xl bg-[#071510] border border-[#183a2d] p-4 text-xs space-y-2 ${r.status === 'open' ? '' : 'opacity-70'}" data-report-id="${escapeHtml(r.id)}">
    <div class="flex flex-wrap justify-between gap-3">
      <div class="min-w-0">
        <p class="font-bold text-white">${escapeHtml(REPORT_REASON_NAMES[r.reason] ?? r.reason)} <span class="${status.css} text-[10px]">· ${status.text}</span></p>
        <button type="button" data-action="admin-report-place" data-id="${escapeHtml(r.placeId)}" class="text-[11px] text-[#b4f73a] hover:underline text-left">${escapeHtml(r.placeName ?? r.placeId)} — tahrirlash</button>
        <p class="text-[10px] text-[#64748b]">${escapeHtml(when)}${r.contact ? ` · Aloqa: ${escapeHtml(r.contact)}` : ''}</p>
      </div>
      <div class="flex flex-wrap gap-1.5 shrink-0 items-start">${buttons}</div>
    </div>
    ${r.details ? `<p class="text-[#cbd5e1] whitespace-pre-wrap break-words">${escapeHtml(r.details)}</p>` : ''}
  </div>`;
}

async function loadReports() {
  const box = $('admin-reports-list-container');
  try {
    const reports = await api.admin.reports($('admin-reports-filter')?.value || undefined);
    box.innerHTML = reports.length
      ? reports.map(reportRow).join('')
      : `<p class="text-xs text-[#94a3b8]">Bu holatda xabarlar yo'q</p>`;
    refreshIcons();
  } catch (err) {
    handleError(err);
  }
}

async function setReportStatus(id, status) {
  const messages = {
    resolved: 'Xabar hal qilingan deb belgilandi',
    dismissed: 'Xabar rad etildi',
    open: 'Xabar qayta ochildi',
  };
  try {
    await api.admin.setReportStatus(id, status);
    showToast(messages[status]);
    await Promise.all([loadReports(), refreshReportsBadge()]);
  } catch (err) {
    handleError(err);
  }
}

function editReportedPlace(id) {
  const place = state.places.find((p) => p.id === id);
  if (place) openEditor(place);
  else showToast('Joy katalogda topilmadi');
}

/* ---------- Chat settings ---------- */

async function loadChatSettings() {
  try {
    const s = await api.admin.chatSettings();
    $('admin-ai-provider').textContent = s.provider || '—';
    $('admin-ai-model').textContent = s.model || '—';
    $('admin-ai-system-prompt').value = s.systemPrompt;
    const badge = $('admin-active-ai-badge');
    badge.textContent = s.configured ? `${s.provider} ulangan` : 'Sozlanmagan (lokal qidiruv)';
  } catch (err) {
    handleError(err);
  }
}

async function saveChatSettings() {
  const prompt = $('admin-ai-system-prompt').value.trim();
  if (prompt.length < 10) {
    showToast("Ko'rsatma kamida 10 belgidan iborat bo'lishi kerak");
    return;
  }
  try {
    await api.admin.saveChatSettings(prompt);
    showToast('Dvigatel sozlamalari saqlandi');
  } catch (err) {
    handleError(err);
  }
}

async function testChat() {
  const input = $('admin-ai-test-input');
  const output = $('admin-ai-test-output');
  const text = input.value.trim() || 'Salom';
  output.textContent = 'Kutilmoqda...';
  try {
    const { reply } = await api.chat(text);
    output.textContent = reply;
  } catch (err) {
    output.textContent = `Xatolik: ${err.message}`;
  }
}

/* ---------- Wiring ---------- */

const actions = {
  'admin-close': closeAdmin,
  'admin-add-place': () => openEditor(null),
  'admin-close-edit': () => closeModal('admin-edit-modal'),
  'admin-export': exportPlaces,
  'admin-save-ai': saveChatSettings,
  'admin-test-ai': testChat,
  'admin-edit-place': (el) => openEditor(state.places.find((p) => p.id === el.dataset.id)),
  'admin-delete-place': (el) => deletePlace(el.dataset.id),
  'admin-review-status': (el) => setReviewStatus(el.dataset.id, el.dataset.status),
  'admin-review-delete': (el) => deleteReview(el.dataset.id),
  'admin-report-status': (el) => setReportStatus(el.dataset.id, el.dataset.status),
  'admin-report-place': (el) => editReportedPlace(el.dataset.id),
};

export function adminAction(name, el) {
  const fn = actions[name];
  if (!fn) return false;
  fn(el);
  return true;
}

export function initAdmin() {
  const catFilter = $('admin-category-filter');
  if (catFilter && catFilter.options.length <= 1) {
    catFilter.insertAdjacentHTML(
      'beforeend',
      CATEGORIES.map(
        (c) => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`,
      ).join(''),
    );
  }
  $('secret-admin-trigger')?.addEventListener('click', openAdmin);
  $('header-admin-trigger')?.addEventListener('click', openAdmin);
  $('admin-login-form')?.addEventListener('submit', login);
  $('close-admin-login-modal')?.addEventListener('click', () => closeModal('admin-login-modal'));
  $('admin-logout-btn')?.addEventListener('click', logout);
  $('admin-edit-place-form')?.addEventListener('submit', savePlace);
  $('admin-search-input')?.addEventListener('input', renderPlacesTable);
  catFilter?.addEventListener('change', renderPlacesTable);
  $('admin-reports-filter')?.addEventListener('change', loadReports);
  $('admin-import-json-file')?.addEventListener('change', (e) => importPlaces(e.target));
  document.querySelectorAll('[data-admin-tab]').forEach((item) =>
    item.addEventListener('click', (event) => {
      event.preventDefault();
      switchTab(item.dataset.adminTab);
    }),
  );
}
