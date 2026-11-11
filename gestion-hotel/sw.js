/* Service worker Crescence : rend l'application installable et rapide.
   Seules les ressources du site lui-même sont mises en cache ; les appels
   Supabase (données métier) passent toujours par le réseau. */
const CACHE = 'crescence-app-v8'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['./', './index.html', './manifest.webmanifest']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return
  event.respondWith(
    caches.match(event.request).then((hit) => {
      const reseau = fetch(event.request)
        .then((res) => {
          const copie = res.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, copie))
          return res
        })
        .catch(() => hit)
      return hit || reseau
    }),
  )
})
