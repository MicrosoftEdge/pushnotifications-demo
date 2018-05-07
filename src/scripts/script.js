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

function subscribePushAndUpdateButtons(registration) {
    return subscribePush(registration).then(function(subscription) {
        updateUnsubscribeButtons();
        return subscription;
    });
}

function registerPush() {
    return navigator.serviceWorker.ready
        .then(function(registration) {
            return registration.pushManager.getSubscription().then(function(subscription) {
                if (subscription) {
                    // renew subscription if we're within 5 days of expiration
                    if (subscription.expirationTime && Date.now() > subscription.expirationTime - 432000000) {
                        return unsubscribePush().then(function() {
                            updateUnsubscribeButtons();
                            return subscribePushAndUpdateButtons(registration);
                        });
                    }

                    return subscription;
                }

                return subscribePushAndUpdateButtons(registration);
            });
        })
        .then(function(subscription) {
            saveSubscription(subscription);
            return subscription;
        });
}

function sendMessage(sub, title, message, delay) {
    const data = {
        subscription: sub,
        payload: JSON.stringify({
            title: title,
            message: message
        })
    }

    if (delay) {
        data.delay = delay;
    }

    return fetch('./api/notify', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

function getPushSubscription() {
    return navigator.serviceWorker.ready
        .then(function(registration) {
            return registration.pushManager.getSubscription();
        });
}

function unsubscribePush() {
    return getPushSubscription().then(function(subscription) {
        return subscription.unsubscribe().then(function() {
            deleteSubscription(subscription);
        });
    });
}

function updateUnsubscribeButtons() {
    const unsubBtn = document.getElementById('unsubscribe-push');
    const unsubBtn2 = document.getElementById('unsubscribe-push-2');

    if (!(navigator.serviceWorker && 'PushManager' in window)) {
        // service worker is not supported, so it won't work!
        unsubBtn.innerText = 'SW & Push are Not Supported';
        unsubBtn2.innerText = 'SW & Push are Not Supported';
        return;
    }

    const fn = function(event) {
        event.preventDefault();
        unsubscribePush().then(function() {
            updateUnsubscribeButtons();
        });
    };

    return getPushSubscription()
        .then(function(subscription) {
            if (subscription) {
                unsubBtn.removeAttribute('disabled');
                unsubBtn.innerText = 'Unsubscribe from push';
                unsubBtn2.removeAttribute('disabled');
                unsubBtn2.innerText = 'Unsubscribe from push';

                unsubBtn.addEventListener('click', fn);
                unsubBtn2.addEventListener('click', fn);
            } else {
                unsubBtn.setAttribute('disabled', 'disabled');
                unsubBtn.innerText = 'Not subscribed';
                unsubBtn2.setAttribute('disabled', 'disabled');
                unsubBtn2.innerText = 'Not subscribed';

                unsubBtn.removeEventListener('click', fn);
                unsubBtn2.removeEventListener('click', fn);
            }
        });
}

document.addEventListener('DOMContentLoaded', function(event) {
    const pushBtn = document.getElementById('initiate-push');
    const pushBtn2 = document.getElementById('initiate-push-2');

    if (!(navigator.serviceWorker && 'PushManager' in window)) {
        // service worker is not supported, so it won't work!
        pushBtn.innerText = 'SW & Push are Not Supported';
        pushBtn2.innerText = 'SW & Push are Not Supported';
        return;
    }

    registerServiceWorker().then(function() {
        pushBtn.removeAttribute('disabled');
        pushBtn2.removeAttribute('disabled');
        pushBtn.innerText = 'Initiate push';
        pushBtn2.innerText = 'Initiate push';
        pushBtn.addEventListener('click', function(event) {
            event.preventDefault();
            registerPush().then(function(sub) {
                sendMessage(sub, 'Interested in how to do this?',
                    'Click on this notification to get back to the tutorial to learn how to do this!', 5000);
            });
        });
        pushBtn2.addEventListener('click', function(event) {
            event.preventDefault();
            registerPush().then(function(sub) {
                sendMessage(sub, 'Cool!', 'It works!');
            });
        });
        updateUnsubscribeButtons();
    });
});
