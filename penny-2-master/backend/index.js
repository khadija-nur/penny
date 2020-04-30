const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const multer = require('multer')
const fs = require('fs')
const ejs = require('ejs')
const siofu = require("socketio-file-upload")
const Filter = require('bad-words')
const mongoose = require('mongoose')
const bodyParser = require("body-parser");
const config = require('config')
const dbURL = config.get('MongoDB.mLab')
var MongoClient = require('mongodb').MongoClient;
const {generateMessage, generateLocation, generateColour, generateImage} = require('./utils/message')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const messageRouter = require('./routers/messages')

//db connection
const Chat = require("./models/saveChat");
const Image = require("./models/saveImage");

const connect = require("../dbconnect");


// START SERVER 
const app = express()
    .use(siofu.router)
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../front-end')

app.use(express.static(publicDirectoryPath))
app.use(bodyParser.json());


app.get("/chat/history", (request, response) => {
    MongoClient.connect(dbURL, function(err, db) {
        if (err) throw err;
        var dbo = db.db("heroku_cjx6xx58");
        dbo.collection("chats").find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            response.send(result)
            db.close();
        })
    });
});

// //MULTER IMAGE STORAGE
const storage = multer.diskStorage({
    destination: './front-end/uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + 
        path.extname(file.originalname));
        }
});
app.get('/gallery', (req, res) => {
    res.render('gallery')
})
app.set('view engine', 'ejs')
const upload = multer({
    storage: storage,
    limits:{fileSize: 100000}
}).single('myImage')
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.render('gallery', {
                msg: err
            })
        } else {
            res.render('gallery', {
                msg: 'File Uploaded!',
                file: `uploads/${req.file.filename}`
            });
            connect.then(db => {
                let chatMessage = new Image({img: `uploads/${req.file.filename}`});
                chatMessage.save();
            });

        }
    })
})
app.get("/upload", (request, response) => {
    MongoClient.connect(dbURL, function(err, db) {
        if (err) throw err;
        var dbo = db.db("heroku_cjx6xx58");
        dbo.collection("images").find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            response.send(result)
            db.close();
        })
    });
});

// START CONNECTION
io.on('connection', (socket) => {
    // var uploader = new siofu() // IMAGE UPLOAD
    // uploader.dir = path.join(__dirname, '../front-end/uploads')
    // uploader.listen(socket)

    console.log('New WebSocket connection')
 
    socket.on('join', (options, callback) => {
        const {error, user} = addUser({ id: socket.id, ...options })
        if (error) {
            return callback(error)
        }
        socket.join(user.room) 
        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })        
        callback()
    }) 

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('It takes one to know one!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        //save chat to the database
        connect.then(db => {
            let chatMessage = new Chat({ message, sender: user.username, room: user.room });
            chatMessage.save();
        });
        callback()
    })

    socket.on('sendColour', (colour, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('colour', generateColour(user.username, colour))
        connect.then(db => {
            let chatMessage = new Chat({ colour, sender: user.username, room: user.room });
            chatMessage.save();
        });
        callback()
    })

    socket.on('sendImage', (image, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('image', generateImage(user.username, image))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('location', generateLocation(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})