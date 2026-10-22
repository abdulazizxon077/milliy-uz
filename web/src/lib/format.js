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

function toMinutes(value, fallback) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? '');
  if (!match) return fallback;
  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * Opening status for a place at the given moment. Handles 24/7 places,
 * a 24:00 closing time and schedules that run past midnight (e.g. 18:00–02:00).
 */
export function getOpenStatus(place, now = new Date()) {
  if (place.is247) return { isOpen: true, label: '24/7 Ochiq', cssClass: 'badge-open' };

  const openTime = place.openTime || '08:00';
  const closeTime = place.closeTime || '22:00';
  const open = toMinutes(openTime, 8 * 60);
  const close = toMinutes(closeTime, 22 * 60);
  const current = now.getHours() * 60 + now.getMinutes();

  const isOpen =
    open === close
      ? true
      : open < close
        ? current >= open && current < close
        : current >= open || current < close;

  if (!isOpen) {
    return { isOpen: false, label: `Yopiq (${openTime} da ochiladi)`, cssClass: 'badge-closed' };
  }
  const minutesLeft = open === close ? Infinity : (close - current + 24 * 60) % (24 * 60);
  if (minutesLeft <= CLOSING_SOON_MINUTES) {
    return {
      isOpen: true,
      closingSoon: true,
      label: `Tez orada yopiladi (${closeTime})`,
      cssClass: 'badge-closing',
    };
  }
  return { isOpen: true, label: `Ochiq (${closeTime} gacha)`, cssClass: 'badge-open' };
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

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

export const PLACEHOLDER_IMAGE = '/place-placeholder.svg';

/** Only https images are rendered; anything else falls back to a neutral photo. */
export function safeImageUrl(url) {
  return typeof url === 'string' && url.startsWith('https://') ? url : FALLBACK_IMAGE;
}
