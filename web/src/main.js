import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import './styles.css';

import {
  adminAction,
  closeAdmin,
  exitAdmin,
  initAdmin,
  isLoginOpen,
  openAdmin,
} from './admin/admin.js';
import { api } from './api.js';
import { DEFAULT_FILTERS } from './lib/catalog.js';
import { debounce, getOpenStatus } from './lib/format.js';
import { loadSnapshot, saveSnapshot } from './lib/offline-catalog.js';
import { parsePlaceRoute, placePath } from './lib/routes.js';
import { findPlace, notify, onChange, state } from './state.js';
import { toggleBookmark, updateBookmarkUi } from './ui/bookmarks-view.js';
import { PAGE_SIZE, renderCategories, renderPlaces } from './ui/catalog-view.js';
import { initVoice, sendMessage } from './ui/chat-view.js';
import {
  closeDetail,
  openDetail,
  submitReport,
  syncReportHint,
  toggleReportForm,
  sharePlace,
  submitReview,
  syncDetailBookmark,
} from './ui/detail-view.js';
import { refreshIcons } from './ui/icons.js';
import {
  fitToPlaces,
  flyTo,
  flyToRegion,
  initMap,
  invalidateMap,
  mapStyle,
  renderMarkers,
  setMapStyle,
  updateUserMarker,
} from './ui/map-view.js';
import { closeModal, isOpen, openModal, trapFocus } from './ui/modal.js';
import { renderPage } from './ui/pages-view.js';
import { showToast } from './ui/toast.js';

const HOME_TITLE = document.title;

const $ = (id) => document.getElementById(id);

function scrollToSection(id) {
  if (!$('page-view')?.classList.contains('hidden')) {
    history.pushState(null, '', `/#${id}`);
    showHome();
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Changes filters from code; the list starts again from the first page. */
function filtersChanged() {
  state.visibleCount = PAGE_SIZE;
  notify();
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

function renderHeroStats() {
  const set = (id, value) => {
    const el = $(id);
    if (el) el.textContent = value;
  };
  if (!state.places.length) return;
  const now = new Date();
  set('hero-stat-places', String(state.places.length));
  set('hero-stat-regions', String(new Set(state.places.map((p) => p.region)).size));
  set('hero-stat-open', String(state.places.filter((p) => getOpenStatus(p, now).isOpen).length));
}

function render() {
  renderCategories();
  const visible = renderPlaces();
  renderMarkers(visible);
  const count = $('map-count');
  if (count) count.textContent = `Xaritada ${visible.length} ta joy`;
  renderHeroStats();
  updateBookmarkUi();
  refreshIcons();
}

function syncFilterInputs() {
  const f = state.filters;
  const set = (id, prop, value) => {
    const el = $(id);
    if (el) el[prop] = value;
  };
  set('catalog-search-input', 'value', f.query);
  set('hero-search-input', 'value', f.query);
  set('catalog-region-select', 'value', f.region);
  set('catalog-sort-select', 'value', f.sortBy);
  set('filter-open-now', 'checked', f.onlyOpenNow);
  set('filter-with-phone', 'checked', f.onlyWithPhone);
}

function syncMapStyleButton() {
  const btn = $('btn-map-style');
  if (!btn) return;
  const dark = mapStyle() === 'dark';
  btn.setAttribute('aria-pressed', String(dark));
  btn.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}" class="w-4 h-4"></i><span>${dark ? 'Kunduzgi' : 'Tungi'}</span>`;
  refreshIcons();
}

const actions = {
  'scroll-to': (el) => scrollToSection(el.dataset.target),
  'select-category': (el) => {
    state.filters.category = el.dataset.category || 'all';
    filtersChanged();
    scrollToSection('catalog-section');
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
  'reset-filters': () => {
    state.filters = { ...DEFAULT_FILTERS };
    syncFilterInputs();
    filtersChanged();
    fitToPlaces(state.places);
  },
  'show-more': () => {
    state.visibleCount += PAGE_SIZE;
    notify();
  },
};

function bindDelegation() {
  document.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }
    const pageLink = event.target.closest('[data-nav-page]');
    if (pageLink) {
      event.preventDefault();
      navigate(`/${pageLink.dataset.navPage}`);
      return;
    }
    const homeLink = event.target.closest('[data-nav-home]');
    if (homeLink) {
      event.preventDefault();
      if (location.pathname !== '/') navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
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
    if (event.target.id === 'ai-chat-form') {
      event.preventDefault();
      sendMessage();
    } else if (event.target.id === 'hero-search-form') {
      event.preventDefault();
      state.filters.query = $('hero-search-input')?.value.trim() ?? '';
      syncFilterInputs();
      filtersChanged();
      scrollToSection('catalog-section');
    } else if (event.target.id === 'detail-review-form') {
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
    else if (isLoginOpen()) exitAdmin();
    else if (isOpen('admin-dashboard-modal')) closeAdmin();
  });
}

function bindFilters() {
  const search = $('catalog-search-input');
  search?.addEventListener(
    'input',
    debounce(() => {
      state.filters.query = search.value;
      filtersChanged();
    }, 200),
  );
  $('catalog-region-select')?.addEventListener('change', (e) => {
    state.filters.region = e.target.value;
    filtersChanged();
    flyToRegion(e.target.value);
  });
  $('catalog-sort-select')?.addEventListener('change', (e) => {
    state.filters.sortBy = e.target.value;
    filtersChanged();
  });
  $('filter-open-now')?.addEventListener('change', (e) => {
    state.filters.onlyOpenNow = e.target.checked;
    filtersChanged();
  });
  $('filter-with-phone')?.addEventListener('change', (e) => {
    state.filters.onlyWithPhone = e.target.checked;
    filtersChanged();
  });
}

function bindMapControls() {
  $('btn-map-fit')?.addEventListener('click', () => {
    fitToPlaces(renderPlaces());
  });
  $('btn-map-style')?.addEventListener('click', () => {
    setMapStyle(mapStyle() === 'dark' ? 'light' : 'dark');
    syncMapStyleButton();
  });
  syncMapStyleButton();
}

function bindLocate() {
  $('btn-locate-me')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
      return;
    }
    showToast('Joylashuv aniqlanmoqda...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        state.userLocation = {
          lat: coords.latitude,
          lng: coords.longitude,
          address: "GPS bo'yicha joriy nuqta",
        };
        updateUserMarker();
        $('user-location-dot')?.classList.add('is-on');
        const label = $('user-location-label');
        if (label) label.textContent = "Joylashuvingiz bo'yicha saralangan";
        state.filters.sortBy = 'distance';
        syncFilterInputs();
        filtersChanged();
        flyTo(coords.latitude, coords.longitude, 13);
        showToast('Joylashuv aniqlandi');
      },
      () => showToast("Joylashuvni aniqlab bo'lmadi"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });
}

