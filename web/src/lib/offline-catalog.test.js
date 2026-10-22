import { describe, expect, it } from 'vitest';
import { loadSnapshot, saveSnapshot } from './offline-catalog.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
  };
}

describe('offline catalog snapshot', () => {
  it('round-trips the places list with its timestamp', () => {
    const storage = memoryStorage();
    const places = [{ id: 'a', lat: 41.3, lng: 69.2, name: 'A' }];
    saveSnapshot(places, storage, 1000);
    expect(loadSnapshot(storage)).toEqual({ savedAt: 1000, places });
  });

  it('returns null when nothing was saved or data is corrupt', () => {
    const storage = memoryStorage();
    expect(loadSnapshot(storage)).toBeNull();
    storage.setItem('milliy_places_snapshot', '{oops');
    expect(loadSnapshot(storage)).toBeNull();
  });

  it('drops malformed entries', () => {
    const storage = memoryStorage();
    storage.setItem(
      'milliy_places_snapshot',
      JSON.stringify({ savedAt: 5, places: [{ id: 'ok', lat: 1, lng: 2 }, { id: 3 }, null] }),
    );
    expect(loadSnapshot(storage).places).toEqual([{ id: 'ok', lat: 1, lng: 2 }]);
  });

  it('ignores storage failures', () => {
    const broken = {
      getItem() {
        throw new Error('denied');
      },
      setItem() {
        throw new Error('quota');
      },
    };
    expect(() => saveSnapshot([], broken)).not.toThrow();
    expect(loadSnapshot(broken)).toBeNull();
  });
});
