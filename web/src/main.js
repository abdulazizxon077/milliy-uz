import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import './styles.css';

import { REGIONS_I18N } from '../../shared/catalog.js';
import { adminAction, closeAdmin, initAdmin } from './admin/admin.js';
import { api } from './api.js';
import { DEFAULT_PLACES } from './lib/default-places.js';
import { debounce, PLACEHOLDER_IMAGE } from './lib/format.js';
import { t } from './lib/i18n.js';
import { loadSnapshot, saveSnapshot } from './lib/offline-catalog.js';
import { parsePlaceRoute, placePath } from './lib/routes.js';
import { findPlace, notify, onChange, setLanguage, state } from './state.js';
import { toggleBookmark, updateBookmarkUi } from './ui/bookmarks-view.js';
import { renderCategories, renderPlaces } from './ui/catalog-view.js';
import { initVoice, sendMessage } from './ui/chat-view.js';
import {
  closeDetail,
  openDetail,
  refreshCurrentDetail,
  sharePlace,
  submitReport,
  submitReview,
  syncDetailBookmark,
  syncReportHint,
  toggleReportForm,
} from './ui/detail-view.js';
import { applyI18nToDom } from './ui/i18n-view.js';
import { refreshIcons } from './ui/icons.js';
import { flyTo, flyToRegion, initMap, renderMarkers, updateUserMarker } from './ui/map-view.js';
import { closeModal, isOpen, openModal, trapFocus } from './ui/modal.js';
import { handleRegionPick, openRegionPicker } from './ui/region-modal.js';
import { showToast } from './ui/toast.js';
import { highlightMapRegion, renderUzbekistanMap } from './ui/uzbekistan-map.js';

const $ = (id) => document.getElementById(id);

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const NAV_SECTIONS = [
  'hero-section',
  'categories-section',
  'catalog-section',
  'map-section',
  'ai-section',
];

function setActiveSection(id) {
  document.querySelectorAll('.nav-pill, .mobile-nav-item').forEach((link) => {
    const active = link.dataset.scrollTo === id;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

/** Highlights the nav entry for whichever section is crossing the middle of the screen. */
function bindScrollSpy() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      const hit = entries.find((e) => e.isIntersecting);
      if (hit) setActiveSection(hit.target.id);
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  for (const id of NAV_SECTIONS) {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  }
}

function render() {
  applyI18nToDom(state.lang);
  renderCategories();
  const visible = renderPlaces();
  renderMarkers(visible);
  updateBookmarkUi();
  refreshCurrentDetail();

  // Sync active region pill on map section
  const mapPill = $('map-active-region-pill');
  if (mapPill) {
    const regName = REGIONS_I18N[state.filters.region]?.[state.lang] || state.filters.region;
    mapPill.textContent = regName;
  }
  highlightMapRegion(state.filters.region);

  refreshIcons();
}

const actions = {
  'scroll-to': (el) => scrollToSection(el.dataset.target),
  'select-category': (el) => {
    // Mandatory region picker when clicking any category (User requirement 10, Image 2)
    openRegionPicker(el.dataset.category || 'all');
  },
  'pick-region-and-close': (el) => {
    handleRegionPick(el.dataset.region);
  },
  'close-region-modal': () => {
    closeModal('region-select-modal');
  },
  'set-lang-and-close': (el) => {
    const lang = el.dataset.lang;
    const menu = $('lang-dropdown-menu');
    const trigger = $('lang-dropdown-trigger');
    const arrow = $('lang-dropdown-arrow');
    if (menu) menu.classList.add('hidden');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (lang && lang !== state.lang) {
      setLanguage(lang);
      showToast(t('langSwitched', lang));
    }
  },
  'set-lang': (el) => {
    const lang = el.dataset.lang;
    if (lang && lang !== state.lang) {
      setLanguage(lang);
      showToast(t('langSwitched', lang));
    }
  },
  ask: (el) => {
    scrollToSection('ai-section');
    sendMessage(el.dataset.prompt);
  },
  'open-detail': (el) => {
    closeModal('bookmarks-drawer');
    openDetail(el.dataset.id);
  },
  'toggle-bookmark': (el) => {
    toggleBookmark(el.dataset.id);
    syncDetailBookmark();
  },
  'share-place': (el) => sharePlace(el.dataset.id),
  'toggle-report': () => toggleReportForm(),
  'close-bookmarks': () => closeModal('bookmarks-drawer'),
};

function bindDelegation() {
  document.addEventListener('click', (event) => {
    const scrollLink = event.target.closest('[data-scroll-to]');
    if (scrollLink) {
      event.preventDefault();
      scrollToSection(scrollLink.dataset.scrollTo);
      setActiveSection(scrollLink.dataset.scrollTo);
      return;
    }
    const el = event.target.closest('[data-action]');
    if (!el) return;
    const name = el.dataset.action;
    if (actions[name]) {
      event.preventDefault();
      actions[name](el);
    } else if (adminAction(name, el)) {
      event.preventDefault();
    }
  });

  document.addEventListener('submit', (event) => {
    if (event.target.id === 'detail-review-form') {
      event.preventDefault();
      submitReview(event.target);
    } else if (event.target.id === 'detail-report-form') {
      event.preventDefault();
      submitReport(event.target);
    }
  });

  document.addEventListener('change', (event) => {
    if (event.target.id === 'report-reason') syncReportHint();
  });

  document.addEventListener('keydown', trapFocus);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (isOpen('admin-edit-modal')) closeModal('admin-edit-modal');
    else if (isOpen('place-detail-modal')) closeDetail();
    else if (isOpen('bookmarks-drawer')) closeModal('bookmarks-drawer');
    else if (isOpen('admin-login-modal')) closeModal('admin-login-modal');
    else if (isOpen('admin-dashboard-modal')) closeAdmin();
  });
}

