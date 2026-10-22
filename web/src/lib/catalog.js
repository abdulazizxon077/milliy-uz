import { distanceKm, getOpenStatus } from './format.js';

export const DEFAULT_FILTERS = Object.freeze({
  category: 'all',
  region: 'all_uz',
  query: '',
  sortBy: 'distance',
  onlyOpenNow: false,
  onlyWithPhone: false,
});

const SEARCH_FIELDS = ['name', 'subCategory', 'categoryName', 'address', 'chiefSpecialist'];

/** Lower-cases and folds the apostrophe variants used in Uzbek Latin text. */
export function foldText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bb\u02bc`´]/g, "'");
}

export function matchesQuery(place, query) {
  const q = foldText(query).trim();
  if (!q) return true;
  return SEARCH_FIELDS.some((field) => foldText(place[field]).includes(q));
}

export function hasPhone(place) {
  return Boolean(String(place.phone ?? '').replace(/\D/g, ''));
}

const byName = (a, b) => a.name.localeCompare(b.name, 'uz');

/**
 * Applies the catalog filters and sort order. Pure: returns a new array.
 * Without a known location the distance sort falls back to the name.
 */
export function filterPlaces(places, filters, userLocation, now = new Date()) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const result = places.filter(
    (place) =>
      (f.category === 'all' || place.category === f.category) &&
      (f.region === 'all_uz' || place.region === f.region) &&
      matchesQuery(place, f.query) &&
      (!f.onlyOpenNow || getOpenStatus(place, now).isOpen) &&
      (!f.onlyWithPhone || hasPhone(place)),
  );

  const sorters = {
    name: byName,
    rating: (a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount || byName(a, b),
    distance: userLocation
      ? (a, b) => distanceKm(userLocation, a) - distanceKm(userLocation, b)
      : byName,
  };
  return result.sort(sorters[f.sortBy] ?? sorters.distance);
}

/**
 * Counts places per category under the current region, search and toggles,
 * ignoring the selected category so every card shows what it would return.
 */
export function countByCategory(places, filters, now = new Date()) {
  const counts = {};
  const scoped = filterPlaces(places, { ...filters, category: 'all', sortBy: 'name' }, null, now);
  for (const place of scoped) counts[place.category] = (counts[place.category] ?? 0) + 1;
  return counts;
}
