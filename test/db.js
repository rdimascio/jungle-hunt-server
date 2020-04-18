'use strict'

require('dotenv').config()
const Mongoose = require('mongoose')

const mongoUrl = `mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_IP}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

Mongoose.connect(
    mongoUrl,
    {
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    })
    .then(()=> console.log('DB connected'))
    .catch(error => console.log(error))
