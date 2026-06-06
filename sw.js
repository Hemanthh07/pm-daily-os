const CACHE = 'pm-os-v3';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// Push notification handler
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

// Scheduled local notification via periodic sync fallback
// Main app posts a message to trigger EOD reminder
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_EOD') {
    const { time, pendingCount } = e.data;
    // Store the scheduled time
    self.eodTime = time;
  }
  if (e.data && e.data.type === 'FIRE_EOD') {
    const { pendingCount, doneCount } = e.data;
    self.registration.showNotification('PM Daily OS — EOD Reminder', {
      body: `Day wrapping up: ${doneCount} done, ${pendingCount} still pending. Time for your review.`,
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
