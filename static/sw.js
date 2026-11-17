const CACHE_NAME = 'slg-areca-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/static/css/styles.css?v=2.1',
  '/static/js/app.js?v=2.1',
  '/static/assets/images/brand_logo.png',
  '/static/assets/images/leaf_emblem.png',
  '/static/assets/images/ganesha.png',
  '/static/assets/images/icon-192.png',
  '/static/assets/images/icon-512.png',
  '/static/assets/images/badge_eco_friendly.png',
  '/static/assets/images/badge_100_natural.png',
  '/static/assets/images/badge_chemical_free.png',
  '/static/assets/images/badge_durable.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always Network First so users immediately see updates
  event.respondWith(
    fetch(event.request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200 && event.request.method === 'GET' && !event.request.url.includes('chrome-extension')) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkRes;
      })
      .catch(() => caches.match(event.request))
  );
});
