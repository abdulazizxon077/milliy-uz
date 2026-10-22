import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import './styles.css';

import { adminAction, closeAdmin, initAdmin } from './admin/admin.js';
import { api } from './api.js';
import { debounce } from './lib/format.js';
import { findPlace, notify, onChange, state } from './state.js';
import { toggleBookmark, updateBookmarkUi } from './ui/bookmarks-view.js';
import { renderCategories, renderPlaces } from './ui/catalog-view.js';
import { initVoice, sendMessage } from './ui/chat-view.js';
import {
  closeDetail,
  openDetail,
  sharePlace,
  submitReview,
  syncDetailBookmark,
} from './ui/detail-view.js';
import { refreshIcons } from './ui/icons.js';
import { flyTo, flyToRegion, initMap, renderMarkers, updateUserMarker } from './ui/map-view.js';
import { closeModal, isOpen, openModal } from './ui/modal.js';
import { showToast } from './ui/toast.js';

const $ = (id) => document.getElementById(id);

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function render() {
  renderCategories();
  const visible = renderPlaces();
  renderMarkers(visible);
  updateBookmarkUi();
  refreshIcons();
}

const actions = {
  'scroll-to': (el) => scrollToSection(el.dataset.target),
  'select-category': (el) => {
    state.filters.category = el.dataset.category || 'all';
    notify();
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
  'close-bookmarks': () => closeModal('bookmarks-drawer'),
};

function bindDelegation() {
  document.addEventListener('click', (event) => {
    const scrollLink = event.target.closest('[data-scroll-to]');
    if (scrollLink) {
      event.preventDefault();
      scrollToSection(scrollLink.dataset.scrollTo);
      document
        .querySelectorAll('.nav-pill')
        .forEach((p) => p.classList.toggle('active', p === scrollLink));
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
    }
  });

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
        notify();
        flyTo(coords.latitude, coords.longitude, 14);
        showToast('Joylashuv aniqlandi');
      },
      () => showToast("Joylashuvni aniqlab bo'lmadi"),
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
  $('open-bookmarks-btn')?.addEventListener('click', () => {
    updateBookmarkUi();
    openModal('bookmarks-drawer');
  });
  $('close-bookmarks-drawer')?.addEventListener('click', () => closeModal('bookmarks-drawer'));
  $('bookmarks-drawer')?.addEventListener('click', (e) => {
    if (e.target.id === 'bookmarks-drawer') closeModal('bookmarks-drawer');
  });
}

function bindConnectivity() {
  const banner = $('offline-banner');
  const update = () => banner?.classList.toggle('hidden', navigator.onLine);
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

function openFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (id && findPlace(id)) openDetail(id);
}

async function loadPlaces() {
  try {
    state.places = await api.places();
  } catch {
    showToast("Ma'lumotlarni yuklab bo'lmadi. Internet aloqasini tekshiring", 4000);
    state.places = [];
  }
  notify();
  openFromHash();
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
  bindChat();
  bindModals();
  bindConnectivity();
  initAdmin();
  initMap($('leaflet-map-container'), { openDetail });
  onChange(render);
  render();
  window.addEventListener('hashchange', openFromHash);
  loadPlaces();
  registerServiceWorker();
}

init();
