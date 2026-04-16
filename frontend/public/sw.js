// Self-destructing service worker.
// Previous versions had a cache-first strategy that trapped users on old builds.
// This version unregisters itself and clears all caches on activation.
// Once existing clients fetch this file, the SW is gone and /sw.js registration
// in main.tsx has been removed, so no new SW will be installed.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete every cache owned by this origin
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));

      // Unregister this service worker
      await self.registration.unregister();

      // Reload all clients so they pick up the fresh HTML with no SW interception
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        if ('navigate' in client) {
          client.navigate(client.url);
        }
      });
    })()
  );
});

// Passthrough any fetch during the transitional window
self.addEventListener('fetch', () => {});
