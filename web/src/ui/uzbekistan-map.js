/**
 * Interactive Real Geographic Vector Map of Uzbekistan
 * Built directly from official Uzbekistan administrative boundaries (ADM1 GeoJSON).
 * Features exact geographic borders, hover line highlighting, pulsating neon markers,
 * and speech-bubble tooltip matching user requirements.
 */

import { REGIONS_I18N } from '../../../shared/catalog.js';
import { state } from '../state.js';
import { REAL_UZ_REGIONS_GEO } from './uzbekistan-geo-data.js';

let currentHighlightFn = null;
let currentContainer = null;

export function highlightMapRegion(regionId) {
  if (currentHighlightFn) {
    currentHighlightFn(regionId);
  }
}

export function updateMapLanguage(lang = state.lang || 'uz') {
  if (!currentContainer) return;
  currentContainer.querySelectorAll('.uz-map-node').forEach((node) => {
    const regId = node.dataset.region;
    const geo = REAL_UZ_REGIONS_GEO.find((g) => g.id === regId);
    const label = node.querySelector('text');
    if (geo && label) {
      label.textContent = geo.centerCity?.[lang] || geo.centerCity?.uz || geo.name;
    }
  });
  const activeReg = state.filters.region && state.filters.region !== 'all_uz' ? state.filters.region : 'samarkand';
  highlightMapRegion(activeReg);
}

