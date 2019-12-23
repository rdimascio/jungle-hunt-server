const Mongoose = require('mongoose')

const StatSchema = new Mongoose.Schema({
    asin: String,
    category: String,
    price: String,
    rating: Number,
    reviews: Number,
    rank: Number,
    timestamp: String
});

const Stats = (collection) => Mongoose.model(`${collection}Stats`, StatSchema, `${collection}Stats`);

module.exports = Stats
