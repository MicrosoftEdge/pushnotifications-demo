const express = require('express');
const bodyParser = require('body-parser');
const webPush = require('web-push');

const { Subscription } = require('./db/db');

const app = express();
const port = process.env.PORT || 4000;

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log("You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY " +
      "environment variables. You can use the following ones:");
    console.log(webPush.generateVAPIDKeys());
} else {
    webPush.setVapidDetails(
        'mailto:email@outlook.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

const static = process.env.NODE_ENV === 'production' ? 'dist' : 'src';

// Express configuration
app.disable('x-powered-by');

app.use(express.static(static));
app.use(bodyParser.json()); 

app.get('/api/key', (req, res) => {
    if (process.env.VAPID_PUBLIC_KEY) {
        res.send({
            key: process.env.VAPID_PUBLIC_KEY
        });
    } else {
        res.status(500).send({
            key: 'VAPID KEYS ARE NOT SET'
        });
    }
});

app.post('/api/subscribe', async (req, res) => {
    try {
        // Find if user is already subscribed searching by `endpoint`
        const { key, userId } = req.body;
        const exists = await Subscription.findOne({ endpoint: 'endpoint' });

        if (exists) {
            // Maybe refresh the subscription info?
            res.status(400).send('Subscription already exists');

            return;
        }

        const subscription = new Subscription({
            endpoint: '',
            auth: '',
            p256dh: ''
        });

        await subscription.save();

        res.status(200);

    } catch (e) {
        res.status(500)
            .send(e.message);
    }
});

app.post('/api/notify', async (req, res) => {
    try {
        const data = req.body;
        
        await webPush.sendNotification(data.subscription, data.payload, { contentEncoding: data.encoding })
            .then(function (response) {
                console.log('Response: ' + JSON.stringify(response, null, 4));
                res.status(201).send(response);
            })
            .catch(function (e) {
                console.log('Error: ' + JSON.stringify(e, null, 4));
                res.status(201).send(e);
            });
    } catch (e) {
        res.status(500)
            .send(e.message);
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
