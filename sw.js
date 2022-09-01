const version = '20220901055409';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/tenji_website/2022/09/01/test2.html","/tenji_website/jupyter/2020/02/20/test.html","/tenji_website/markdown/2020/01/14/test-markdown-post.html","/tenji_website/about/","/tenji_website/","/tenji_website/assets/js/search-data.json","/tenji_website/search/","/tenji_website/assets/js/search.js","/tenji_website/categories/","/tenji_website/manifest.json","/tenji_website/assets/search.json","/tenji_website/assets/styles.css","/tenji_website/feed.xml","/tenji_website/sitemap.xml","/tenji_website/robots.txt","", "/tenji_website/assets/default-offline-image.png", "/tenji_website/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/tenji_website/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
