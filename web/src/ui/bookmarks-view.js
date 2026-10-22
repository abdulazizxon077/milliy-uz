import { saveBookmarks, toggleId } from '../lib/bookmarks.js';
import { distanceKm, escapeHtml, formatDistance } from '../lib/format.js';
import { placeThumbHtml } from './place-media.js';
import { findPlace, state } from '../state.js';
import { refreshIcons } from './icons.js';
import { showToast } from './toast.js';

export function toggleBookmark(id) {
  const adding = !state.bookmarks.includes(id);
  state.bookmarks = toggleId(state.bookmarks, id);
  saveBookmarks(state.bookmarks);
  showToast(adding ? "Saqlanganlarga qo'shildi" : 'Saqlanganlardan olib tashlandi');
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
  const saved = state.bookmarks.map(findPlace).filter(Boolean);
  if (!saved.length) {
    box.innerHTML = `<p class="text-sm text-[#94a3b8] text-center py-10">Hozircha saqlangan joylar yo'q</p>`;
    return;
  }
  box.innerHTML = saved
    .map(
      (p) => `
    <div class="flex items-center gap-3 rounded-2xl bg-[#0d221a] border border-[#183a2d] p-3">
      ${placeThumbHtml(p, 56)}
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-white truncate">${escapeHtml(p.name)}</p>
        <p class="text-[11px] text-[#b4f73a]">${escapeHtml(formatDistance(distanceKm(state.userLocation, p)))}</p>
      </div>
      <button type="button" class="w-8 h-8 rounded-full bg-[#071510] text-[#94a3b8] hover:text-white flex items-center justify-center" data-action="open-detail" data-id="${escapeHtml(p.id)}" aria-label="Ko'rish"><i data-lucide="eye" class="w-4 h-4"></i></button>
      <button type="button" class="w-8 h-8 rounded-full bg-[#071510] text-[#94a3b8] hover:text-red-400 flex items-center justify-center" data-action="toggle-bookmark" data-id="${escapeHtml(p.id)}" aria-label="O'chirish"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    </div>`,
    )
    .join('');
  refreshIcons();
}
