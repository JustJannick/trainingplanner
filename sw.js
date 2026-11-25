// justTrain service worker: makes the app installable and usable offline.
// Bump VERSION on every release so installed apps notice the update and show "Update now".
const VERSION = '2026-11-25.1';
const SHELL = 'tp-shell-' + VERSION;
const MEDIA = 'tp-media-1';
const FONTS = 'tp-fonts-1';
const FILES = ['./', 'index.html', 'fb.js', 'config.js', 'manifest.webmanifest', 'lib/ex.json',
  'img/bg.webp', 'icons/jt2-192.png', 'icons/jt2-512.png', 'icons/jt2-apple-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES.map(u => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('tp-shell-') && k !== SHELL).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });

async function cacheFirst(name, req) {
  const c = await caches.open(name);
  const hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') c.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === location.origin && u.pathname.includes('/lib/c/')) { e.respondWith(cacheFirst(MEDIA, req)); return; }
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') { e.respondWith(cacheFirst(FONTS, req)); return; }
  if (u.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(caches.open(SHELL).then(c => c.match('index.html')).then(hit => hit || fetch(req)));
    return;
  }
  e.respondWith(caches.open(SHELL).then(c => c.match(req, { ignoreSearch: true })).then(hit => hit || fetch(req)));
});
