import L from './leaflet.js';
import 'leaflet.markercluster';
import { categoryName, COUNTRY_VIEW, REGION_ZOOM, REGIONS } from '../../../shared/catalog.js';
import { distanceKm, formatDistance } from '../lib/format.js';
import { state } from '../state.js';

let map;
let cluster;
let userMarker;
let routeLine;
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
  root.append(
    el('p', 'map-popup-title', place.name),
    el(
      'p',
      'map-popup-meta',
      `${categoryName(place.category)} • ${formatDistance(distanceKm(state.userLocation, place))}`,
    ),
    el('p', 'map-popup-meta', place.chiefSpecialist),
  );
  const button = el('button', 'map-popup-btn', "Batafsil ma'lumot");
  button.type = 'button';
  button.addEventListener('click', () => onOpenDetail(place.id));
  root.append(button);
  return root;
}

function userPopup() {
  const root = el('div', 'map-popup');
  root.append(
    el('p', 'map-popup-title', 'Sizning joylashuvingiz'),
    el('p', 'map-popup-meta', state.userLocation.address),
  );
  return root;
}

/** Straight-line guide between the user and a place; the real route opens in Google Maps. */
function drawGuide(place) {
  routeLine?.remove();
  const from = [state.userLocation.lat, state.userLocation.lng];
  const to = [place.lat, place.lng];
  routeLine = L.polyline([from, to], {
    color: '#b4f73a',
    weight: 3,
    dashArray: '8 10',
    opacity: 0.85,
  }).addTo(map);
  map.fitBounds(routeLine.getBounds(), { padding: [60, 60], maxZoom: 15 });
}

export function initMap(container, { openDetail }) {
  onOpenDetail = openDetail;
  map = L.map(container, { zoomControl: false, attributionControl: true }).setView(
    [state.userLocation.lat, state.userLocation.lng],
    12,
  );
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  }).addTo(map);

  cluster = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 50 });
  map.addLayer(cluster);
  userMarker = L.marker([state.userLocation.lat, state.userLocation.lng], {
    icon: userIcon,
    zIndexOffset: 1000,
  })
    .bindPopup(userPopup)
    .addTo(map);
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
}

export function updateUserMarker() {
  userMarker?.setLatLng([state.userLocation.lat, state.userLocation.lng]);
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
