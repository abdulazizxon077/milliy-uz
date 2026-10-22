/**
 * Interactive Vector Map of Uzbekistan
 * Styled with luxury Dark Emerald theme and pulsing neon markers.
 * Matches Image 1 layout: hover highlight, active selection, floating tooltip speech bubble.
 */

import { REGIONS, REGIONS_I18N } from '../../../shared/catalog.js';
import { state } from '../state.js';

// SVG paths defining the 13 administrative divisions of Uzbekistan (viewBox 0 0 920 460)
export const UZ_REGIONS_GEO = [
  {
    id: 'karakalpak',
    name: "Qoraqalpog'iston",
    center: { x: 195, y: 135 },
    path: 'M 48 22 C 145 22 170 42 225 65 C 275 88 320 75 328 100 L 328 165 C 310 185 240 185 235 210 C 215 220 185 205 160 215 C 130 220 110 205 95 205 L 48 205 Z',
  },
  {
    id: 'xorazm',
    name: 'Xorazm',
    center: { x: 260, y: 195 },
    path: 'M 235 185 C 255 185 285 195 275 220 C 265 230 240 225 235 210 Z',
  },
  {
    id: 'navoiy',
    name: 'Navoiy',
    center: { x: 420, y: 140 },
    path: 'M 328 75 C 375 75 480 60 488 110 L 488 175 C 455 185 435 215 410 215 C 385 215 365 250 345 250 L 328 165 Z',
  },
  {
    id: 'bukhara',
    name: 'Buxoro',
    center: { x: 375, y: 255 },
    path: 'M 328 185 C 365 215 390 220 405 250 C 400 280 365 315 340 330 C 315 300 310 240 328 185 Z',
  },
  {
    id: 'samarkand',
    name: 'Samarqand',
    center: { x: 485, y: 270 },
    path: 'M 445 230 C 485 220 535 235 540 270 C 530 295 490 320 465 320 C 445 300 440 255 445 230 Z',
  },
  {
    id: 'qashqadaryo',
    name: 'Qashqadaryo',
    center: { x: 505, y: 345 },
    path: 'M 465 310 C 510 300 550 320 560 350 C 550 380 500 415 470 395 C 455 365 450 330 465 310 Z',
  },
  {
    id: 'surxondaryo',
    name: 'Surxondaryo',
    center: { x: 575, y: 395 },
    path: 'M 550 340 C 585 330 615 355 625 390 C 615 430 575 445 565 425 C 550 395 545 365 550 340 Z',
  },
  {
    id: 'jizzax',
    name: 'Jizzax',
    center: { x: 540, y: 215 },
    path: 'M 505 185 C 545 180 575 200 575 235 C 555 255 520 250 505 230 Z',
  },
  {
    id: 'sirdaryo',
    name: 'Sirdaryo',
    center: { x: 595, y: 210 },
    path: 'M 575 195 C 605 190 625 210 615 240 C 595 245 580 230 575 195 Z',
  },
  {
    id: 'tashkent',
    name: 'Toshkent',
    center: { x: 655, y: 175 },
    path: 'M 610 145 C 665 110 710 130 715 170 C 695 205 650 220 625 205 Z',
  },
  {
    id: 'namangan',
    name: 'Namangan',
    center: { x: 740, y: 195 },
    path: 'M 715 170 C 765 160 790 185 780 215 C 755 220 730 205 715 170 Z',
  },
  {
    id: 'andijan',
    name: 'Andijon',
    center: { x: 825, y: 230 },
    path: 'M 795 210 C 845 205 860 235 845 255 C 815 260 800 240 795 210 Z',
  },
  {
    id: 'fergana',
    name: "Farg'ona",
    center: { x: 765, y: 255 },
    path: 'M 725 225 C 785 220 815 240 795 275 C 745 285 715 260 725 225 Z',
  },
];

let currentMapContainer = null;
let currentHighlightFn = null;

export function highlightMapRegion(regionId) {
  if (currentHighlightFn) {
    currentHighlightFn(regionId);
  }
}

