const socket = io()  

// Elements
const $messageForm = document.querySelector('#message-form')
const $colourForm = document.querySelector('#colour-form')
const $imageForm = document.querySelector('#image-form')
const $messageFormInput = $messageForm.querySelector('#message-input')
const $colourFormInput = $colourForm.querySelector('input')
const $imageFormInput = $imageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('#send')
const $colourFormButton = $colourForm.querySelector('#submitColour')
const $imageFormButton = $imageForm.querySelector('#submitImage')
const $sendLocationButton = document.querySelector('#send-location')

// LINK TO MESSAGE DISPLAY DIVS
const $messages = document.querySelector('#message')
const $location = document.querySelector('#location')
const $colour = document.querySelector('#colour')
const $image = document.querySelector('#image')

// TEMPLATES
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const colourTemplate = document.querySelector('#colour-template').innerHTML
const imageTemplate = document.querySelector('#image-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//OPTIONS
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
    // new message element
    const $newMessage  = $messages.lastElementChild
    // height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //visible height
    const visibleHeight = $messages.offsetHeight
    //height of messages container
    const containerHeight = $messages.scrollHeight
    // how far we've scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
// MESSAGE
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username, 
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
}) 
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault() // prevents page reloading
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        } 
        console.log('Message delivered!')
    })
})
//LOCATION
socket.on('location', (message) => { 
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username, 
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
$sendLocationButton.addEventListener('click', () => {
    var alerted = localStorage.getItem('alerted') || '';
    if (alerted != 'yes') {
     alert("User location will not show up in Notifications");
     localStorage.setItem('alerted','yes');
    }

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})
// COLOUR
socket.on('colour', (message) => {
    console.log(message)
    const html = Mustache.render(colourTemplate, {
        username: message.username, 
        colour: message.colour,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
$colourForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $colourFormButton.setAttribute('disabled', 'disabled')
    const colour = e.target.elements.colour.value
    socket.emit('sendColour', colour, (error) => {
        $colourFormButton.removeAttribute('disabled')
        $colourFormInput.value = '#ffffff'
        if (error) {
            return console.log(error)
        }
        console.log('Colour delivered!')
    })
})
//EMOJI
window.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#emoji-button');
    const picker = new EmojiButton();

    picker.on('emoji', emoji => {
        $messageForm.querySelector('input').value += emoji;
    });

    button.addEventListener('click', () => {
        picker.togglePicker(button);
    });
}); 
// CANVAS DRAWING
window.addEventListener("load", () => {
    const canvas = document.querySelector('#canvas');
    const ctx = canvas.getContext("2d");
    //Resize
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    let painting = false;
    function startPosition(e) {
        painting = true;
        draw(e);
    }
    function finishedPosition() {
        painting = false;
        ctx.beginPath();
    }
    function draw(e) {
        if (!painting) return;
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";

        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY)
    }
    // Event Listeners
    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", finishedPosition);
    canvas.addEventListener("mousemove", draw);
})
    // Tooltip Destroy after click
    function remove(el) {
        var element = el;
        element.remove();
        }
// SAVE CANVAS
// var dataURL = canvas.toDataURL();
// var w=window.open('about:blank','image from canvas');
// w.document.write("<img src='"+d+"' alt='from canvas'/>");

// IMAGE
socket.on('image', (message) => {
    console.log(message)
        
    const html = Mustache.render(imageTemplate, {
        username: message.username, 
        image: message.image,
        newImage: newImage,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
$imageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $imageFormButton.setAttribute('disabled', 'disabled')
    const image = e.target.elements.image.value
    console.log(image)
    newImage = e.target.elements.image.value.replace("C:\\fakepath\\", "")
    console.log(newImage)
    socket.emit('sendImage', image, (error) => {
        $imageFormButton.removeAttribute('disabled')
        $imageFormInput.value = ''
        if (error) {
            return console.log(error)
        }
        console.log('Image delivered!', newImage)
        document.getElementById('myImage').setAttribute('src', newImage);
    })
})
// SOCKET IMAGE UPLOADER
// var newSocket = io.connect()
// var uploader = new SocketIOFileUpload(newSocket);
// uploader.listenOnSubmit(document.getElementById("submitImage"), document.getElementById("siofu_input"));

// JOIN ROOM + CHECK FOR ERROR
socket.emit('join', { username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
// POPULATE WITH CHANNEL MEMBERS
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

