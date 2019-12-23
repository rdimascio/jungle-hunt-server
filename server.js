'use strict'

// const db = mongoose()
// const cors = require('cors')
// const graphqlHTTP = require('express-graphql')

const express = require('express')
const config = require('./config')
const Schema = require('./schema')
const Mongoose = require('mongoose')
const Resolvers = require('./resolvers')
const { ApolloServer } = require('apollo-server-express')

const PORT = process.env.PORT || 8080

const mongoUrl = config.NODE_ENV === 'development'
? 'mongodb://localhost:27017'
: `mongodb://${config.DB_USER}:${config.DB_PWD}@${config.DB_IP}/${config.DB_DATABASE}`

Mongoose.Promise = global.Promise;

const app = express()
const path = '/'
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

Mongoose.connect(
  mongoUrl,
  {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  })
  .then(()=> console.log('DB connected'))
  .catch(error => console.log(error))

const apollo = new ApolloServer({
  typeDefs: Schema, 
  resolvers: Resolvers,
  // context: ({req}) => ({ Product })
});

apollo.applyMiddleware({ app, path })

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:8080${apollo.graphqlPath}`);
});
