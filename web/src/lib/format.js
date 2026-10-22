import { DAY_NAMES, parseOpeningHours, scheduleStatus } from '../../../shared/opening-hours.js';

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapes a value for safe interpolation into HTML text or quoted attributes. */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

export function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres. */
export function distanceKm(from, to) {
  if (!from || !to) return NaN;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
  if (!Number.isFinite(km)) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

const scheduleCache = new Map();

/** Parsed weekly schedule for a place, or null when the hours are unknown. */
export function placeSchedule(place) {
  const text = place?.openingHours ?? '';
  if (!text) return null;
  if (!scheduleCache.has(text)) scheduleCache.set(text, parseOpeningHours(text));
  return scheduleCache.get(text);
}

function opensLabel(status) {
  const time = status.opensAt;
  if (status.opensDay === 0) return `Yopiq · ${time} da ochiladi`;
  if (status.opensDay === 1) return `Yopiq · ertaga ${time} da`;
  return `Yopiq · ${DAY_NAMES[status.opensWeekday]} ${time} da`;
}

/**
 * Opening status for a place at the given moment, read from its OpenStreetMap
 * style opening hours. Places without published hours report `unknown`.
 */
export function getOpenStatus(place, now = new Date()) {
  const schedule = placeSchedule(place);
  if (!schedule) {
    return {
      isOpen: false,
      unknown: true,
      label: "Ish vaqti ko'rsatilmagan",
      cssClass: 'badge-unknown',
    };
  }
  const status = scheduleStatus(schedule, now);
  if (status.always) return { isOpen: true, label: '24/7 ochiq', cssClass: 'badge-open' };
  if (!status.open) {
    return {
      isOpen: false,
      label: status.opensAt === null || status.opensAt === undefined ? 'Yopiq' : opensLabel(status),
      cssClass: 'badge-closed',
    };
  }
  const { closesAt } = status;
  if (status.closesIn <= CLOSING_SOON_MINUTES) {
    return {
      isOpen: true,
      closingSoon: true,
      label: `Tez orada yopiladi (${closesAt})`,
      cssClass: 'badge-closing',
    };
  }
  return { isOpen: true, label: `Ochiq · ${closesAt} gacha`, cssClass: 'badge-open' };
}

export const CLOSING_SOON_MINUTES = 60;

export function directionsUrl(place) {
  return `https://www.google.com/maps/dir/?api=1&destination=${Number(place.lat)},${Number(place.lng)}`;
}

/** Yandex Maps is the more common navigator in Uzbekistan; this opens a driving route. */
export function yandexDirectionsUrl(place) {
  return `https://yandex.uz/maps/?rtext=~${Number(place.lat)},${Number(place.lng)}&rtt=auto`;
}

export function telegramShareUrl(url, text = '') {
  const params = new URLSearchParams({ url });
  if (text) params.set('text', text);
  return `https://t.me/share/url?${params}`;
}

export function telHref(phone) {
  return `tel:${String(phone ?? '').replace(/[^0-9+]/g, '')}`;
}

export function clockTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Only https images are rendered; anything else gets the category placeholder. */
export function safeImageUrl(url) {
  return typeof url === 'string' && url.startsWith('https://') ? url : null;
}
