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

function registerPush(appPubkey) {
    navigator.serviceWorker.register('service-worker.js');
    navigator.serviceWorker.ready.then(reg =>
        reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(appPubkey)
        })
        .then(subscription => sub = subscription.toJSON())
    );
}

/*
function registerPush(appPubkey) {
  navigator.serviceWorker.register('service-worker.js').then(r => {
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(subscription => {
        return subscription || reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(appPubkey)
        }).then(subscription => subscription);
      })
        .then(subscription => {
          sub = subscription.toJSON();
        });
    });
  });
}
*/

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
    // get application public key
    fetch('./api/key').then(function (res) {
        res.json().then(data => {
            registerPush(data.key);
        });
    });
});
