const filesToCache = ['./', '404.html', 'index.html', 'index.js', 'style.css'];

const staticCacheName = 'cached-pages-v2';

self.addEventListener('install', (e) => {
	//begin installing service worker and cache assets
	e.waitUntil(
		caches.open(staticCacheName).then((cache) => {
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener('activate', (e) => {
	const cacheWhiteList = [staticCacheName];

	e.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheWhiteList.indexOf(cacheName) === -1) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});

self.addEventListener('fetch', (e) => {
	console.log('Fetch event for ', e.request.url);
	e.respondWith(
		caches
			.match(e.request)
			.then((response) => {
				if (response) {
					return response;
				}

				return fetch(e.request).then((response) => {
					return caches.open(staticCacheName).then((cache) => {
						cache.put(e.request.url, response.clone());
						return response;
					});
				});
			})
			.catch((error) => {
				console.error(
					'Encountered error while installing service worker',
					error
				);
			})
	);
});
