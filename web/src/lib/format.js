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
  if (!from || !to) return 0;
  const fromLat = Number(from.lat);
  const fromLng = Number(from.lng);
  const toLat = Number(to.lat);
  const toLng = Number(to.lng);
  if (!Number.isFinite(fromLat) || !Number.isFinite(toLat)) return 0;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km, lang = 'uz') {
  if (!Number.isFinite(km)) return '';
  const unitM = lang === 'ru' ? 'м' : 'm';
  const unitKm = lang === 'ru' ? 'км' : 'km';
  if (km < 1) return `${Math.round(km * 1000)} ${unitM}`;
  return `${km.toFixed(1)} ${unitKm}`;
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
export function getOpenStatus(place, now = new Date(), lang = 'uz') {
  const is247 = Boolean(place?.is247);
  if (is247) {
    const label = lang === 'ru' ? '24/7 Открыто' : lang === 'en' ? 'Open 24/7' : '24/7 Ochiq';
    return { isOpen: true, label, cssClass: 'badge-open' };
  }

  const openTime = place?.openTime || '08:00';
  const closeTime = place?.closeTime || '22:00';
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
    let label = `Yopiq (${openTime} da ochiladi)`;
    if (lang === 'ru') label = `Закрыто (откроется в ${openTime})`;
    else if (lang === 'en') label = `Closed (opens at ${openTime})`;
    return { isOpen: false, label, cssClass: 'badge-closed' };
  }

  const minutesLeft = open === close ? Infinity : (close - current + 24 * 60) % (24 * 60);
  if (minutesLeft <= CLOSING_SOON_MINUTES) {
    let label = `Tez orada yopiladi (${closeTime})`;
    if (lang === 'ru') label = `Скоро закроется (${closeTime})`;
    else if (lang === 'en') label = `Closing soon (${closeTime})`;
    return {
      isOpen: true,
      closingSoon: true,
      label,
      cssClass: 'badge-closing',
    };
  }

  let label = `Ochiq (${closeTime} gacha)`;
  if (lang === 'ru') label = `Открыто (до ${closeTime})`;
  else if (lang === 'en') label = `Open (until ${closeTime})`;
  return { isOpen: true, label, cssClass: 'badge-open' };
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

/** Safe image URL renderer supporting HTTPS and local relative paths. */
export function safeImageUrl(url) {
  if (typeof url !== 'string' || !url) return FALLBACK_IMAGE;
  if (url.startsWith('https://') || url.startsWith('/') || url.startsWith('./')) return url;
  return FALLBACK_IMAGE;
}

/** Returns a localized projection of the place object based on active language. */
export function getLocalizedPlace(place, lang = 'uz') {
  if (!place) return place;
  if (lang === 'uz') return place;
  return {
    ...place,
    name: place[`name_${lang}`] || place.name,
    subCategory: place[`subCategory_${lang}`] || place.subCategory,
    address: place[`address_${lang}`] || place.address,
    landmark: place[`landmark_${lang}`] || place.landmark,
    workDays: place[`workDays_${lang}`] || place.workDays,
    experienceText: place[`experienceText_${lang}`] || place.experienceText,
    chiefSpecialist: place[`chiefSpecialist_${lang}`] || place.chiefSpecialist,
    features: place[`features_${lang}`] || place.features,
    pricingDetails: place[`pricingDetails_${lang}`] || place.pricingDetails,
  };
}
