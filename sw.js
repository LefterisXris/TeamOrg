self.addEventListener('install', function (event) {
    console.log('The service worker is being installed...');
    event.waitUntil(
        caches.open('team-org').then(function(cache) {
            return cache.addAll([
                '/index.html',
                '/manifest.json',
                /* Javascript */
                '/js/main.js',
                /* CSS */
                '/css/main.css',
                'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
                /* Fonts */
                /* Images */
            ]);
        })
    );
});

self.addEventListener('fetch', function (event) {
    console.log('The service worker is serving the asset.');
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || caches.match('/index.html');
        })
    );
});
