const { gql } = require('apollo-server-express')

const Schema = gql`
  type Category {
    primary(name: String): String
    secondary(name: String): String
  }
  type Stats {
    timestamp: String
    price: String
    rank: Int
    rating: String
    reviews: Int
    category: String
  }
  type Product {
    asin: String
    title: String
    category: Category
    image: String
    price: String
    rating: String
    reviews: Int
    rank: Int,
    stats: [Stats!],
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
  type Query {
	  Stats(asin: String, collection: String, limit: Int, offset: Int): [Stat]
    Products(asin: String, category: String, collection: String, limit: Int, offset: Int, stats: Boolean): [Product]
  }
`;

module.exports = Schema
