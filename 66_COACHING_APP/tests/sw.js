/**
 * Felix Coaching Hub – Service Worker v0.2
 * Cacht die App-Shell für Offline-Nutzung.
 * Strategie: Cache First, dann Netzwerk.
 */

const CACHE = 'felix-coaching-v0_2';

const PRECACHE = [
  './coaching-hub-v0_2-test.html',
  './manifest.json',
  './icon.svg'
];

// Installation: Ressourcen cachen
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Aktivierung: alten Cache aufräumen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: Cache First
self.addEventListener('fetch', event => {
  // Nur GET-Requests cachen
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request)
        .then(response => {
          // Neue Ressourcen in Cache schreiben
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(c => c.put(event.request, clone));
          }
          return response;
        })
      )
  );
});
