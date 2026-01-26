const CACHE_NAME = 'student-app-v2.1.1';
const ASSETS = [
    './index.html',
    './manifest.json'
];

// 安裝 Service Worker 並快取檔案
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// 攔截網路請求，若無網路則回傳快取
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});


