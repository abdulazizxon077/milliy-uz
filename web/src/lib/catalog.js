import { distanceKm } from './format.js';
import { getOpenStatus } from './format.js';

export const DEFAULT_FILTERS = Object.freeze({
  category: 'all',
  region: 'tashkent',
  query: '',
  sortBy: 'distance',
  onlyOpenNow: false,
  onlyGuaranteed: false,
});

const SEARCH_FIELDS = ['name', 'subCategory', 'chiefSpecialist', 'address'];

export function matchesQuery(place, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return SEARCH_FIELDS.some((field) =>
    String(place[field] ?? '')
      .toLowerCase()
      .includes(q),
  );
}

export function isGuaranteed(place) {
  return (place.features ?? []).some((f) => f.toLowerCase().includes('kafolat'));
}

/** Applies the catalog filters and sort order. Pure: returns a new array. */
export function filterPlaces(places, filters, userLocation, now = new Date()) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const result = places.filter(
    (place) =>
      (f.category === 'all' || place.category === f.category) &&
      (f.region === 'all_uz' || place.region === f.region) &&
      matchesQuery(place, f.query) &&
      (!f.onlyOpenNow || getOpenStatus(place, now).isOpen) &&
      (!f.onlyGuaranteed || isGuaranteed(place)),
  );

  const byDistance = (p) => distanceKm(userLocation, p);
  const sorters = {
    rating: (a, b) => b.rating - a.rating,
    experience: (a, b) => b.experienceYears - a.experienceYears,
    distance: (a, b) => byDistance(a) - byDistance(b),
  };
  return result.sort(sorters[f.sortBy] ?? sorters.distance);
}
