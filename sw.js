/* KDN Fitness service worker.
   - Photos and other files in /assets are saved on the phone after the first view (fast, works offline).
   - The page itself is always fetched fresh when online; the saved copy is used only when offline or very slow.
   - /api and /admin are never cached.
   - Shows medicine and period reminders. */
var V = 'kdn-v3';
var KEEP = [V, 'kdn-img', 'kdn-fonts'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(['/', '/kdn-live.js']); }).catch(function () {}));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return KEEP.indexOf(k) < 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function cacheFirst(req, name) {
  return caches.open(name).then(function (c) {
    return c.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
        return res;
      });
    });
  });
}
function networkFirst(req) {
  return caches.open(V).then(function (c) {
    var timer;
    var net = fetch(req).then(function (res) {
      clearTimeout(timer);
      if (res && res.ok) c.put(req, res.clone());
      return res;
    });
    var slow = new Promise(function (resolve) {
      timer = setTimeout(function () { c.match(req, { ignoreSearch: true }).then(function (hit) { if (hit) resolve(hit); }); }, 4000);
    });
    return Promise.race([net, slow]).catch(function () {
      return c.match(req, { ignoreSearch: true }).then(function (hit) { return hit || c.match('/'); });
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  var url = new URL(req.url);
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') { e.respondWith(cacheFirst(req, 'kdn-fonts')); return; }
  if (url.origin !== self.location.origin) return;
  var p = url.pathname;
  if (p.indexOf('/api/') === 0 || p.indexOf('/admin') === 0 || p === '/sw.js') return;
  if (p.indexOf('/assets/img/') === 0) { e.respondWith(cacheFirst(req, 'kdn-img')); return; }
  if (/\.mp4$/.test(p)) return;
  if (p.indexOf('/assets/') === 0) { e.respondWith(cacheFirst(req, V)); return; }
  if (req.mode === 'navigate' || p === '/' || p === '/index.html' || p === '/kdn-live.js') { e.respondWith(networkFirst(req)); return; }
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) { if ('focus' in list[i]) return list[i].focus(); }
    return self.clients.openWindow('/');
  }));
});
