const { gql } = require('apollo-server-express')

const Schema = gql`
  type Category {
    primary(name: String): String
    secondary(name: String): String
  }
  type Product {
    asin: String
    title: String
    category: Category
    image: String
    price: String
    rating: String
    reviews: Int
    rank: Int
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
	Stats(asin: String, collection: String): [Stat]
    Products(asin: String, collection: String): [Product]
  }
`;

module.exports = Schema
