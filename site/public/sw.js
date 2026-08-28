const CACHE = 'recipe-source-card-site-v2';
const SHELL = ['/', '/demo/', '/privacy/', '/terms/', '/404/'];

async function cacheShell() {
  const cache = await caches.open(CACHE);
  const assets = new Set(['/icon.svg']);
  for (const path of SHELL) {
    const response = await fetch(path);
    if (!response.ok) continue;
    await cache.put(path, response.clone());
    const html = await response.text();
    for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      const value = match[1];
      if (!value) continue;
      const url = new URL(value, location.origin);
      if (url.origin === location.origin && !url.pathname.startsWith('/downloads/')) assets.add(url.pathname);
    }
  }
  await cache.addAll([...assets]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheShell());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then((cache) => cache.put(event.request, copy)));
    }
    return response;
  }).catch(async () => (await caches.match(event.request)) || (event.request.mode === 'navigate' ? caches.match('/') : undefined)));
});
