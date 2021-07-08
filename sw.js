self.addEventListener('install', function (event) {
    console.log('The service worker is being installed...');
    event.waitUntil(
        caches.open('team-org').then(function(cache) {
            return cache.addAll([
                '/index.html',
                '/manifest.json',
                /* Javascript */
                '/js/main.js',
                '/js/modal.js',
                /* CSS */
                '/css/main.css',
                '/css/modal.css',
                /* Fonts */
                /* Images */
               '/img/teamorg.ico',
               '/img/teamorg.png',
               '/img/user.svg',
               '/img/user-artist.svg',
               '/img/user-boss.svg',
               '/img/user-female-1.svg',
               '/img/user-female-2.svg',
               '/img/user-female-3.svg',
               '/img/user-male-1.svg',
               '/img/user-male-2.svg',
               '/img/user-male-3.svg',
               '/img/user-male-4.svg',
               '/img/user-male-5.svg',
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
