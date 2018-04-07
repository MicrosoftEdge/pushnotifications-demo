const express = require('express');
const bodyParser = require('body-parser');

const { Subscription } = require('./db/db');

const app = express();
const port = process.env.PORT || 4000;
const public = process.env.publickey || 'PUBLIC KEY';
const private = process.env.privatekey || 'PRIVATE KEY';
const static = process.env.NODE_ENV === 'production' ? 'dist' : 'src';
const webpush = require('web-push');

webpush.setVapidDetails(
    'mailto:email@outlook.com',
    public,
    private
);

// Express configuration
app.disable('x-powered-by');

app.use(express.static(static));
app.use(bodyParser.json()); 

app.get('/api/key', (req, res) => {
    res.send({
        key: public
    });
});

app.post('/api/subscribe', async (req, res) => {
    try {
        // Find if user is already subscribed searching by `endPoint`
        const { key, userId } = req.body;
        const exists = await Subscription.findOne({ endPoint: 'endPoint' });

        if (exists) {
            // Maybe refresh the subscription info?
            res.status(400).send('Subscription already exists');

            return;
        }

        const subscription = new Subscription({
            subscription: '',
            hash: '',
            key: ''
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
        
        await webpush.sendNotification(data.subscription, data.payload, { contentEncoding: data.encoding })
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
