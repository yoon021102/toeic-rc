// 오프라인 캐시. 콘텐츠를 바꾸면 VERSION 숫자를 올려주세요.
const VERSION = "v1";
const FILES = ["./", "index.html", "styles.css", "app.js", "manifest.webmanifest",
  "data/grammar.js", "data/vocab.js", "data/tips.js",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // 네트워크 우선, 실패하면 캐시 (콘텐츠 업데이트가 바로 반영되도록)
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