export function renderUzbekistanMap(container, { onSelectRegion } = {}) {
  if (!container) return;
  currentContainer = container;

  const activeRegion = state.filters.region && state.filters.region !== 'all_uz' ? state.filters.region : 'samarkand';

  container.innerHTML = `
    <div class="uz-map-wrapper relative w-full h-full select-none flex items-center justify-center p-2 sm:p-4">
      <svg
        id="uz-svg-map"
        viewBox="0 0 960 540"
        class="w-full h-auto max-h-[520px] drop-shadow-[0_16px_40px_rgba(0,0,0,0.8)]"
      >
        <defs>
          <linearGradient id="uz-geo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0e3427" />
            <stop offset="100%" stop-color="#082319" />
          </linearGradient>
          <linearGradient id="uz-geo-hover" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#16513c" />
            <stop offset="100%" stop-color="#0f3c2c" />
          </linearGradient>
          <linearGradient id="uz-geo-active" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1f6e52" />
            <stop offset="100%" stop-color="#134c38" />
          </linearGradient>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- EXACT REAL GEOGRAPHIC REGION BOUNDARIES -->
        <g id="uz-regions-group">
          ${REAL_UZ_REGIONS_GEO.map((r) => {
            const isActive = activeRegion === r.id;
            return `
              <path
                id="uz-geo-path-${r.id}"
                data-region="${r.id}"
                d="${r.path}"
                class="uz-map-path ${isActive ? 'active' : ''}"
                fill="${isActive ? 'url(#uz-geo-active)' : 'url(#uz-geo-gradient)'}"
                stroke="${isActive ? '#b4f73a' : '#1d5540'}"
                stroke-width="${isActive ? '2.5' : '1.5'}"
                stroke-linejoin="round"
                stroke-linecap="round"
                style="cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);"
              />
            `;
          }).join('')}
        </g>

        <!-- PULSING REGION MARKERS (AT ACCURATE CENTERS) -->
        <g id="uz-markers-group">
          ${REAL_UZ_REGIONS_GEO.map((r) => {
            const isActive = activeRegion === r.id;
            const lang = state.lang || 'uz';
            const cityName = r.centerCity?.[lang] || r.centerCity?.uz || r.name;
            return `
              <g
                class="uz-map-node ${isActive ? 'active' : ''}"
                data-region="${r.id}"
                transform="translate(${r.center.x}, ${r.center.y})"
                style="cursor: pointer;"
              >
                <!-- Pulse outer wave -->
                <circle
                  r="${isActive ? '18' : '12'}"
                  fill="none"
                  stroke="#b4f73a"
                  stroke-width="1.5"
                  opacity="${isActive ? '0.85' : '0.45'}"
                  class="animate-ping"
                />
                <!-- Outer border ring -->
                <circle
                  r="${isActive ? '13' : '8'}"
                  fill="#071912"
                  stroke="#b4f73a"
                  stroke-width="${isActive ? '2.5' : '1.8'}"
                />
                <!-- Center core dot -->
                <circle
                  r="${isActive ? '5.5' : '3.5'}"
                  fill="${isActive ? '#b4f73a' : '#73e27a'}"
                />
                <!-- Administrative center label directly on map -->
                <text
                  y="18"
                  text-anchor="middle"
                  class="text-[9px] font-extrabold fill-[#b4f73a] tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] pointer-events-none select-none opacity-90"
                >
                  ${cityName}
                </text>
              </g>
            `;
          }).join('')}
        </g>
      </svg>

      <!-- FLOATING SPEECH-BUBBLE TOOLTIP (MATCHES 1-RASM) -->
      <div
        id="uz-map-tooltip"
        class="uz-map-tooltip pointer-events-none absolute z-30 transition-all duration-150"
        style="display: none; transform: translate(-50%, -100%);"
      >
        <div class="relative bg-[#0d261c] border border-[#255e47] text-white text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.8)] flex items-center gap-1.5 whitespace-nowrap">
          <span class="w-2 h-2 rounded-full bg-[#b4f73a] animate-pulse shrink-0"></span>
          <span id="uz-map-tooltip-text">Samarqand</span>
          <!-- Downward speech bubble pointer (matches 1-rasm) -->
          <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0d261c] border-b border-r border-[#255e47] rotate-45"></div>
        </div>
      </div>
    </div>
  `;

  const tooltip = container.querySelector('#uz-map-tooltip');
  const tooltipText = container.querySelector('#uz-map-tooltip-text');

  function updateTooltipPosition(regionId) {
    const geo = REAL_UZ_REGIONS_GEO.find((g) => g.id === regionId);
    const node = container.querySelector(`.uz-map-node[data-region="${regionId}"]`);
    const wrapper = container.querySelector('.uz-map-wrapper');
    if (!geo || !node || !wrapper || !tooltip) return;

    const nodeRect = node.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    const pixelX = nodeRect.left - wrapperRect.left + nodeRect.width / 2;
    const pixelY = nodeRect.top - wrapperRect.top - 14;

    const lang = state.lang || 'uz';
    const localizedName = REGIONS_I18N[geo.id]?.[lang] || geo.name;
    const centerCity = geo.centerCity?.[lang] || geo.centerCity?.uz || geo.name;

    tooltipText.innerHTML = `<span class="text-white">${localizedName}</span> <span class="text-[#b4f73a] text-[11px] font-mono font-medium">(${centerCity})</span>`;

    tooltip.style.left = `${pixelX}px`;
    tooltip.style.top = `${pixelY}px`;
    tooltip.style.display = 'block';
  }

  function highlightRegion(regionId) {
    const paths = container.querySelectorAll('.uz-map-path');
    const nodes = container.querySelectorAll('.uz-map-node');

    paths.forEach((p) => {
      const match = p.dataset.region === regionId;
      p.setAttribute('fill', match ? 'url(#uz-geo-hover)' : 'url(#uz-geo-gradient)');
      p.setAttribute('stroke', match ? '#b4f73a' : '#1d5540');
      p.setAttribute('stroke-width', match ? '2.8' : '1.5');
      if (match) p.setAttribute('filter', 'url(#neon-glow)');
      else p.removeAttribute('filter');
    });

    nodes.forEach((n) => {
      const match = n.dataset.region === regionId;
      const core = n.querySelector('circle:last-child');
      if (core) core.setAttribute('fill', match ? '#b4f73a' : '#73e27a');
    });

    updateTooltipPosition(regionId);
  }

  currentHighlightFn = highlightRegion;

  window.addEventListener('resize', () => {
    if (state.filters.region && state.filters.region !== 'all_uz') {
      updateTooltipPosition(state.filters.region);
    }
  });

  function selectRegion(regionId) {
    state.filters.region = regionId;
    updateTooltipPosition(regionId);
    if (onSelectRegion) onSelectRegion(regionId);
  }

  const interactables = container.querySelectorAll('.uz-map-path, .uz-map-node');
  interactables.forEach((el) => {
    const regId = el.dataset.region;

    el.addEventListener('mouseenter', () => highlightRegion(regId));
    el.addEventListener('mouseleave', () => {
      if (state.filters.region && state.filters.region !== 'all_uz') {
        highlightRegion(state.filters.region);
      } else {
        tooltip.style.display = 'none';
        container.querySelectorAll('.uz-map-path').forEach((p) => {
          p.setAttribute('fill', 'url(#uz-geo-gradient)');
          p.setAttribute('stroke', '#1d5540');
          p.setAttribute('stroke-width', '1.5');
          p.removeAttribute('filter');
        });
      }
    });

    el.addEventListener('click', (e) => {
      e.preventDefault();
      selectRegion(regId);
    });
  });

  setTimeout(() => {
    const initId = state.filters.region && state.filters.region !== 'all_uz' ? state.filters.region : 'samarkand';
    highlightRegion(initId);
  }, 100);
}
