/*
 * Offline support: the app shell and its build assets are cached so the page
 * (including the SOS emergency numbers, which are plain tel: links) opens
 * without a network. API responses are never cached here; the app keeps its
 * own snapshot of the last catalog it received.
 */
const CACHE = 'milliy-shell-v4';
const STATIC = ['/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/favicon.ico'];
const ASSET_RE = /\/assets\/[^"')\s]+/g;

/** Caches index.html plus every script, stylesheet and woff2 font it pulls in. */
async function precache() {
  const cache = await caches.open(CACHE);
  const page = await fetch('/index.html', { cache: 'no-cache' });
  if (!page.ok) throw new Error(`index.html: ${page.status}`);
  const html = await page.clone().text();
  const assets = new Set(html.match(ASSET_RE) ?? []);
  for (const href of [...assets].filter((a) => a.endsWith('.css'))) {
    const css = await fetch(href).then((r) => r.text());
    for (const ref of css.match(ASSET_RE) ?? []) if (ref.endsWith('.woff2')) assets.add(ref);
  }
  await cache.put('/index.html', page);
  await cache.addAll([...STATIC, ...assets]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  )
    return;

  // Navigations (/, /joy/<id>, …): network first, fall back to the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Only the plain shell is stored; /joy/<id> pages carry place-specific tags.
          if (
            url.pathname === '/' &&
            res.ok &&
            res.headers.get('content-type')?.includes('text/html')
          ) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put('/index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  // Hashed build assets: cache first, then network.
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((res) => {
          if (res.ok && url.pathname.startsWith('/assets/')) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        }),
    ),
  );
});
