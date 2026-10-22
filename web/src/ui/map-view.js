import L from './leaflet.js';
import 'leaflet.markercluster';
import { categoryName, COUNTRY_VIEW, REGION_ZOOM, REGIONS } from '../../../shared/catalog.js';
import { distanceKm, formatDistance, getOpenStatus } from '../lib/format.js';
import { state } from '../state.js';

/**
 * Tiles come from VITE_MAP_TILE_URL when set (for a self-hosted or commercial
 * tile server); otherwise the public OpenStreetMap servers are used, which
 * need no key but require the attribution below.
 */
const TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  import.meta.env.VITE_MAP_TILE_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> hissachilari';
const STYLE_KEY = 'milliy:map-style';

let map;
let cluster;
let userMarker;
let routeLine;
let lastBoundsKey = '';
let onOpenDetail = () => {};

const userIcon = L.divIcon({
  className: 'map-user-marker',
  html: '<span class="map-user-dot"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});
const placeIcon = L.divIcon({
  className: 'map-place-marker',
  html: '<span class="map-place-dot"></span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function placePopup(place) {
  const root = el('div', 'map-popup');
  const dist = formatDistance(distanceKm(state.userLocation, place));
  root.append(
    el('p', 'map-popup-title', place.name),
    el('p', 'map-popup-meta', [categoryName(place.category), dist].filter(Boolean).join(' • ')),
    el('p', 'map-popup-meta', getOpenStatus(place).label),
  );
  if (place.address) root.append(el('p', 'map-popup-meta', place.address));
  const button = el('button', 'map-popup-btn', "Batafsil ma'lumot");
  button.type = 'button';
  button.addEventListener('click', () => onOpenDetail(place.id));
  root.append(button);
  return root;
}

function userPopup() {
  const root = el('div', 'map-popup');
  root.append(el('p', 'map-popup-title', 'Sizning joylashuvingiz'));
  return root;
}

/** Straight-line guide between the user and a place; the real route opens in Google Maps. */
function drawGuide(place) {
  routeLine?.remove();
  routeLine = null;
  if (!state.userLocation) return;
  const from = [state.userLocation.lat, state.userLocation.lng];
  routeLine = L.polyline([from, [place.lat, place.lng]], {
    color: '#b4f73a',
    weight: 3,
    dashArray: '8 10',
    opacity: 0.85,
  }).addTo(map);
}

function readStyle() {
  try {
    return localStorage.getItem(STYLE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/** Dark mode is a CSS filter over the standard tiles, so no second tile source is needed. */
export function setMapStyle(style, container = map?.getContainer()) {
  if (!container) return;
  container.classList.toggle('map-dark', style === 'dark');
  try {
    localStorage.setItem(STYLE_KEY, style);
  } catch {
    // Private mode: the choice just isn't remembered.
  }
}

export const mapStyle = () =>
  map?.getContainer().classList.contains('map-dark') ? 'dark' : 'light';

export function initMap(container, { openDetail }) {
  onOpenDetail = openDetail;
  setMapStyle(readStyle(), container);
  map = L.map(container, { zoomControl: false, attributionControl: true }).setView(
    [COUNTRY_VIEW.lat, COUNTRY_VIEW.lng],
    COUNTRY_VIEW.zoom,
  );
  map.attributionControl.setPrefix(false);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(map);

  cluster = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 50 });
  map.addLayer(cluster);
}

/** Zooms to the places on the map, or to the whole country when there are none. */
export function fitToPlaces(places, { animate = true } = {}) {
  if (!map) return;
  if (!places.length) {
    map.setView([COUNTRY_VIEW.lat, COUNTRY_VIEW.lng], COUNTRY_VIEW.zoom, { animate });
    return;
  }
  if (places.length === 1) {
    map.setView([places[0].lat, places[0].lng], 15, { animate });
    return;
  }
  const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate });
}

export function renderMarkers(places) {
  if (!map) return;
  cluster.clearLayers();
  routeLine?.remove();
  routeLine = null;
  cluster.addLayers(
    places.map((place) =>
      L.marker([place.lat, place.lng], { icon: placeIcon, title: place.name })
        .bindPopup(() => placePopup(place))
        .on('click', () => drawGuide(place)),
    ),
  );
  // Re-fit only when the set of places changes, not on every re-render.
  const key = places
    .map((p) => p.id)
    .sort()
    .join(',');
  if (key !== lastBoundsKey) {
    const first = lastBoundsKey === '';
    lastBoundsKey = key;
    fitToPlaces(places, { animate: !first });
  }
}

export function updateUserMarker() {
  if (!map || !state.userLocation) return;
  const at = [state.userLocation.lat, state.userLocation.lng];
  if (userMarker) userMarker.setLatLng(at);
  else {
    userMarker = L.marker(at, { icon: userIcon, zIndexOffset: 1000 })
      .bindPopup(userPopup)
      .addTo(map);
  }
}

export function flyTo(lat, lng, zoom) {
  map?.flyTo([lat, lng], zoom, { duration: 1.2 });
}

export function flyToRegion(regionId) {
  if (regionId === 'all_uz') {
    flyTo(COUNTRY_VIEW.lat, COUNTRY_VIEW.lng, COUNTRY_VIEW.zoom);
    return;
  }
  const region = REGIONS.find((r) => r.id === regionId);
  if (region) flyTo(region.center.lat, region.center.lng, REGION_ZOOM);
}

export function focusPlace(place) {
  if (!map) return;
  map.flyTo([place.lat, place.lng], 16, { duration: 1 });
}

export function invalidateMap() {
  map?.invalidateSize();
}
