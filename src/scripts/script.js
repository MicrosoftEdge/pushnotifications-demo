function registerServiceWorker() {
    return navigator.serviceWorker.register('service-worker.js');
}

function resetServiceWorkerAndPush() {
    return navigator.serviceWorker.getRegistration()
        .then(function(registration) {
            if (registration) {
                return registration.unregister();
            }
        })
        .then(function() {
            return registerServiceWorker().then(function(registration) {
                return registerPush();
            });
        });
}

function registerPush() {
    return navigator.serviceWorker.ready
        .then(function(registration) {
            return registration.pushManager.getSubscription().then(function(subscription) {
                if (subscription) {
                    // renew subscription if we're within 5 days of expiration
                    if (subscription.expirationTime && Date.now() > subscription.expirationTime - 432000000) {
                        return subscription.unsubscribe().then(function() {
                            return subscribePush(registration);
                        });
                    }

                    return subscription;
                }

                return subscribePush(registration);
            });
        })
        .then(function(subscription) {
            saveSubscription(subscription);
            return subscription;
        });
}

function sendMessage(sub, message) {
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
        registerServiceWorker().then(function() {
            pushBtn.removeAttribute('disabled');
            pushBtn.innerText = 'Initiate push';
            pushBtn.addEventListener('click', function(event) {
                event.preventDefault();
                registerPush().then(function(sub) {
                    sendMessage(sub, 'test');
                });
            });
        });
    } else {
        // service worker is not supported, so it won't work!
        pushBtn.innerText = 'SW & Push are Not Supported';
    }
});
