const Mongoose = require('mongoose')

const UserSchema = new Mongoose.Schema({
	userId: Number,
	firstName: String,
	lastName: String,
	email: String,
	password: String,
	amazonId: String,
	ipAddress: String,
})

const Users = Mongoose.model('users', UserSchema, 'users')

module.exports = Users
