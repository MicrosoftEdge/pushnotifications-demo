const express = require('express');
const bodyParser = require('body-parser');
const configuredWebPush = require('./configured-web-push');

const { Subscription } = require('./db/db');

const app = express();
const port = process.env.PORT || 4000;

const static = process.env.NODE_ENV === 'production' ? 'dist' : 'src';

// Express configuration
app.disable('x-powered-by');

app.use(express.static(static));
app.use(bodyParser.json());

app.get('/api/key', function(req, res) {
    if (configuredWebPush.vapidPublicKey !== '') {
        res.send({
            key: configuredWebPush.vapidPublicKey
        });
    } else {
        res.status(500).send({
            key: 'VAPID KEYS ARE NOT SET'
        });
    }
});

app.post('/api/subscribe', async function(req, res) {
    try {
        const subscription = req.body.subscription;

        // Find if user is already subscribed searching by `endpoint`
        const exists = await Subscription.findOne({ endpoint: subscription.endpoint });

        if (exists) {
            // Maybe refresh the subscription info?
            res.status(400).send('Subscription already exists');

            return;
        }

        const sub = new Subscription(subscription);

        await sub.save();

        res.status(200).send('Success');

    } catch (e) {
        res.status(500)
            .send(e.message);
    }
});

app.post('/api/notify', async function(req, res) {
    try {
        const data = req.body;
        
        await configuredWebPush.webPush.sendNotification(data.subscription, data.payload, { contentEncoding: data.encoding })
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

app.listen(port, function() {
    console.log(`Server listening on port ${port}`);
});
