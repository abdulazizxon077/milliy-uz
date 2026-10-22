import { describe, expect, it } from 'vitest';
import { countByCategory, filterPlaces, foldText, hasPhone } from './catalog.js';

const user = { lat: 41.3, lng: 69.24 };
// 2026-01-01 is a Thursday.
const noon = new Date(2026, 0, 1, 12);
const places = [
  {
    id: 'a',
    name: 'Avtoservis',
    category: 'auto',
    region: 'tashkent',
    lat: 41.35,
    lng: 69.24,
    rating: 4.2,
    reviewsCount: 3,
    phone: '+998 71 200 00 00',
    openingHours: 'Mo-Sa 09:00-18:00',
  },
  {
    id: 'b',
    name: 'Dorixona',
    category: 'medical',
    region: 'tashkent',
    lat: 41.301,
    lng: 69.24,
    rating: 0,
    reviewsCount: 0,
    phone: '',
    openingHours: '24/7',
  },
  {
    id: 'c',
    name: "Bog'i Eram",
    category: 'parks',
    region: 'samarkand',
    lat: 39.65,
    lng: 66.96,
    rating: 4.5,
    reviewsCount: 1,
    phone: '+998 66 233 00 00',
    address: "Registon ko'chasi",
  },
];
const ids = (list) => list.map((p) => p.id);

describe('filterPlaces', () => {
  it('shows the whole country by default and sorts by distance when located', () => {
    expect(ids(filterPlaces(places, {}, user, noon))).toEqual(['b', 'a', 'c']);
    expect(ids(filterPlaces(places, { region: 'tashkent' }, user, noon))).toEqual(['b', 'a']);
  });
  it('falls back to alphabetical order without a location', () => {
    expect(ids(filterPlaces(places, {}, null, noon))).toEqual(['a', 'c', 'b']);
  });
  it('searches names and addresses, ignoring apostrophe style', () => {
    expect(ids(filterPlaces(places, { query: 'registon' }, user, noon))).toEqual(['c']);
    expect(ids(filterPlaces(places, { query: 'BOG\u2019I' }, user, noon))).toEqual(['c']);
  });
  it('applies category, open-now and phone filters', () => {
    expect(ids(filterPlaces(places, { category: 'auto' }, user, noon))).toEqual(['a']);
    // Unknown hours never count as open.
    expect(ids(filterPlaces(places, { onlyOpenNow: true }, user, noon))).toEqual(['b', 'a']);
    expect(ids(filterPlaces(places, { onlyWithPhone: true }, user, noon))).toEqual(['a', 'c']);
  });
  it('sorts by rating then review count without mutating input', () => {
    const copy = [...places];
    expect(ids(filterPlaces(places, { sortBy: 'rating' }, user, noon))).toEqual(['c', 'a', 'b']);
    expect(ids(filterPlaces(places, { sortBy: 'name' }, user, noon))).toEqual(['a', 'c', 'b']);
    expect(places).toEqual(copy);
  });
});

describe('countByCategory', () => {
  it('counts within the selected region and ignores the selected category', () => {
    expect(countByCategory(places, { region: 'tashkent', category: 'auto' }, noon)).toEqual({
      auto: 1,
      medical: 1,
    });
    expect(countByCategory(places, { region: 'samarkand' }, noon)).toEqual({ parks: 1 });
  });
  it('respects search and toggles', () => {
    expect(countByCategory(places, { query: 'dori' }, noon)).toEqual({ medical: 1 });
    expect(countByCategory(places, { onlyWithPhone: true }, noon)).toEqual({ auto: 1, parks: 1 });
  });
});

describe('helpers', () => {
  it('folds text and detects phones', () => {
    expect(foldText('O\u2018zbekiston')).toBe("o'zbekiston");
    expect(hasPhone({ phone: ' ' })).toBe(false);
    expect(hasPhone({ phone: '+998 71 000 00 00' })).toBe(true);
  });
});
