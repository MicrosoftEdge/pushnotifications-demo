'use strict';

self.addEventListener('install', function(event) {
	self.skipWaiting();
});

self.addEventListener('activate', function(event) {
	event.waitUntil(clients.claim());
});

self.addEventListener('push', function(event) {
	event.waitUntil(
		registration.showNotification('Web Push Test', {
			body: event.data.text(),
			icon: 'push.jpg'
		})
	);
});

self.addEventListener('notificationclick', function(event) {
	event.notification.close();

	event.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true })
			.then(function(clientList) {
				for (let i = 0; i < clientList.length; i++) {
					return clientList[i].focus();
				}

				return clients.openWindow('/');
			})
	);
});
