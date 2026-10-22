import { DEFAULT_FILTERS } from './lib/catalog.js';
import { loadBookmarks } from './lib/bookmarks.js';
import { REGIONS } from '../../shared/catalog.js';

const tashkent = REGIONS.find((r) => r.id === 'tashkent').center;

export const state = {
  places: [],
  filters: { ...DEFAULT_FILTERS },
  userLocation: { ...tashkent, address: 'Toshkent shahri markazi' },
  bookmarks: loadBookmarks(),
  serverChat: true,
};

const listeners = new Set();

/** Subscribers re-render when the catalog data, filters or location change. */
export function onChange(fn) {
  listeners.add(fn);
}

export function notify() {
  for (const fn of listeners) fn(state);
}

export function findPlace(id) {
  return state.places.find((p) => p.id === id);
}

export function upsertPlace(place) {
  const i = state.places.findIndex((p) => p.id === place.id);
  if (i === -1) state.places.push(place);
  else state.places[i] = place;
}
