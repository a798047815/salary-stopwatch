const CACHE_NAME = 'salary-stopwatch-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.js',
  '/game.js',
  '/style.css',
  '/manifest.json'
]

// 安装Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  )
})

// 激活Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

// 拦截请求，优先缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 有缓存就返回缓存，没有就发起网络请求
        return cachedResponse || fetch(event.request)
          .then((networkResponse) => {
            // 缓存新的请求结果
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone()
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseToCache))
            }
            return networkResponse
          })
      })
  )
})