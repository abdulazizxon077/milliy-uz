import { saveBookmarks, toggleId } from '../lib/bookmarks.js';
import { distanceKm, escapeHtml, formatDistance, getLocalizedPlace, safeImageUrl } from '../lib/format.js';
import { t } from '../lib/i18n.js';
import { findPlace, state } from '../state.js';
import { refreshIcons } from './icons.js';
import { showToast } from './toast.js';

export function toggleBookmark(id) {
  const lang = state.lang;
  const adding = !state.bookmarks.includes(id);
  state.bookmarks = toggleId(state.bookmarks, id);
  saveBookmarks(state.bookmarks);
  const msg = adding
    ? (lang === 'ru' ? 'Добавлено в закладки' : lang === 'en' ? 'Added to saved places' : "Saqlanganlarga qo'shildi")
    : (lang === 'ru' ? 'Удалено из закладок' : lang === 'en' ? 'Removed from saved places' : "Saqlanganlardan olib tashlandi");
  showToast(msg);
  updateBookmarkUi();
  return adding;
}

/** Syncs the counter pill, drawer list and every bookmark button on the page. */
export function updateBookmarkUi() {
  const pill = document.getElementById('bookmarks-count-pill');
  if (pill) {
    pill.textContent = String(state.bookmarks.length);
    pill.classList.toggle('hidden', state.bookmarks.length === 0);
  }
  document.querySelectorAll('[data-action="toggle-bookmark"]').forEach((btn) => {
    const active = state.bookmarks.includes(btn.dataset.id);
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  renderBookmarkList();
}

function renderBookmarkList() {
  const box = document.getElementById('bookmarks-list-container');
  if (!box) return;
  const lang = state.lang;
  const saved = state.bookmarks.map(findPlace).filter(Boolean);
  if (!saved.length) {
    box.innerHTML = `<p class="text-sm text-[#94a3b8] text-center py-10">${escapeHtml(t('noBookmarks', lang))}</p>`;
    return;
  }
  box.innerHTML = saved
    .map(
      (rawPlace) => {
        const p = getLocalizedPlace(rawPlace, lang);
        return `
    <div class="flex items-center gap-3 rounded-2xl bg-[#0d221a] border border-[#183a2d] p-3">
      <img src="${escapeHtml(safeImageUrl(p.image))}" alt="" loading="lazy" decoding="async" width="56" height="56" class="w-14 h-14 rounded-xl object-cover" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-white truncate">${escapeHtml(p.name)}</p>
        <p class="text-[11px] text-[#b4f73a]">${escapeHtml(formatDistance(distanceKm(state.userLocation, p), lang))}</p>
      </div>
      <button type="button" class="w-8 h-8 rounded-full bg-[#071510] text-[#94a3b8] hover:text-white flex items-center justify-center" data-action="open-detail" data-id="${escapeHtml(p.id)}" aria-label="Ko'rish"><i data-lucide="eye" class="w-4 h-4"></i></button>
      <button type="button" class="w-8 h-8 rounded-full bg-[#071510] text-[#94a3b8] hover:text-red-400 flex items-center justify-center" data-action="toggle-bookmark" data-id="${escapeHtml(p.id)}" aria-label="O'chirish"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    </div>`;
      },
    )
    .join('');
  refreshIcons();
}
