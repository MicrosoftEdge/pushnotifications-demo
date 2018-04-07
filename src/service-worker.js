'use strict';

self.addEventListener('install', event => {
	self.skipWaiting();
});

self.addEventListener('activate', event => {
	event.waitUntil(clients.claim());
});

self.addEventListener('push', event => {
	event.waitUntil(
		registration.showNotification('Web Push Test', {
			body: event.data.text(),
			icon: 'push.jpg'
		})
	);
});

self.addEventListener('notificationclick', event => {
	event.notification.close();

	event.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true })
			.then(clientList => {
				for (let i = 0; i < clientList.length; i++) {
					return clientList[i].focus();
				}

				return clients.openWindow('/');
			})
	);
});
