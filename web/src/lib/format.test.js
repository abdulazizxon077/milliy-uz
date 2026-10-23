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
  it('treats 24/7 places as always open', () => {
    expect(getOpenStatus({ is247: true }, at(3)).label).toBe('24/7 Ochiq');
  });
  it('uses regular hours', () => {
    const place = { openTime: '09:00', closeTime: '18:00' };
    expect(getOpenStatus(place, at(10)).isOpen).toBe(true);
    expect(getOpenStatus(place, at(18)).isOpen).toBe(false);
    expect(getOpenStatus(place, at(8, 59)).label).toBe('Yopiq (09:00 da ochiladi)');
  });
  it('supports schedules past midnight and 24:00', () => {
    const night = { openTime: '18:00', closeTime: '02:00' };
    expect(getOpenStatus(night, at(23)).isOpen).toBe(true);
    expect(getOpenStatus(night, at(1)).isOpen).toBe(true);
    expect(getOpenStatus(night, at(12)).isOpen).toBe(false);
    expect(getOpenStatus({ openTime: '08:00', closeTime: '24:00' }, at(23, 59)).isOpen).toBe(true);
  });
  it('warns during the last hour before closing', () => {
    const place = { openTime: '09:00', closeTime: '18:00' };
    expect(getOpenStatus(place, at(16, 59)).closingSoon).toBeUndefined();
    const soon = getOpenStatus(place, at(17));
    expect(soon).toMatchObject({ isOpen: true, closingSoon: true, cssClass: 'badge-closing' });
    expect(soon.label).toBe('Tez orada yopiladi (18:00)');
    expect(getOpenStatus(place, at(17, 59)).closingSoon).toBe(true);
  });
  it('handles closing soon across midnight', () => {
    const night = { openTime: '18:00', closeTime: '00:30' };
    expect(getOpenStatus(night, at(23, 45)).closingSoon).toBe(true);
    expect(getOpenStatus(night, at(22)).closingSoon).toBeUndefined();
    expect(getOpenStatus({ openTime: '08:00', closeTime: '24:00' }, at(23, 30)).closingSoon).toBe(
      true,
    );
  });
  it('never marks 24/7 or same open/close schedules as closing', () => {
    expect(getOpenStatus({ is247: true }, at(23, 59)).closingSoon).toBeUndefined();
    expect(getOpenStatus({ openTime: '00:00', closeTime: '00:00' }, at(23, 59)).closingSoon).toBe(
      undefined,
    );
  });
  it('falls back to 08:00–22:00', () => {
    expect(getOpenStatus({}, at(7)).isOpen).toBe(false);
    expect(getOpenStatus({}, at(21)).isOpen).toBe(true);
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
    expect(safeImageUrl('javascript:alert(1)')).toMatch(/^https:\/\/images\.unsplash\.com/);
  });
});