function bindFilters() {
  const search = $('catalog-search-input');
  search?.addEventListener(
    'input',
    debounce(() => {
      state.filters.query = search.value;
      notify();
    }, 200),
  );
  $('catalog-region-select')?.addEventListener('change', (e) => {
    state.filters.region = e.target.value;
    highlightMapRegion(e.target.value);
    const mapPill = $('map-active-region-pill');
    if (mapPill) {
      mapPill.textContent = REGIONS_I18N[e.target.value]?.[state.lang] || e.target.value;
    }
    notify();
    flyToRegion(e.target.value);
  });
  $('catalog-sort-select')?.addEventListener('change', (e) => {
    state.filters.sortBy = e.target.value;
    notify();
  });
  $('filter-open-now')?.addEventListener('change', (e) => {
    state.filters.onlyOpenNow = e.target.checked;
    notify();
  });
  $('filter-guaranteed')?.addEventListener('change', (e) => {
    state.filters.onlyGuaranteed = e.target.checked;
    notify();
  });
}

function bindLocate() {
  $('btn-locate-me')?.addEventListener('click', () => {
    const lang = state.lang;
    if (!navigator.geolocation) {
      showToast(lang === 'ru' ? 'Браузер не поддерживает геолокацию' : lang === 'en' ? 'Geolocation not supported by browser' : "Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
      return;
    }
    showToast(t('locatingToast', lang));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        state.hasGpsLocation = true;
        state.userLocation = {
          lat: coords.latitude,
          lng: coords.longitude,
          address: lang === 'ru' ? 'Точка по GPS' : lang === 'en' ? 'Current GPS point' : "GPS bo'yicha joriy nuqta",
        };
        const dot = $('user-location-dot');
        if (dot) {
          dot.className = 'w-2.5 h-2.5 rounded-full bg-[#b4f73a] animate-ping';
        }
        const lbl = $('user-location-label');
        if (lbl) {
          lbl.textContent = lang === 'ru'
            ? `GPS активен (${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}) - точные расстояния`
            : lang === 'en'
            ? `GPS active (${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}) - exact distances`
            : `GPS faol (${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}) - aniq masofalar`;
        }
        updateUserMarker();
        notify();
        flyTo(coords.latitude, coords.longitude, 14);
        showToast(t('locatedSuccess', lang));
      },
      () => showToast(t('locatedFailed', lang)),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });
}

