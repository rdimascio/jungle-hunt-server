'use strict'

require('dotenv').config()
const express = require('express')
const Schema = require('./schema')
const Mongoose = require('mongoose')
const Resolvers = require('./resolvers')
const { ApolloServer, AuthenticationError } = require('apollo-server-express')

const PORT = process.env.PORT || 8080

// const mongoUrl = process.env.NODE_ENV === 'development'
// ? 'mongodb://localhost:27017'
// : `mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_IP}/${process.env.DB_DATABASE}`

const mongoUrl = `mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_IP}/${process.env.DB_DATABASE}`

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
  // context: ({req}) => {
  //   const token = req.headers.authorization
  //   if (token != `Bearer ${process.env.API_KEY}`) throw new AuthenticationError(`Get off my lawn!`)
  //   return { user: { loggedIn: true } }
  // }
});

apollo.applyMiddleware({ app, path })

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:8080${apollo.graphqlPath}`);
});
