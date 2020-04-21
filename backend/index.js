const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const multer = require('multer')
const ejs = require('ejs')
const siofu = require("socketio-file-upload")
const Filter = require('bad-words')
const {generateMessage, generateLocation, generateColour, generateImage} = require('./utils/message')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

// START SERVER 
const app = express()
    .use(siofu.router)
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
// const publicDirectoryPath = path.join(__dirname, '../front-end')

// app.use(express.static(publicDirectoryPath))

//MULTER IMAGE STORAGE
// const storage = multer.diskStorage({
//     destination: './front-end/uploads/',
//     filename: function(req, file, cb){
//         cb(null, file.fieldname + '-' + Date.now() + 
//         path.extname(file.originalname));
//     }
// });

// Init UPLOAD PHOTO
// const upload = multer({
//     storage: storage
// }).single('image')

app.get('/connect', (req, res) => {
    res.render('connect')
})
app.post('/upload', (req, res) => {
    res.send('test')
})

// START CONNECTION
io.on('connection', (socket) => {
    // var uploader = new siofu() // IMAGE UPLOAD
    // uploader.dir = path.join(__dirname, '../front-end/uploads')
    // uploader.listen(socket)

    console.log('New WebSocket connection')
 
    socket.on('join', (options, callback) => {
        console.log(options);
        const {error, user} = addUser({ id: socket.id, username: "Rob", room: "test" })
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
        callback()
    })

    socket.on('sendColour', (colour, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('colour', generateColour(user.username, colour))
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