const CACHE = 'pm-os-v5';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete all old caches so stale files are never served
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only look in the current cache version, never stale ones
  e.respondWith(
    caches.open(CACHE).then(c => c.match(e.request)).then(cached => cached || fetch(e.request))
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'PM Daily OS', {
      body: data.body || "Time to wrap up your day. How did it go?",
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-32.png',
      tag: 'eod-reminder',
      renotify: true,
      actions: [
        { action: 'open', title: 'Open app' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: { url: '/index.html#eod' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const client of list) {
        if (client.url.includes('/index.html') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/index.html#eod');
    })
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'FIRE_EOD') {
    const { pendingCount, doneCount } = e.data;
    const body = doneCount === 0 && pendingCount === 0
      ? "No tasks logged today. Time for your EOD review."
      : pendingCount > 0
        ? `${doneCount} done, ${pendingCount} still pending. Time to wrap up!`
        : `All ${doneCount} tasks done today. Great work!`;
    self.registration.showNotification('PM Daily OS — EOD Reminder', {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-32.png',
      tag: 'eod-reminder',
      renotify: true,
      actions: [
        { action: 'open', title: 'Open EOD review' },
        { action: 'dismiss', title: 'Later' }
      ],
      data: { url: '/index.html#eod' }
    });
  }
});
