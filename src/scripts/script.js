let sub;

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

function saveSubscription(subscription) {
    sub = subscription;

    return fetch('./api/subscribe', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            subscription: subscription
        })
    });
}

function getPublicKey() {
    return fetch('./api/key')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            return urlB64ToUint8Array(data.key);
        });
}

function registerPush() {
    return navigator.serviceWorker.register('service-worker.js').then(function() {
        return navigator.serviceWorker.ready
            .then(function(registration) {
                return registration.pushManager.getSubscription().then(function(subscription) {
                    if (subscription) {
                        return subscription;
                    }

                    return getPublicKey().then(function(key) {
                        return registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlB64ToUint8Array(key)
                        });
                    });
                });
            })
            .then(function(subscription) {
                return saveSubscription(subscription);
            });
    });
}

function sendMessage(message) {
    const data = {
        subscription: sub,
        payload: message
    }

    return fetch('./api/notify', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

document.addEventListener('DOMContentLoaded', function(event) {
    const pushBtn = document.getElementById('initiate-push');

    if (navigator.serviceWorker) {
        registerPush().then(function() {
            pushBtn.removeAttribute('disabled');
            pushBtn.innerText = 'Initiate Push';
            pushBtn.addEventListener('click', function(event) {
                event.preventDefault();
                sendMessage('test');
            });
        });
    } else {
        // service worker is not supported, so it won't work!
        pushBtn.innerText = 'SW & Push are Not Supported';
    }
});

function resetServiceWorker() {
    return navigator.serviceWorker.getRegistration().then(function(registration) {
        return registration.unregister().then(function() {
            return registerPush();
        });
    });
}
