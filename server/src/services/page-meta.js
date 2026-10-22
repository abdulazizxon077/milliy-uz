const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeAttr = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ESCAPES[ch]);

const SITE = 'MILLIY.UZ';

function setMeta(html, attr, key, value) {
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(value)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

/** One-line summary used for the description and link previews. */
export function placeSummary(place) {
  const parts = [place.categoryName, place.address, place.phone].filter(Boolean);
  const rating = place.reviewsCount > 0 ? `★ ${Number(place.rating).toFixed(1)}` : null;
  return [...parts, rating].filter(Boolean).join(' · ').slice(0, 300);
}

/**
 * Fills the page title and preview tags for a single place, so links shared
 * in Telegram and similar apps show the place instead of the generic home page.
 */
export function renderPlacePage(html, place) {
  const title = `${place.name} — ${SITE}`;
  const description = placeSummary(place);
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`);
  out = out.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${escapeAttr(description)}$2`,
  );
  out = setMeta(out, 'property', 'og:title', place.name);
  out = setMeta(out, 'property', 'og:description', description);
  if (typeof place.image === 'string' && place.image.startsWith('https://')) {
    out = setMeta(out, 'property', 'og:image', place.image);
  }
  return out;
}

/** Title and description for one of the standalone site pages (or the 404 page). */
export function renderSitePage(html, { title, description, noindex = false }) {
  const fullTitle = `${title} — ${SITE}`;
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(fullTitle)}</title>`);
  if (description) {
    out = out.replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${escapeAttr(description)}$2`,
    );
    out = setMeta(out, 'property', 'og:description', description);
  }
  out = setMeta(out, 'property', 'og:title', fullTitle);
  if (noindex) out = setMeta(out, 'name', 'robots', 'noindex, nofollow');
  return out;
}
