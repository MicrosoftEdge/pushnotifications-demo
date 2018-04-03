const connectionString = process.env.connectionString || 'YOUR CONNECTION STRING';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { Schema } = mongoose;

const SubscriptionSchema = new Schema({
    endPoint: {
        type: String,
        index: true
    },
    hash: { type: String },
    key: { type: String }
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

const connect = async () => {
    try {
        await mongoose.connect(connectionString);
    } catch (e) {

    }
}

connect();

module.exports = {
    Subscription
};