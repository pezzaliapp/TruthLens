const CACHE_NAME = "truthlens-cache-v1";

// In GitHub Pages, se i file sono tutti nella stessa cartella, possiamo usare percorsi relativi.
const FILES_TO_CACHE = [
  "./",            // la root corrente, che corrisponde a /TruthLens/
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/TruthLens-192.png",
  "./icons/TruthLens-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/docx/7.1.0/docx.min.js"
];

// Installazione del Service Worker e caching dei file
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Attivazione e pulizia della vecchia cache
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

// Intercettazione fetch
self.addEventListener("fetch", (event) => {
  // Intercettiamo richieste allo stesso dominio
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedRes) => {
        if (cachedRes) return cachedRes;
        return fetch(event.request);
      })
    );
  }
});
