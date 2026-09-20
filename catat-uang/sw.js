/**
 * sw.js — Service Worker CatatUang
 * Strategi: Cache-First untuk semua asset lokal.
 * CDN di-cache runtime saat pertama kali diakses.
 */

const CACHE_NAME = 'catatuang-v11';

const CDN_ORIGINS = [
  'cdn.tailwindcss.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
];

// ─── INSTALL ────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing v11...');
  self.skipWaiting();
});

// ─── ACTIVATE ───────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating v11...');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); })
      ))
      .then(() => { console.log('[SW] Activated.'); return self.clients.claim(); })
  );
});

// ─── FETCH ──────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  console.log('[SW] Fetch intercepted:', url.pathname);
  event.respondWith(cacheFirst(request));
});

// Cache-First: cek cache dulu, kalau miss fetch + simpan ke cache
async function cacheFirst(request) {
  const cache  = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    console.log('[SW] Serving from cache:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      console.log('[SW] Caching:', request.url);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    console.log('[SW] Offline, no cache for:', request.url);
    const fallback = await cache.match('/index.html')
      || await cache.match(new Request('/index.html'));
    if (fallback) return fallback;
    return new Response('<h1>Offline</h1>', {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

// Handle skip waiting dari client
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
