import { DEFAULT_FILTERS } from './lib/catalog.js';
import { loadBookmarks } from './lib/bookmarks.js';

export const state = {
  places: [],
  filters: { ...DEFAULT_FILTERS },
  /** Set once the browser shares a position; distances stay hidden until then. */
  userLocation: null,
  /** How many catalog cards are rendered; grows with "show more". */
  visibleCount: 24,
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
