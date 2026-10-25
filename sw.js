// Offline cache for the Unbound PWA. App shell: cache-first (hashed bundles never change). Data: never cached here
// (the app keeps its own last-known values in local storage), so stale prices are never served as if live.
const V = "unbound-pwa-v3"; // bump on every mobile release so phones drop the old app shell (0.3.0)
self.addEventListener("install", (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"])).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url); if (e.request.method !== "GET" || u.origin !== location.origin) return;
  if (e.request.mode === "navigate") { e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(V).then((x) => x.put("./index.html", c)); return r; }).catch(() => caches.match("./index.html"))); return; }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { if (r.ok) { const c = r.clone(); caches.open(V).then((x) => x.put(e.request, c)); } return r; })));
});
