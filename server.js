'use strict'

require('dotenv').config()
const path = require('path')
const cors = require('cors')
const {v4: uuidv4} = require('uuid')
const express = require('express')
const Schema = require('./schema')
const Mongoose = require('mongoose')
const passport = require('passport')
const Resolvers = require('./resolvers')
const session = require('express-session')
const AmazonStrategy = require('passport-amazon').Strategy
const {ApolloServer, AuthenticationError} = require('apollo-server-express')

const app = express()
const apiPath = '/api/v1/products'
const buildPath = path.join(__dirname, './../app')

const DEV = process.env.NODE_ENV === 'development'
const PORT = process.env.PORT || 8080
const HOST = DEV ? `jungle_hunt_db:${process.env.DP_PORT}` : process.env.DB_IP
const CLIENT = DEV ? 'http://localhost:3000' : 'junglehunt.io'
const APP = DEV ? 'http://localhost:8080' : 'junglehunt.io'
// const METHOD = DEV ? 'redirect' : 'sendFile'

const mongoUrl = `mongodb://${`${process.env.DB_USER}:` || ''}${
	`${process.env.DB_PWD}@` || ''
}${HOST}/${process.env.DB_DATABASE}`

Mongoose.Promise = global.Promise

Mongoose.connect(mongoUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
	.then(() => console.log('DB connected'))
	.catch((error) => console.log(error))

const apollo = new ApolloServer({
	typeDefs: Schema,
	resolvers: Resolvers,
	context: ({req}) => {
		const token = req.headers.authorization
		if (!DEV && token != `Bearer ${process.env.API_KEY}`) {
			throw new AuthenticationError(`Error: Unauthenticated request.`)
		}

		return {
			getUser: () => req.user,
			logout: () => req.logout(),
			req,
		}
	},
})

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
const ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next()
	}

	res.redirect(`${CLIENT}/login`)
}

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Amazon profile is
//   serialized and deserialized.
passport.serializeUser(function (user, done) {
	done(null, user)
})

passport.deserializeUser(function (obj, done) {
	done(null, obj)
})

const AMAZON_OPTIONS = {
	clientID: process.env.AMAZON_LOGIN_CLIENT_ID,
	clientSecret: process.env.AMAZON_LOGIN_CLIENT_SECRET,
	callbackURL: 'http://localhost:8080/api/v1/auth/amazon/callback',
}

const AMAZON_CALLBACK = (accessToken, refreshToken, profile, done) => {
	// To keep the example simple, the user's Amazon profile is returned to
	// represent the logged-in user.  In a typical application, you would want
	// to associate the Amazon account with a user record in your database,
	// and return that user instead.
	return done(null, profile)
}

// Use the AmazonStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Amazon
//   profile), and invoke a callback with a user object.
passport.use(new AmazonStrategy(AMAZON_OPTIONS, AMAZON_CALLBACK))

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*')
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, X-Forwarded-For'
	)
	next()
})

app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
	})
)

app.use(
	session({
		genid: (req) => uuidv4(),
		secret: process.env.API_SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		// cookie: { secure: true }
		// store:
	})
)

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize())
app.use(passport.session())

// Static files
app.use(express.static(buildPath))

apollo.applyMiddleware({app, path: apiPath, cors: false})

// GET /auth/amazon
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Amazon authentication will involve
//   redirecting the user to amazon.com.  After authorization, Amazon
//   will redirect the user back to this application at /auth/amazon/callback
app.get(
	'/api/v1/auth/amazon',
	passport.authenticate('amazon', {scope: ['profile', 'postal_code']})
)

// GET /auth/amazon/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get(
	'/api/v1/auth/amazon/callback',
	passport.authenticate('amazon', {
		successRedirect: `http://localhost:8080/api/v1/products`,
		failureRedirect: `http://localhost:8080/api/v1/products`,
	})
)

app.get('/api/v1/auth/logout', function (req, res) {
	req.logout()
	res.redirect(`${CLIENT}/login`)
})

// All remaining requests return the React app, so it can handle routing.
app.get('*', ensureAuthenticated, function (req, res, next) {
	res.redirect(`${CLIENT}`)
})

app.listen(PORT, () => {
	console.log(`🚀 Server ready at http://localhost:8080`)
})
