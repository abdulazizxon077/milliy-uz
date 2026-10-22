import { describe, expect, it } from 'vitest';
import {
  directionsUrl,
  distanceKm,
  escapeHtml,
  formatDistance,
  getOpenStatus,
  safeImageUrl,
  telegramShareUrl,
  telHref,
  yandexDirectionsUrl,
} from './format.js';

const at = (hh, mm = 0) => new Date(2026, 0, 1, hh, mm);

describe('escapeHtml', () => {
  it('escapes markup and quotes', () => {
    expect(escapeHtml(`<img src=x onerror="alert('1')">&`)).toBe(
      '&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot;&gt;&amp;',
    );
  });
  it('handles null and numbers', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(4.5)).toBe('4.5');
  });
});

describe('distance helpers', () => {
  it('computes great-circle distance', () => {
    const tashkent = { lat: 41.3111, lng: 69.2406 };
    const samarkand = { lat: 39.6542, lng: 66.9597 };
    expect(distanceKm(tashkent, samarkand)).toBeGreaterThan(260);
    expect(distanceKm(tashkent, samarkand)).toBeLessThan(280);
  });
  it('formats metres and kilometres', () => {
    expect(formatDistance(0.42)).toBe('420 m');
    expect(formatDistance(3.456)).toBe('3.5 km');
    expect(formatDistance(Number.NaN)).toBe('');
  });
});

describe('getOpenStatus', () => {
  // 2026-01-01 is a Thursday.
  it('treats 24/7 places as always open', () => {
    expect(getOpenStatus({ openingHours: '24/7' }, at(3)).label).toBe('24/7 ochiq');
  });
  it('reads regular hours', () => {
    const place = { openingHours: 'Mo-Fr 09:00-18:00' };
    expect(getOpenStatus(place, at(10))).toMatchObject({
      isOpen: true,
      label: 'Ochiq · 18:00 gacha',
    });
    expect(getOpenStatus(place, at(18)).isOpen).toBe(false);
    expect(getOpenStatus(place, at(8, 59)).label).toBe('Yopiq · 09:00 da ochiladi');
    expect(getOpenStatus(place, at(19)).label).toBe('Yopiq · ertaga 09:00 da');
  });
  it('names the weekday of the next opening', () => {
    expect(getOpenStatus({ openingHours: 'Mo 09:00-18:00' }, at(12)).label).toBe(
      'Yopiq · Dushanba 09:00 da',
    );
  });
  it('supports schedules past midnight', () => {
    const night = { openingHours: '18:00-02:00' };
    expect(getOpenStatus(night, at(23)).isOpen).toBe(true);
    expect(getOpenStatus(night, at(1)).isOpen).toBe(true);
    expect(getOpenStatus(night, at(12)).isOpen).toBe(false);
  });
  it('warns during the last hour before closing', () => {
    const place = { openingHours: 'Mo-Su 09:00-18:00' };
    expect(getOpenStatus(place, at(16, 59)).closingSoon).toBeUndefined();
    const soon = getOpenStatus(place, at(17));
    expect(soon).toMatchObject({ isOpen: true, closingSoon: true, cssClass: 'badge-closing' });
    expect(soon.label).toBe('Tez orada yopiladi (18:00)');
  });
  it('reports unknown hours instead of guessing', () => {
    expect(getOpenStatus({}, at(12))).toMatchObject({
      isOpen: false,
      unknown: true,
      label: "Ish vaqti ko'rsatilmagan",
    });
    expect(getOpenStatus({ openingHours: 'PH off' }, at(12)).unknown).toBe(true);
  });
});

describe('links', () => {
  it('builds safe tel and directions links', () => {
    expect(telHref('+998 (71) 200-00-00')).toBe('tel:+998712000000');
    expect(directionsUrl({ lat: '41.3', lng: 69.2 })).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=41.3,69.2',
    );
  });
  it('builds Yandex directions and Telegram share links', () => {
    expect(yandexDirectionsUrl({ lat: 41.3, lng: '69.2' })).toBe(
      'https://yandex.uz/maps/?rtext=~41.3,69.2&rtt=auto',
    );
    expect(telegramShareUrl('https://milliy.uz/joy/a-b', 'Shifo & Co')).toBe(
      'https://t.me/share/url?url=https%3A%2F%2Fmilliy.uz%2Fjoy%2Fa-b&text=Shifo+%26+Co',
    );
    expect(telegramShareUrl('https://x.uz/')).toBe(
      'https://t.me/share/url?url=https%3A%2F%2Fx.uz%2F',
    );
  });
  it('only renders https images', () => {
    expect(safeImageUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
    expect(safeImageUrl('javascript:alert(1)')).toBeNull();
    expect(safeImageUrl(undefined)).toBeNull();
  });
});
