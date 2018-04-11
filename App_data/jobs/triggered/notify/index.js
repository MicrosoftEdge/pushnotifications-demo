const { Subscription } = require('../../../../db/db');
const configuredWebPush = require('../../../../configured-web-push');

const init = async () => {
    // Get all subscriptions here via `Subscription.find()
    // More info in http://mongoosejs.com/docs/api.html#find_find

    try {
        const cursor = Subscription.find().cursor();
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            try {
                console.log(doc);
                const push = await configuredWebPush.webPush.sendNotification({
                    endpoint: doc.endpoint,
                    keys: {
                        auth: doc.keys.auth,
                        p256dh: doc.keys.p256dh
                    }
                }, 'This is a test', {contentEncoding: 'aes128gcm'});
                console.log(push);
            } catch (e) {
                console.log(e);
            }
        }
    } catch (e) {
        console.log(e);
    }

    console.log('Job executed correctly');
};

init().catch(err => {
    console.error(err);
    process.exit(1);
});
