const Product = require('./models/Product')
const Stat = require('./models/Stat')

const Resolvers = {
  Query: {
    Products: (_, { asin, collection = "bestSeller" }, context) => {
        const params = {}
        if (asin) params.asin = asin
        return Product(collection).find(params)
    },
    Stats: (_, { asin, collection = 'bestSeller' }, context) => {
        const params = {}
        if (asin) params.asin = asin
        return Stat(collection).find(params)
    }
  }
};

module.exports = Resolvers
