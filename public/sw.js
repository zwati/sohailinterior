const CACHE_VERSION = 'v5';
const STATIC_CACHE = `sohail-interior-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `sohail-interior-dynamic-${CACHE_VERSION}`;
const MEDIA_CACHE = `sohail-interior-media-${CACHE_VERSION}`;

const ASSETS = [
  '/',
  '/index.html',
  '/materials.html',
  '/portfolio.html',
  '/gallery.html',
  '/css/common.css',
  '/css/home.css',
  '/css/materials.css',
  '/css/portfolio.css',
  '/css/gallery.css',
  '/js/components.js',
  '/js/common.js',
  '/js/home.js',
  '/js/materials.js',
  '/js/portfolio.js',
  '/js/gallery.js',
  '/logo/SI_square.png',
  '/logo/favicon.ico',
  '/logo/full_logo_transparent.png'
];

// Install: Pre-cache static assets
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[Service Worker] Pre-caching core assets');
      return cache.addAll(ASSETS);
    })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', e => {
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE, MEDIA_CACHE];
  self.clients.claim();
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (!cacheWhitelist.includes(key)) {
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch event listener
self.addEventListener('fetch', e => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // 1. Dynamic API metadata - Network First (with cache fallback)
  if (url.pathname === '/api/categories' || url.pathname === '/api/portfolio-projects') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => cache.put(e.request, copy));
          }
          return response;
        })
        .catch(() => {
          console.log('[Service Worker] Offline fallback for API:', url.pathname);
          return caches.match(e.request);
        })
    );
    return;
  }

  // 2. Gallery / Portfolio Media items (/api/stream/:fileId) - Cache First
  if (url.pathname.startsWith('/api/stream/')) {
    // If request has a Range header (video streams), bypass cache completely
    if (e.request.headers.get('range')) {
      return;
    }

    e.respondWith(
      caches.match(e.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(e.request)
          .then(response => {
            // Only cache successful 200 OK responses (range returns 206, which we bypass)
            if (response.status === 200) {
              const contentType = response.headers.get('content-type') || '';
              // Cache image content type only
              if (contentType.startsWith('image/')) {
                const copy = response.clone();
                caches.open(MEDIA_CACHE).then(cache => cache.put(e.request, copy));
              }
            }
            return response;
          })
          .catch(err => {
            console.error('[Service Worker] Failed to fetch media stream:', err);
            // Return nothing/let it fail gracefully (which shows loading/broken image icon)
          });
      })
    );
    return;
  }

  // 3. Static Assets & Pages (Pre-cached & Dynamic) - Cache First, fallback to network
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request)
        .then(response => {
          // Dynamically cache local assets and Google Fonts
          const shouldCache = response.ok && (
            url.origin === self.location.origin ||
            url.host === 'fonts.googleapis.com' ||
            url.host === 'fonts.gstatic.com'
          );

          if (shouldCache) {
            const copy = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => cache.put(e.request, copy));
          }
          return response;
        })
        .catch(err => {
          console.error('[Service Worker] Fetch failed for:', url.pathname, err);
          // If offline and requesting an HTML page, we could redirect to index.html or return cache.match('/')
          if (e.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});
