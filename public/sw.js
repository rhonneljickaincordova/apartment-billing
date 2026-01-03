// Cache version with timestamp - updated on each build
const CACHE_VERSION = 'apartment-billing-' + new Date().toISOString().split('T')[0];
const CACHE_NAME = CACHE_VERSION;

// Only cache essential static assets
const urlsToCache = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  // Skip waiting to activate new service worker immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Use network-first strategy for better freshness
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response to store in cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Claim clients immediately
  self.clients.claim();

  // Delete old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
