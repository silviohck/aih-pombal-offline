const CACHE = "aih-pombal-offline-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./pdf-lib.min.js",
  "./fontkit.umd.min.js",
  "./jszip.min.js",
  "./pdf.min.js",
  "./pdf.worker.min.js",
  "./tesseract.min.js",
  "./worker.min.js",
  "./tesseract-core-simd-lstm.wasm.js",
  "./tesseract-core-simd-lstm.wasm",
  "./tesseract-core-relaxedsimd-lstm.js",
  "./tesseract-core-relaxedsimd-lstm.wasm.js",
  "./tesseract-core-relaxedsimd-lstm.wasm",
  "./tesseract-core-lstm.wasm.js",
  "./tesseract-core-lstm.wasm",
  "./por.traineddata.gz"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
    const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response;
  })));
});
