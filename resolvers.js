const Product = require('./models/Product')
const Stat = require('./models/Stat')

const Resolvers = {
  Query: {
    Products: (_, { asin, category, stats = false, collection = "bestSeller", limit = 100, offset = 0 }, context) => {
        const params = {}

        if (asin) {
          params.asin = asin
        }

        if (category) {
          params['category.primary'] = category
        }

        if (stats) {
          return Product(collection).aggregate([
              { $limit: limit },
              { $skip: offset },
              {
                $lookup:
                  {
                    from: `${collection}Stats`,
                    localField: 'asin',
                    foreignField: 'asin',
                    as: 'stats',
                  }
              }
          ])
        }

        return Product(collection).find(params).limit(limit).skip(offset)
    },
    Stats: (_, { asin, collection = 'bestSeller', limit = 100, offset = 0 }, context) => {
        const params = {}
        
        if (asin) {
          params.asin = asin
        }

        return Stat(collection).find(params).limit(limit).skip(offset)
    }
  }
};

module.exports = Resolvers
