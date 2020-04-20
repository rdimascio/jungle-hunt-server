const Product = require('./models/Product')
const Stat = require('./models/Stat')

const Resolvers = {
	Query: {
		Products: (
			_,
			{
				asin,
				category,
				stats = false,
				start = null,
				end = null,
				collection = 'bestSeller',
				sortBy = 'date',
				order = 'desc',
				limit = 100,
				offset = 0,
			},
			context
		) => {
			const params = {}
			const sort = {}

			sort[sortBy == 'date' ? '_id' : sortBy] =
				order == 'desc' ? -1 : 1

			if (stats) {
				const lookupQuery = {
					from: `${collection}Stats`,
					as: 'stats',
				}

				const query = [
					{$sort: {...sort}},
					{$limit: limit},
					{$skip: offset},
					{
						$lookup: lookupQuery,
					},
				]

				if (asin) {
					query.unshift({
						$match: {asin: asin},
					})
				} else if (category) {
					query.unshift({
						$match: {'category.primary': category},
					})
				}

				if (start && end) {
					lookupQuery.let = {id: '$asin'}
					lookupQuery.pipeline = [
						{
							$match: {
								timestamp: {
									$gte: new Date(start).toISOString(),
									$lte: new Date(end).toISOString(),
								},
								$expr: {
									$and: [
										{
											$eq: ['$asin', '$$id'],
										},
									],
								},
							},
						},
					]
				} else {
					lookupQuery.localField = 'asin'
					lookupQuery.foreignField = 'asin'
				}

				return Product(collection).aggregate(query)
			}

			if (asin) {
				params.asin = asin
			} else if (category) {
				params['category.primary'] = category
			}

			return Product(collection)
				.find(params)
				.sort(sort)
				.limit(limit)
				.skip(offset)
		},
		Stats: (
			_,
			{asin, collection = 'bestSeller', limit = 100, offset = 0},
			context
		) => {
			const params = {}

			if (asin) {
				params.asin = asin
			}

			return Stat(collection).find(params).limit(limit).skip(offset)
		},
	},
}

module.exports = Resolvers
