// Service Worker for Birthday Website PWA

const CACHE_NAME = 'birthday-app-v1';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    'https://fonts.googleapis.com/css?family=Love+Light',
    'https://fonts.googleapis.com/css?family=Russo+One',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Cache installation failed:', error);
            })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
            .catch(error => {
                console.error('Fetch failed:', error);
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});