const CACHE_NAME = "truthlens-cache-v1";
const FILES_TO_CACHE = [
  "./", // Carica la root, ovvero /TruthLens/
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/TruthLens-192.png",
  "./icons/TruthLens-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/docx/7.1.0/docx.min.js"
];

// Installazione e caching
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Attivazione e pulizia cache vecchia
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Intercetta le richieste e serve dalla cache se disponibile
self.addEventListener("fetch", (event) => {
  // Filtra solo richieste interne al dominio
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedRes) => {
        return cachedRes || fetch(event.request);
      })
    );
  }
});
