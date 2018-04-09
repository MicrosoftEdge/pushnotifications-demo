const databaseConnectionURI = process.env.DATABASE_CONNECTION_URI || 'YOUR CONNECTION STRING';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { Schema } = mongoose;

const SubscriptionSchema = new Schema({
    endpoint: {
        type: String,
        index: true
    },
    auth: { type: String },
    p256dh: { type: String }
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

const connect = async () => {
    try {
        await mongoose.connect(databaseConnectionURI);
    } catch (e) {

    }
}

connect();

module.exports = {
    Subscription
};
