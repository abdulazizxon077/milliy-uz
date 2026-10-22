import { normalizePath, SITE_PAGES } from '../../../shared/site.js';

const ID = /^[a-z0-9][a-z0-9-]{0,79}$/;
const PLACE_PATH = /^\/joy\/([^/]+)\/?$/;

export const placePath = (id) => `/joy/${encodeURIComponent(id)}`;

export const placeUrl = (id, origin = location.origin) => `${origin}${placePath(id)}`;

/**
 * Reads the place id from the current address. `/joy/<id>` is the canonical
 * form; `#<id>` is still accepted for links shared by older versions.
 * Other kinds: `page` (about, contact, privacy), `admin`, `missing` and `home`.
 */
export function parsePlaceRoute({ pathname, hash = '' }) {
  const match = PLACE_PATH.exec(pathname);
  if (match) {
    let id = match[1];
    try {
      id = decodeURIComponent(id);
    } catch {
      return { kind: 'place', id: null };
    }
    return { kind: 'place', id: ID.test(id) ? id : null };
  }
  const path = normalizePath(pathname);
  if (path === '/admin') return { kind: 'admin', id: null };
  if (SITE_PAGES[path]) return { kind: 'page', id: path.slice(1) };
  if (path !== '/') return { kind: 'missing', id: null };
  const legacy = hash.replace(/^#/, '');
  if (legacy && ID.test(legacy) && !legacy.endsWith('-section')) {
    return { kind: 'legacy', id: legacy };
  }
  return { kind: 'home', id: null };
}
