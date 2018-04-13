const databaseConnectionURI = process.env.DATABASE_CONNECTION_URI || '';

if (databaseConnectionURI === '') {
    console.error('Database connection URI not defined.');
}

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { Schema } = mongoose;

const SubscriptionSchema = new Schema({
    endpoint: { type: String, index: true },
    keys: {
        auth: { type: String },
        p256dh: { type: String }
    },
    created: {type: Date, default: Date.now }
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

const connect = async function() {
    try {
        await mongoose.connect(databaseConnectionURI);
    } catch (e) {
        console.error('Connection the database failed.');
    }
}

connect();

module.exports = {
    Subscription
};
