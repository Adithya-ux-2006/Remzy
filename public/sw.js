/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'remzy-notifications-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Remzy Reminder', body: event.data.text() };
  }

  const title = data.title || 'Remzy Reminder';
  const options = {
    body: data.body || 'Time for your remedy!',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/reminders', id: data.id },
    actions: [
      { action: 'open', title: 'Open', icon: '/logo.png' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    tag: data.tag || 'remzy-reminder',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/reminders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
