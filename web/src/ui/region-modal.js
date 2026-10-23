/**
 * Mandatory Region Selection Modal
 * Prompts the user to pick their specific region when clicking any category,
 * preventing all 14 regions from overloading the screen at once.
 */

import { REGIONS, REGIONS_I18N, categoryName } from '../../../shared/catalog.js';
import { escapeHtml } from '../lib/format.js';
import { notify, state } from '../state.js';
import { closeModal, openModal } from './modal.js';
import { showToast } from './toast.js';
import { highlightMapRegion } from './uzbekistan-map.js';
import { refreshIcons } from './icons.js';

export function openRegionPicker(categoryId) {
  state.selectedCategoryPending = categoryId;
  const lang = state.lang || 'uz';
  const catNameEl = document.getElementById('region-modal-cat-name');
  if (catNameEl) {
    catNameEl.textContent = categoryId && categoryId !== 'all' ? categoryName(categoryId, lang) : (lang === 'ru' ? 'Все категории' : lang === 'en' ? 'All categories' : 'Barcha sohalar');
  }

  renderRegionButtons();
  openModal('region-select-modal');
}

export function renderRegionButtons() {
  const grid = document.getElementById('region-modal-buttons-grid');
  if (!grid) return;
  const lang = state.lang || 'uz';
  const currentRegion = state.filters.region;

  grid.innerHTML = REGIONS.map((r) => {
    const isCurrent = currentRegion === r.id;
    const localizedName = REGIONS_I18N[r.id]?.[lang] || r.name;
    return `
      <button
        type="button"
        data-action="pick-region-and-close"
        data-region="${escapeHtml(r.id)}"
        class="flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
          isCurrent
            ? 'bg-[#123829] border-[#b4f73a] text-white shadow-[0_0_15px_rgba(180,247,58,0.25)]'
            : 'bg-[#071912] border-[#183a2d] text-[#cbd5e1] hover:bg-[#0f2d20] hover:border-[#2b684f] hover:text-white'
        }"
      >
        <span class="flex items-center gap-2.5">
          <span class="w-2 h-2 rounded-full ${isCurrent ? 'bg-[#b4f73a] animate-pulse' : 'bg-[#255e47]'}"></span>
          <span class="text-xs font-bold">${escapeHtml(localizedName)}</span>
        </span>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5 ${isCurrent ? 'text-[#b4f73a]' : 'text-[#64748b]'}"></i>
      </button>
    `;
  }).join('');
  refreshIcons();
}

export function handleRegionPick(regionId) {
  const lang = state.lang || 'uz';
  state.filters.region = regionId;
  if (state.selectedCategoryPending) {
    state.filters.category = state.selectedCategoryPending;
  }

  // Sync with region selector in catalog
  const select = document.getElementById('catalog-region-select');
  if (select) select.value = regionId;

  // Sync map section
  highlightMapRegion(regionId);
  const mapPill = document.getElementById('map-active-region-pill');
  if (mapPill) {
    const name = REGIONS_I18N[regionId]?.[lang] || regionId;
    mapPill.textContent = name;
  }

  closeModal('region-select-modal');
  notify();

  // Smooth scroll to catalog
  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const chosenName = REGIONS_I18N[regionId]?.[lang] || regionId;
  const catName = state.filters.category && state.filters.category !== 'all' ? categoryName(state.filters.category, lang) : '';
  const msg = catName ? `${chosenName}: ${catName}` : chosenName;
  showToast(msg);
}