export function renderUzbekistanMap(container, { onSelectRegion } = {}) {
  if (!container) return;
  currentMapContainer = container;

  const currentLang = state.lang || 'uz';
  const activeRegion = state.filters.region && state.filters.region !== 'all_uz' ? state.filters.region : 'samarkand';

  container.innerHTML = `
    <div class="uz-map-wrapper relative w-full h-full select-none flex items-center justify-center">
      <svg
        id="uz-svg-map"
        viewBox="0 0 900 460"
        class="w-full h-auto max-h-[460px] drop-shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
      >
        <defs>
          <linearGradient id="uz-region-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0e3427" />
            <stop offset="100%" stop-color="#082319" />
          </linearGradient>
          <linearGradient id="uz-region-hover" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#164d39" />
            <stop offset="100%" stop-color="#0f3d2d" />
          </linearGradient>
          <linearGradient id="uz-region-active" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e644b" />
            <stop offset="100%" stop-color="#134734" />
          </linearGradient>
          <filter id="glow-neon" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- REGION PATHS -->
        <g id="uz-regions-group">
          ${UZ_REGIONS_GEO.map((r) => {
            const isActive = activeRegion === r.id;
            return `
              <path
                id="uz-path-${r.id}"
                data-region="${r.id}"
                d="${r.path}"
                class="uz-map-path ${isActive ? 'active' : ''}"
                fill="${isActive ? 'url(#uz-region-active)' : 'url(#uz-region-gradient)'}"
                stroke="${isActive ? '#b4f73a' : '#1b4a38'}"
                stroke-width="${isActive ? '2.5' : '1.5'}"
                style="cursor: pointer; transition: all 0.25s ease;"
              />
            `;
          }).join('')}
        </g>

        <!-- PULSING MARKERS -->
        <g id="uz-markers-group">
          ${UZ_REGIONS_GEO.map((r) => {
            const isActive = activeRegion === r.id;
            return `
              <g
                class="uz-map-node ${isActive ? 'active' : ''}"
                data-region="${r.id}"
                transform="translate(${r.center.x}, ${r.center.y})"
                style="cursor: pointer;"
              >
                <!-- Pulse outer wave -->
                <circle
                  r="${isActive ? '18' : '13'}"
                  fill="none"
                  stroke="#b4f73a"
                  stroke-width="1.5"
                  opacity="${isActive ? '0.75' : '0.45'}"
                  class="animate-ping"
                />
                <!-- Outer border ring -->
                <circle
                  r="${isActive ? '14' : '9'}"
                  fill="#071912"
                  stroke="#b4f73a"
                  stroke-width="${isActive ? '2.5' : '1.8'}"
                />
                <!-- Center core dot -->
                <circle
                  r="${isActive ? '6' : '3.5'}"
                  fill="${isActive ? '#b4f73a' : '#73e27a'}"
                />
              </g>
            `;
          }).join('')}
        </g>
      </svg>

      <!-- FLOATING SPEECH-BUBBLE TOOLTIP (MATCHES IMAGE 1) -->
      <div
        id="uz-map-tooltip"
        class="uz-map-tooltip pointer-events-none absolute z-30 transition-all duration-200"
        style="display: none; transform: translate(-50%, -100%);"
      >
        <div class="relative bg-[#0d261c] border border-[#255e47] text-white text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.7)] flex items-center gap-1.5 whitespace-nowrap">
          <span id="uz-map-tooltip-text">Samarqand</span>
          <!-- Speech bubble bottom pointer -->
          <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0d261c] border-b border-r border-[#255e47] rotate-45"></div>
        </div>
      </div>
    </div>
  `;

  const svg = container.querySelector('#uz-svg-map');
  const tooltip = container.querySelector('#uz-map-tooltip');
  const tooltipText = container.querySelector('#uz-map-tooltip-text');

  function updateTooltipPosition(regionId) {
    const geo = UZ_REGIONS_GEO.find((g) => g.id === regionId);
    if (!geo || !svg || !tooltip) return;

    const svgRect = svg.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Map SVG coordinates to DOM pixel coordinates
    const scaleX = svgRect.width / 900;
    const scaleY = svgRect.height / 460;

    const pixelX = svgRect.left - containerRect.left + geo.center.x * scaleX;
    const pixelY = svgRect.top - containerRect.top + geo.center.y * scaleY - (scaleY > 0.6 ? 24 : 14);

    const localizedName = REGIONS_I18N[geo.id]?.[currentLang] || geo.name;
    tooltipText.textContent = localizedName;

    tooltip.style.left = `${pixelX}px`;
    tooltip.style.top = `${pixelY}px`;
    tooltip.style.display = 'block';
  }

  function highlightRegion(regionId) {
    const paths = container.querySelectorAll('.uz-map-path');
    const nodes = container.querySelectorAll('.uz-map-node');

    paths.forEach((p) => {
      const match = p.dataset.region === regionId;
      p.setAttribute('fill', match ? 'url(#uz-region-hover)' : 'url(#uz-region-gradient)');
      p.setAttribute('stroke', match ? '#b4f73a' : '#1b4a38');
      p.setAttribute('stroke-width', match ? '2.5' : '1.5');
    });

    nodes.forEach((n) => {
      const match = n.dataset.region === regionId;
      const core = n.querySelector('circle:last-child');
      if (core) core.setAttribute('fill', match ? '#b4f73a' : '#73e27a');
    });

    updateTooltipPosition(regionId);
  }

  currentHighlightFn = highlightRegion;

  // Window resize handler to reposition tooltip
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

  // Bind Hover and Click events on both paths and node markers
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
          p.setAttribute('fill', 'url(#uz-region-gradient)');
          p.setAttribute('stroke', '#1b4a38');
          p.setAttribute('stroke-width', '1.5');
        });
      }
    });

    el.addEventListener('click', (e) => {
      e.preventDefault();
      selectRegion(regId);
    });
  });

  // Initially show tooltip for active region (default Samarqand or state)
  setTimeout(() => {
    const initId = state.filters.region && state.filters.region !== 'all_uz' ? state.filters.region : 'samarkand';
    highlightRegion(initId);
  }, 100);
}
