const Mongoose = require('mongoose')

const ProductSchema = new Mongoose.Schema({
    asin: String,
    title: String,
    image: String,
    category: Mongoose.Schema.Types.Mixed,
    price: String,
    rating: Number,
    reviews: Number,
    rank: Number
});

const Products = (collection) => Mongoose.model(`${collection}Products`, ProductSchema, `${collection}Products`);

module.exports = Products
