const {gql} = require('apollo-server-express')

const Schema = gql`
	type Category {
		primary(name: String): String
		secondary(name: String): String
	}

	type Stats {
		timestamp(date: String): String
		price: String
		rank: Int
		rating: String
		reviews: Int
		category: String
	}

	type Product {
		asin: String
		title: String
		category: Category!
		image: String
		price: String
		rating: String
		reviews: Int
		rank: Int
		stats: [Stats!]
	}

	type Stat {
		asin: String
		category: String
		price: String
		rank: Int
		rating: String
		reviews: Int
		timestamp: String
	}

	type User {
		userId: Int
		amazonId: String
		firstName: String
		lastName: String
		email: String
		password: String
		ipAddress: String
	}

	type Query {
		CurrentUser: [User]
		Users(userId: Int, amazonId: String, email: String): [User]
		Stats(asin: String, collection: String, limit: Int, offset: Int): [Stat]
		Products(
			asin: String
			category: String
			collection: String
			sortBy: String
			order: String
			start: String
			end: String
			limit: Int
			offset: Int
			stats: Boolean
		): [Product]
	}

	type Mutation {
		logout: Boolean
		createUser(
			userId: Int
			amazonId: String
			firstName: String
			lastName: String
			email: String
			password: String
			ipAddress: String
		): User
		updateUser(
			userId: Int
			amazonId: String
			firstName: String
			lastName: String
			email: String
			password: String
			ipAddress: String
		): Int
		deleteUser(
			userId: Int
			amazonId: String
			email: String
		): Boolean
	}
`

module.exports = Schema
