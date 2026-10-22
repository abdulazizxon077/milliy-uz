import { describe, expect, it } from 'vitest';
import { countByCategory, filterPlaces } from './catalog.js';

const user = { lat: 41.3, lng: 69.24 };
const noon = new Date(2026, 0, 1, 12);
const places = [
  {
    id: 'a',
    name: 'Avto Servis',
    category: 'auto',
    region: 'tashkent',
    lat: 41.35,
    lng: 69.24,
    rating: 4.2,
    experienceYears: 10,
    features: ['Kafolat 6 oy'],
    openTime: '09:00',
    closeTime: '18:00',
  },
  {
    id: 'b',
    name: 'Dorixona',
    category: 'medical',
    region: 'tashkent',
    lat: 41.301,
    lng: 69.24,
    rating: 4.9,
    experienceYears: 3,
    features: [],
    is247: true,
  },
  {
    id: 'c',
    name: 'Osh Markazi',
    category: 'food',
    region: 'samarkand',
    lat: 39.65,
    lng: 66.96,
    rating: 4.5,
    experienceYears: 25,
    features: [],
    openTime: '06:00',
    closeTime: '11:00',
    chiefSpecialist: 'Oshpaz Karim',
  },
];
const ids = (list) => list.map((p) => p.id);

describe('filterPlaces', () => {
  it('filters by region and sorts by distance by default', () => {
    expect(ids(filterPlaces(places, { region: 'tashkent' }, user, noon))).toEqual(['b', 'a']);
  });
  it('searches across the whole country', () => {
    expect(ids(filterPlaces(places, { region: 'all_uz', query: 'karim' }, user, noon))).toEqual([
      'c',
    ]);
  });
  it('applies category, open-now and guarantee filters', () => {
    expect(ids(filterPlaces(places, { region: 'all_uz', category: 'auto' }, user, noon))).toEqual([
      'a',
    ]);
    expect(ids(filterPlaces(places, { region: 'all_uz', onlyOpenNow: true }, user, noon))).toEqual([
      'b',
      'a',
    ]);
    expect(
      ids(filterPlaces(places, { region: 'all_uz', onlyGuaranteed: true }, user, noon)),
    ).toEqual(['a']);
  });
  it('sorts by rating and experience without mutating input', () => {
    const copy = [...places];
    expect(ids(filterPlaces(places, { region: 'all_uz', sortBy: 'rating' }, user, noon))).toEqual([
      'b',
      'c',
      'a',
    ]);
    expect(
      ids(filterPlaces(places, { region: 'all_uz', sortBy: 'experience' }, user, noon)),
    ).toEqual(['c', 'a', 'b']);
    expect(places).toEqual(copy);
  });
});

describe('countByCategory', () => {
  it('counts within the selected region and ignores the selected category', () => {
    expect(countByCategory(places, { region: 'tashkent', category: 'auto' }, noon)).toEqual({
      auto: 1,
      medical: 1,
    });
    expect(countByCategory(places, { region: 'samarkand' }, noon)).toEqual({ food: 1 });
  });

  it('respects search and toggles', () => {
    expect(countByCategory(places, { region: 'all_uz', query: 'dori' }, noon)).toEqual({
      medical: 1,
    });
    expect(countByCategory(places, { region: 'tashkent', onlyGuaranteed: true }, noon)).toEqual({
      auto: 1,
    });
  });
});
