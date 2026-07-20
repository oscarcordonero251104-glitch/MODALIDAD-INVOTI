/* INV-OTI Service Worker — offline-first PWA */
const CACHE = 'inv-oti-v7-forzar-update';
const ASSETS = [
  '/invtec.html',
  '/manifest.json',
  '/logo-enatrel.png',
  'https://unpkg.com/vue@3/dist/vue.global.prod.js',
  'https://unpkg.com/vue-router@4/dist/vue-router.global.prod.js',
  'https://unpkg.com/dexie@3/dist/dexie.min.js',
  'https://unpkg.com/jsqr@1.4.0/dist/jsQR.js',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Network-first for navigation, cache-first for assets
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('/invtec.html')))
    );
  } else {
    e.respondWith(
      caches.match(req).then(cached => {
        return cached || fetch(req).then(res => {
          if (res.ok && (req.url.startsWith('https://'))) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy));
          }
          return res;
        }).catch(() => cached);
      })
    );
  }
});
