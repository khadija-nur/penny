const mongoose = require("mongoose");
const config = require('config')
const dbURL = config.get('MongoDB.mLab')
mongoose.Promise = require("bluebird");


const connect = mongoose.connect(dbURL, {useNewUrlParser:true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true}, (err)  => {
    console.log('mongodb connection successful')
});

module.exports = connect;