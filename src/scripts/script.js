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

    fetch('./api/subscribe', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            subscription: subscription
        })
    });
}

function registerPush(appPubkey) {
    navigator.serviceWorker.register('service-worker.js');
    navigator.serviceWorker.ready
        .then(registration => {
            return registration.pushManager.getSubscription()
                .then(subscription => {
                    if (subscription) {
                        return subscription;
                    }

                    return registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlB64ToUint8Array(appPubkey)
                    });
                })
        })
        .then(subscription => {
            saveSubscription(subscription);
        });
}

function sendMessage(message) {
    const data = {
        subscription: sub,
        payload: message
    }

    fetch('./api/notify', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

document.addEventListener('DOMContentLoaded', e => {
    if (navigator.serviceWorker) {
        // get application public key
        fetch('./api/key').then(function (res) {
            res.json().then(data => {
                registerPush(data.key);
            });
        });
    } else {
        // service worker is not supported, so it won't work!
    }
});
