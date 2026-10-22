const STORAGE_KEY = 'milliy_places_snapshot';

/** Remembers the last catalog the server returned so the app still works offline. */
export function saveSnapshot(places, storage = globalThis.localStorage, now = Date.now()) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify({ savedAt: now, places }));
  } catch {
    // Quota exceeded or storage disabled: offline fallback just won't be available.
  }
}

export function loadSnapshot(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) ?? 'null');
    if (!parsed || !Array.isArray(parsed.places)) return null;
    const places = parsed.places.filter(
      (p) => p && typeof p.id === 'string' && Number.isFinite(p.lat) && Number.isFinite(p.lng),
    );
    return { savedAt: Number(parsed.savedAt) || 0, places };
  } catch {
    return null;
  }
}