function bindChat() {
  initVoice((transcript) => sendMessage(transcript));
}

function bindModals() {
  $('close-detail-modal')?.addEventListener('click', closeDetail);
  $('place-detail-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'place-detail-modal') closeDetail();
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

/** A photo that fails to load is removed, uncovering the category placeholder under it. */
function bindImageFallback() {
  document.addEventListener(
    'error',
    (event) => {
      const img = event.target;
      if (img instanceof HTMLImageElement && img.matches('.place-photo, .place-thumb'))
        img.remove();
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

function showHome() {
  $('page-view')?.classList.add('hidden');
  $('home-view')?.classList.remove('hidden');
  document.title = HOME_TITLE;
  invalidateMap();
}

function showPage(id) {
  if (isOpen('place-detail-modal')) closeDetail({ fromHistory: true });
  $('home-view')?.classList.add('hidden');
  const view = $('page-view');
  view?.classList.remove('hidden');
  document.title = renderPage(id);
  document.querySelectorAll('[data-nav-page]').forEach((a) => {
    if (a.dataset.navPage === id) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0 });
  view?.querySelector('h1')?.focus?.();
}

function navigate(path) {
  if (path !== location.pathname) history.pushState(null, '', path);
  applyRoute();
}

/** Shows the view that matches the address bar. */
function applyRoute({ initial = false } = {}) {
  const route = parsePlaceRoute(location);
  if (route.kind === 'admin') {
    showHome();
    openAdmin();
    return;
  }
  if (route.kind === 'page' || route.kind === 'missing') {
    showPage(route.kind === 'page' ? route.id : null);
    return;
  }
  const wasPage = !$('page-view')?.classList.contains('hidden');
  showHome();
  if (wasPage && location.hash) {
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' });
  }
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
    if (initial || !isOpen('place-detail-modal')) showToast("Joy topilmadi yoki o'chirilgan", 4000);
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
    if (snapshot?.places.length) {
      state.places = snapshot.places;
      const day = new Date(snapshot.savedAt).toLocaleDateString('uz-UZ');
      showToast(`Aloqa yo'q: ${day} holatidagi saqlangan katalog ko'rsatilmoqda`, 5000);
    } else {
      state.places = [];
      showToast("Ma'lumotlarni yuklab bo'lmadi. Internet aloqasini tekshiring", 4000);
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

function init() {
  bindDelegation();
  bindFilters();
  bindLocate();
  bindMapControls();
  bindChat();
  bindModals();
  bindConnectivity();
  bindImageFallback();
  bindScrollSpy();
  initAdmin({ onLeave: () => location.pathname === '/admin' && navigate('/') });
  initMap($('leaflet-map-container'), { openDetail });
  onChange(render);
  render();
  window.addEventListener('popstate', () => applyRoute());
  window.addEventListener('hashchange', () => applyRoute());
  const route = parsePlaceRoute(location);
  if (route.kind === 'page' || route.kind === 'missing') applyRoute();
  loadPlaces();
  registerServiceWorker();
}

init();