function bindChat() {
  $('ai-send-btn')?.addEventListener('click', () => sendMessage());
  $('ai-user-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  initVoice((transcript) => sendMessage(transcript));
}

function bindModals() {
  $('close-detail-modal')?.addEventListener('click', closeDetail);
  $('place-detail-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'place-detail-modal') closeDetail();
  });
  $('close-region-modal')?.addEventListener('click', () => closeModal('region-select-modal'));
  $('region-select-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'region-select-modal') closeModal('region-select-modal');
  });
  $('open-bookmarks-btn')?.addEventListener('click', () => {
    updateBookmarkUi();
    openModal('bookmarks-drawer');
  });
  $('close-bookmarks-drawer')?.addEventListener('click', () => closeModal('bookmarks-drawer'));
  $('bookmarks-drawer')?.addEventListener('click', (e) => {
    if (e.target.id === 'bookmarks-drawer') closeModal('bookmarks-drawer');
  });
}

/** Swaps broken place photos (dead links, offline) for a local placeholder. */
function bindImageFallback() {
  document.addEventListener(
    'error',
    (event) => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement) || img.closest('.leaflet-container')) return;
      if (img.dataset.fallback) return;
      img.dataset.fallback = 'true';
      img.src = PLACEHOLDER_IMAGE;
    },
    true,
  );
}

function bindConnectivity() {
  const banner = $('offline-banner');
  const update = () => banner?.classList.toggle('hidden', navigator.onLine);
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

/** Opens or closes the place dialog to match the address bar. */
function applyRoute({ initial = false } = {}) {
  const route = parsePlaceRoute(location);
  if (route.kind === 'home') {
    if (isOpen('place-detail-modal')) closeDetail({ fromHistory: true });
    return;
  }
  if (route.id && findPlace(route.id)) {
    if (route.kind === 'legacy') history.replaceState(null, '', placePath(route.id));
    openDetail(route.id, { fromHistory: true });
    return;
  }
  if (route.kind === 'place') {
    if (initial || !isOpen('place-detail-modal')) showToast(state.lang === 'ru' ? 'Объект не найден' : state.lang === 'en' ? 'Place not found' : "Joy topilmadi yoki o'chirilgan", 4000);
    if (isOpen('place-detail-modal')) closeDetail({ fromHistory: true });
    history.replaceState(null, '', `/${location.search}`);
  }
}

async function loadPlaces() {
  try {
    state.places = await api.places();
    saveSnapshot(state.places);
  } catch {
    const snapshot = loadSnapshot();
    if (snapshot?.places?.length) {
      state.places = snapshot.places;
    } else {
      state.places = DEFAULT_PLACES;
      saveSnapshot(DEFAULT_PLACES);
    }
  }
  notify();
  applyRoute({ initial: true });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

function bindLangDropdown() {
  const trigger = $('lang-dropdown-trigger');
  const menu = $('lang-dropdown-menu');
  const arrow = $('lang-dropdown-arrow');
  if (!trigger || !menu) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = menu.classList.toggle('hidden');
    trigger.setAttribute('aria-expanded', String(!isHidden));
    if (arrow) arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#lang-dropdown-wrapper')) {
      menu.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
  });
}

function init() {
  bindDelegation();
  bindLangDropdown();
  bindFilters();
  bindLocate();
  bindChat();
  bindModals();
  bindConnectivity();
  bindImageFallback();
  bindScrollSpy();
  initAdmin();
  const leafletContainer = $('leaflet-map-container');
  if (leafletContainer) {
    initMap(leafletContainer, { openDetail });
  }
  
  // Real Geographic Vector Map of Uzbekistan (Replacing broken tile map in 3-rasm)
  renderUzbekistanMap($('uz-geographic-map-container'), {
    onSelectRegion: (regId) => {
      state.filters.region = regId;
      state.filters.category = 'all';
      const select = $('catalog-region-select');
      if (select) select.value = regId;
      const mapPill = $('map-active-region-pill');
      if (mapPill) {
        mapPill.textContent = REGIONS_I18N[regId]?.[state.lang] || regId;
      }
      notify();
      scrollToSection('catalog-section');
      const regName = REGIONS_I18N[regId]?.[state.lang] || regId;
      showToast(`${regName}: ${t('catalogHeading', state.lang)}`);
    },
  });

  onChange(render);
  render();
  window.addEventListener('popstate', () => applyRoute());
  window.addEventListener('hashchange', () => applyRoute());
  loadPlaces();
  registerServiceWorker();
}

init();
