const CACHE_NAME = 'mrinal-writes-v1';

// We just add a basic service worker to pass PWA installation requirements.
// You can expand this to cache static assets for offline support if needed.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle the fetch normally
  event.respondWith(fetch(event.request));
});
