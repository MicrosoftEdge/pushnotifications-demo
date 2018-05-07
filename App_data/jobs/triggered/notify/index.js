const { Subscription } = require('../../../../db/db');
const configuredWebPush = require('../../../../configured-web-push');
const fs = require('fs');
const util = require('util');

const init = async function() {
    // Get all subscriptions here via `Subscription.find()
    // More info in http://mongoosejs.com/docs/api.html#find_find

    const readFile = util.promisify(fs.readFile);
    let pushMessage = "Come visit us again. We miss you!";

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);

    try {
        const triviaFileContents = await readFile('trivia.json');
        const trivia = JSON.parse(triviaFileContents).trivia;
        pushMessage = trivia[day % trivia.length];
    } catch (e) {
        console.error(e);
    }

    const pushPayload = JSON.stringify({
        title: 'Did you know?',
        message: pushMessage
    });

    try {
        const cursor = Subscription.find().cursor();
        await cursor.eachAsync(function(sub) {
            return configuredWebPush.webPush.sendNotification({
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.keys.auth,
                    p256dh: sub.keys.p256dh
                }
            }, pushPayload, {contentEncoding: 'aes128gcm'})
            .then(function(push) {
                console.log(push);
            })
            .catch(function(e) {
                // 404 for FCM AES128GCM
                if (e.statusCode === 410 || e.statusCode === 404) {
                    // delete invalid registration
                   return Subscription.remove({endpoint: sub.endpoint}).exec()
                        .then(function(sub) {
                            console.log('Deleted: ' + sub.endpoint);
                        })
                        .catch(function(sub) {
                            console.error('Failed to delete: ' + sub.endpoint);
                        });
                }
            });
        });
    } catch (e) {
        console.log(e);
    }

    console.log('Job executed correctly');
};

init().catch(function(err) {
    console.error(err);
    process.exit(1);
});
