const express = require('express')
const config = require('config')
const dbURL = config.get('MongoDB.mLab')
var MongoClient = require('mongodb').MongoClient;
const router = new express.Router()

MongoClient.connect(dbURL, function(err, db) {
    if (err) throw err;
    var dbo = db.db("heroku_cjx6xx58");
    dbo.collection("chats").find({}).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
    });
})

module.exports = router
