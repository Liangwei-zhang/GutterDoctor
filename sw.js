// Service Worker for GutterDoctor - Limited caching
const CACHE_NAME = 'gutterdoctor-v3';
const urlsToCache = [
  '/',
  '/index.html'
];

// Install event - cache only essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event - network first, cache only for offline
self.addEventListener('fetch', event => {
  // Skip cross-origin requests (like fonts)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
