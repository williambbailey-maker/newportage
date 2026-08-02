// Newportage service worker — caches the app shell so it opens offline.
// Bumped whenever cached assets change (e.g. the app icons) — `activate` drops
// every cache that isn't this one, so clients pick up the new files.
const CACHE = "newportage-v4";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((hit) => {
        const net = fetch(req)
          .then((res) => {
            if (res && res.status === 200 && req.url.startsWith(self.location.origin)) {
              cache.put(req, res.clone());
            }
            return res;
          })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});
