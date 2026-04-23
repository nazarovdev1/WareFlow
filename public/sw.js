const CACHE_NAME = 'wareflow-v1';
const OFFLINE_URL = '/offline';

// Assets to cache
const ASSETS_TO_CACHE = [
  '/',
  '/mobile',
  '/mobile/sales/new',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and API calls
  if (request.method !== 'GET' || url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
            return cache.put(request, responseToCache);
          })
        );

        return response;
      }).catch(() => {
        // If fetch fails, try to return offline page
        return caches.match(OFFLINE_URL);
      });
    })
  );
});

// Message event for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      Promise.all(
        event.data.urls.map((url) => {
          return caches.open(CACHE_NAME).then((cache) => {
            return cache.add(url);
          });
        })
      )
    );
  }
});
