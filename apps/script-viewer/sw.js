const CACHE_PREFIX = 'gombaflow-pwa-';
const CACHE_NAME = CACHE_PREFIX + '__PWA_CACHE_VERSION__';
const APP_ASSETS = [
  '/',
  '/index.html',
  '/storage.js',
  '/progress.js',
  '/pwa.js',
  '/manifest.webmanifest',
  '/app-icon-192.png',
  '/app-icon-512.png',
  '/apple-touch-icon.png',
  '/favicon-32.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)).catch(error =>
    caches.delete(CACHE_NAME).then(() => { throw error; })
  ));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name))
  )).then(() => self.clients.claim()));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE_NAME).then(cache => cache.match(event.request).then(cached => {
    if (cached) return cached;
    if (event.request.mode === 'navigate') {
      return cache.match('/index.html').then(index => index || cache.match('/')).then(index => index || fetch(event.request));
    }
    return fetch(event.request);
  })));
});
