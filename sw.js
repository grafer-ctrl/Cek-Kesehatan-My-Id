/* Service worker — Cek Kesehatan
 * Naikkan VERSION setiap kali mengubah index.html / ikon / manifest agar cache lama dibersihkan.
 * Halaman skrining & tests.json selalu diambil dari jaringan lebih dulu (selalu terbaru),
 * lalu dipakai dari cache saat offline.
 */
const VERSION = 'v2';
const SHELL = 'cek-shell-' + VERSION;
const RUNTIME = 'cek-runtime-' + VERSION;

const PRECACHE = [
  './',
  'index.html',
  'tests.json',
  'manifest.webmanifest',
  'favicon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

const OFFLINE_HTML = `<!doctype html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Sedang offline</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#f3fbff;color:#0b2a3f;text-align:center;padding:24px}
h1{font-size:20px;margin:0 0 8px}p{color:#5b7c93;line-height:1.5;margin:0 0 18px}
a{display:inline-block;background:linear-gradient(135deg,#00b4d8,#0077b6);color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:14px}</style></head>
<body><div><h1>Kamu sedang offline</h1><p>Halaman ini belum tersimpan di perangkat.<br>Sambungkan internet lalu coba lagi.</p><a href="./">Kembali ke beranda</a></div></body></html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                 // HEAD/POST dll. langsung ke jaringan
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;  // hanya file milik sendiri

  if (req.mode === 'navigate' || url.pathname.endsWith('/tests.json')) {
    event.respondWith(networkFirst(req));
  } else {
    event.respondWith(staleWhileRevalidate(req));
  }
});

async function networkFirst(req) {
  const cache = await caches.open(RUNTIME);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (_) {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') {
      return new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    return Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME);
  const hit = await caches.match(req);
  const fresh = fetch(req)
    .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
    .catch(() => null);
  return hit || (await fresh) || Response.error();
}
