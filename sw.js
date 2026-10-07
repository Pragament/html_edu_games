/* Network first keeps the games and shared puzzle data current; cached copies work offline. */
const CACHE = 'edu-games-v1';
const ASSETS = [
  "./",
  "./index.html",
  "./games.json",
  "./manifest.webmanifest",
  "./pwa.js",
  "./icons/icon-192.png",
  "./icons/icon-180.png",
  "./icons/icon-512.png",
  "./crossword/index.html",
  "./crossword/pdf.js",
  "./crossword/puzzles.json",
  "./crossword/script.js",
  "./crossword/style.css",
  "./crossword/thumbnail.svg",
  "./crossword/vendor/qrcode.js",
  "./word-search/game.js",
  "./word-search/index.html",
  "./word-search/pdf.js",
  "./word-search/pdf-options.js",
  "./word-search/style.css",
  "./word-search/thumbnail.svg",
  "./word-scramble/game.js",
  "./word-scramble/index.html",
  "./word-scramble/pdf.js",
  "./word-scramble/pdf-options.js",
  "./word-scramble/style.css",
  "./word-scramble/thumbnail.svg"
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(url => new Request(url, {cache: 'reload'})))));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('edu-games-') && key !== CACHE).map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Script version query strings share a cache entry with the precached asset.
    const cacheKey = new Request(url.origin + url.pathname);
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        try { await cache.put(cacheKey, response.clone()); } catch {}
      }
      return response;
    } catch {
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
      if (url.pathname.endsWith('/')) {
        const index = await cache.match(new URL('index.html', url).href);
        if (index) return index;
      }
      return new Response('This page is not available offline. Reconnect and try again.', {status: 503, headers: {'Content-Type': 'text/plain'}});
    }
  })());
});
