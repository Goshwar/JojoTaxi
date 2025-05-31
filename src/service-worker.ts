import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Take control immediately
self.skipWaiting();
clientsClaim();

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache static assets with CacheFirst strategy
registerRoute(
  ({ request }) => request.destination === 'style' ||
                   request.destination === 'script' ||
                   request.destination === 'image',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true // Clean up if storage is low
      }),
    ],
  })
);

// Cache HTML pages with NetworkFirst strategy
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
        purgeOnQuotaError: true
      }),
    ],
    networkTimeoutSeconds: 10
  })
);

// Clear old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches except the current ones
          if (!['static-assets', 'pages', 'offline'].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Offline fallback
self.addEventListener('install', (event) => {
  const offlinePage = new Request('/offline.html');
  event.waitUntil(
    fetch(offlinePage).then((response) => {
      return caches.open('offline').then((cache) => {
        return cache.put(offlinePage, response);
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});