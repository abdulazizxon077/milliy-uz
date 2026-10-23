import { REGIONS, REGIONS_I18N } from '../../../shared/catalog.js';
import { t } from '../lib/i18n.js';
import { state } from '../state.js';
import { refreshIcons } from './icons.js';

export function applyI18nToDom(lang = state.lang) {
  document.documentElement.lang = lang;

  // 1. Language Dropdown & Labels
  const curLangLabel = document.getElementById('current-lang-label');
  if (curLangLabel) curLangLabel.textContent = lang === 'ru' ? 'РУ' : lang === 'en' ? 'EN' : "O'Z";

  document.querySelectorAll('.lang-dropdown-item').forEach((item) => {
    const active = item.dataset.lang === lang;
    item.classList.toggle('bg-[#102d20]', active);
    const pill = item.querySelector('span:last-child');
    if (pill) {
      pill.className = active
        ? 'text-[10px] text-[#b4f73a] font-black px-1.5 py-0.5 rounded bg-[#102d20] border border-[#1b3b2f]'
        : 'text-[10px] text-[#94a3b8] font-bold px-1.5 py-0.5 rounded bg-[#102d20] border border-[#1b3b2f]';
    }
  });

  document.querySelectorAll('[data-action="set-lang"]').forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  // 2. Navigation & Brand
  const brandSub = document.querySelector('header .max-w-7xl a span.text-\\[10px\\]');
  if (brandSub) brandSub.textContent = t('brandSubtitle', lang);

  const navMap = [
    { target: 'hero-section', text: t('navHome', lang) },
    { target: 'categories-section', text: t('navCategories', lang) },
    { target: 'catalog-section', text: t('navCatalog', lang) },
    { target: 'map-section', text: t('navMap', lang) },
    { target: 'ai-section', text: t('navConsultant', lang) },
  ];

  navMap.forEach(({ target, text }) => {
    document.querySelectorAll(`[data-scroll-to="${target}"] span`).forEach((el) => {
      el.textContent = text;
    });
  });

  const bookmarksBtn = document.getElementById('open-bookmarks-btn');
  if (bookmarksBtn) {
    bookmarksBtn.title = t('bookmarksTitle', lang);
    bookmarksBtn.setAttribute('aria-label', t('bookmarksTitle', lang));
  }

  // 3. Offline Banner
  const offlineBanner = document.getElementById('offline-banner');
  if (offlineBanner) offlineBanner.textContent = t('offlineAlert', lang);

  // 4. Emergency SOS Bar
  const sosTitle = document.querySelector('#emergency-sos-bar span.text-\\[\\#cbd5e1\\]');
  if (sosTitle) sosTitle.textContent = t('sosTitle', lang);

  const sosButtons = [
    { href: 'tel:101', text: t('sosFire', lang) },
    { href: 'tel:102', text: t('sosPolice', lang) },
    { href: 'tel:103', text: t('sosAmbulance', lang) },
    { href: 'tel:104', text: t('sosGas', lang) },
    { href: 'tel:1050', text: t('sosRescue', lang) },
    { href: 'tel:112', text: t('sosUnified', lang) },
  ];
  sosButtons.forEach(({ href, text }) => {
    const el = document.querySelector(`#emergency-sos-bar a[href="${href}"] span:last-child`);
    if (el) el.textContent = text;
  });

  // 5. Hero Section
  const heroBadge = document.querySelector('.badge-platform');
  if (heroBadge) heroBadge.textContent = t('heroBadge', lang);

  const heroHeading = document.querySelector('#hero-section h1');
  if (heroHeading) {
    heroHeading.innerHTML = `${t('heroTitlePrefix', lang)}<br /><span class="text-[#b4f73a]">${t('heroTitleAccent', lang)}</span><br />${t('heroTitleSuffix', lang)}`;
  }

  const heroDesc = document.querySelector('#hero-section p.text-base');
  if (heroDesc) heroDesc.textContent = t('heroDesc', lang);

  const heroOpenBtn = document.querySelector('#hero-section button[data-target="catalog-section"] span');
  if (heroOpenBtn) heroOpenBtn.textContent = t('heroOpenCatalog', lang);

  const heroAskBtn = document.querySelector('#hero-section button[data-target="ai-section"] span');
  if (heroAskBtn) heroAskBtn.textContent = t('heroAskAssistant', lang);

  const statEls = document.querySelectorAll('#hero-section .grid-cols-2.sm\\:grid-cols-4 span.font-medium');
  if (statEls.length >= 4) {
    statEls[0].textContent = t('statRegions', lang);
    statEls[1].textContent = t('statCategories', lang);
    statEls[2].textContent = t('statRoute', lang);
    statEls[3].textContent = t('statDirectCall', lang);
  }

  const heroCardTitle = document.querySelector('#hero-section .hero-mosaic + h3');
  if (heroCardTitle) heroCardTitle.textContent = t('heroCardTitle', lang);

  const heroCardDesc = document.querySelector('#hero-section .hero-mosaic ~ p.text-xs');
  if (heroCardDesc) heroCardDesc.textContent = t('heroCardDesc', lang);

  const heroTiles = document.querySelectorAll('#hero-section .hero-tile');
  if (heroTiles.length >= 4) {
    heroTiles[0].querySelector('span').textContent = t('heroTileAuto', lang);
    heroTiles[1].querySelector('span').textContent = t('heroTileMedical', lang);
    heroTiles[2].querySelector('span').textContent = t('heroTileGov', lang);
    heroTiles[3].querySelector('span').textContent = t('heroTileGas', lang);
  }

  const heroCardBtnCat = document.querySelector('#hero-section .hero-mosaic ~ div button[data-target="categories-section"]');
  if (heroCardBtnCat) heroCardBtnCat.lastChild.textContent = ` ${t('heroCardBtnCategories', lang)}`;

  const heroCardBtnList = document.querySelector('#hero-section .hero-mosaic ~ div button[data-target="catalog-section"]');
  if (heroCardBtnList) heroCardBtnList.lastChild.textContent = ` ${t('heroCardBtnList', lang)}`;

  // 6. Categories Section
  const catTitle = document.querySelector('#categories-section h2');
  if (catTitle) catTitle.textContent = t('categoriesTitle', lang);

  const catSub = document.querySelector('#categories-section p');
  if (catSub) catSub.textContent = t('categoriesSubtitle', lang);

  // 7. Catalog Section Header & Inputs
  const catListTitle = document.querySelector('#catalog-section h3');
  if (catListTitle) catListTitle.textContent = t('catalogTitle', lang);

  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) searchInput.placeholder = t('searchPlaceholder', lang);

  const regionSelect = document.getElementById('catalog-region-select');
  if (regionSelect) {
    const curVal = regionSelect.value;
    regionSelect.innerHTML = `
      <option value="all_uz">${REGIONS_I18N.all_uz[lang] || REGIONS_I18N.all_uz.uz}</option>
      ${REGIONS.map((r) => `<option value="${r.id}">${REGIONS_I18N[r.id]?.[lang] || r.name}</option>`).join('')}
    `;
    regionSelect.value = curVal;
  }

  const sortSelect = document.getElementById('catalog-sort-select');
  if (sortSelect) {
    const curSort = sortSelect.value;
    sortSelect.innerHTML = `
      <option value="distance">${t('sortByDistance', lang)}</option>
      <option value="rating">${t('sortByRating', lang)}</option>
      <option value="experience">${t('sortByExperience', lang)}</option>
    `;
    sortSelect.value = curSort;
  }

  const openNowLabel = document.querySelector('label[for="filter-open-now"] span, label:has(#filter-open-now) span');
  if (openNowLabel) openNowLabel.textContent = t('filterOpenNow', lang);

  const guaranteedLabel = document.querySelector('label[for="filter-guaranteed"] span, label:has(#filter-guaranteed) span');
  if (guaranteedLabel) guaranteedLabel.textContent = t('filterGuaranteed', lang);

  const showAllCatBtn = document.querySelector('#catalog-section button[data-category="all"]');
  if (showAllCatBtn) showAllCatBtn.textContent = t('showAllCategories', lang);

  // 8. Map Section
  const mapHeading = document.querySelector('#map-section span.font-black');
  if (mapHeading) mapHeading.textContent = t('mapHeading', lang);

  const mapSub = document.querySelector('#map-section span.hidden.sm\\:inline');
  if (mapSub) mapSub.textContent = `· ${t('mapInstruction', lang)}`;

  const mapLocLabel = document.querySelector('#map-section .glass-panel span.text-\\[\\#94a3b8\\]');
  if (mapLocLabel) mapLocLabel.textContent = t('mapSelectedRegionLabel', lang);

  const locateLabel = document.getElementById('user-location-label');
  if (locateLabel && !state.hasGpsLocation) locateLabel.textContent = t('gpsActivateBtn', lang);

  const mapFooterNote = document.querySelector('#map-section .border-t span.text-white span');
  if (mapFooterNote) mapFooterNote.textContent = t('mapFooterInstruction', lang);

  const mapFooterBadge = document.querySelector('#map-section .border-t span.text-\\[\\#b4f73a\\]');
  if (mapFooterBadge) mapFooterBadge.textContent = t('mapFooterBadge', lang);

  // 8.1 Region Modal
  const regModalTitle = document.querySelector('#region-select-modal h3');
  if (regModalTitle) regModalTitle.textContent = t('regionModalTitle', lang);

  const regModalSub = document.querySelector('#region-select-modal p.text-xs');
  if (regModalSub) regModalSub.textContent = t('regionModalSubtitle', lang);

  const regModalCatLabel = document.getElementById('region-modal-cat-label');
  if (regModalCatLabel) regModalCatLabel.textContent = t('regionModalCategoryLabel', lang);

  const regModalAllBtn = document.querySelector('#region-select-modal button[data-region="all_uz"]');
  if (regModalAllBtn) regModalAllBtn.textContent = t('regionModalAllUzBtn', lang);

  const regModalTrust = document.querySelector('#region-select-modal .border-t span:last-child');
  if (regModalTrust) regModalTrust.textContent = t('regionModalTrustBadge', lang);

  // 9. AI Assistant Section
  const aiTitle = document.querySelector('#ai-section h3');
  if (aiTitle) aiTitle.textContent = t('assistantTitle', lang);

  const aiSub = document.querySelector('#ai-section .border-b p.text-xs');
  if (aiSub) aiSub.textContent = t('assistantSubtitle', lang);

  const aiStatus = document.querySelector('#ai-section .border-b span.text-xs');
  if (aiStatus) aiStatus.textContent = t('assistantStatus', lang);

  const aiInput = document.getElementById('ai-user-input');
  if (aiInput) aiInput.placeholder = t('assistantInputPlaceholder', lang);

  const aiSendBtn = document.querySelector('#ai-send-btn span');
  if (aiSendBtn) aiSendBtn.textContent = t('assistantSendBtn', lang);

  // Update quick chips
  const chips = document.querySelectorAll('#ai-section button[data-action="ask"]');
  if (chips.length >= 4) {
    chips[0].textContent = t('promptGreeting', lang);
    chips[0].dataset.prompt = t('promptGreetingVal', lang);

    chips[1].innerHTML = `<i data-lucide="wrench" class="w-3 h-3 text-[#b4f73a]"></i> ${t('promptAuto', lang)}`;
    chips[1].dataset.prompt = t('promptAutoVal', lang);

    chips[2].innerHTML = `<i data-lucide="fuel" class="w-3 h-3 text-emerald-400"></i> ${t('promptGas', lang)}`;
    chips[2].dataset.prompt = t('promptGasVal', lang);

    chips[3].innerHTML = `<i data-lucide="stethoscope" class="w-3 h-3 text-[#e2b170]"></i> ${t('promptMedical', lang)}`;
    chips[3].dataset.prompt = t('promptMedicalVal', lang);
  }

  // 10. Bookmarks Drawer
  const bTitle = document.querySelector('#bookmarks-drawer h3');
  if (bTitle) bTitle.textContent = t('bookmarksHeading', lang);

  const bClose = document.querySelector('#bookmarks-drawer button[data-action="close-bookmarks"]');
  if (bClose) bClose.textContent = t('closeBtn', lang);

  // 11. Footer
  const footerSub = document.querySelector('footer span.font-extrabold ~ span');
  if (footerSub) footerSub.textContent = t('footerSubtitle', lang);

  const copyright = document.querySelector('footer .flex-col > div:last-child > span:first-child, footer .flex-row > div:last-child > span:first-child');
  if (copyright) copyright.textContent = t('copyright', lang);

  const adminTrigger = document.querySelector('#secret-admin-trigger span');
  if (adminTrigger) adminTrigger.textContent = t('adminPortal', lang);

  refreshIcons();
}
