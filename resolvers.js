const Product = require('./models/Product')
const Stat = require('./models/Stat')
const User = require('./models/User')

const Resolvers = {
	Query: {
		CurrentUser: (parent, args, context) => context.getUser(),
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

			sort[sortBy == 'date' ? '_id' : sortBy] = order == 'desc' ? -1 : 1

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
		Users: (_, {userId = null, amazonId = null, email = null}, context) => {
			const params = {}

			if (userId != null) {
				params.userId = userId
			}

			if (amazonId != null) {
				params.amazonId = amazonId
			}

			if (email != null) {
				params.email = email
			}

			return User.find(params)
		},
	},

	Mutation: {
		logout: (parent, args, context) => context.logout(),
		createUser: async (parent, args, context) => {
			const userExists = await User.findOne({
				email: args.email,
			}).exec()

			if (userExists) {
				return userExists
			}

			args = {
				...args,
				ipAddress: context.req.headers['X-Rorwarded-For']
					.split(',')
					.pop()
					.trim(),
			}

			const newUser = await User.create(args)

			return User.findOne({_id: newUser._id})
		},
		updateUser: async (parent, args, context) => {
			const updatedUser = await User.updateOne({email: args.email}, args)
			return updatedUser.nModified
		},
		deleteUser: async (parent, args, context) => {
			const userExists = await User.exists({email: args.email})

			if (userExists) {
				await User.deleteMany({email: args.email})

				if (!(await User.exists({email: args.email}))) {
					return true
				}
			}

			return false
		},
	},
}

module.exports = Resolvers
