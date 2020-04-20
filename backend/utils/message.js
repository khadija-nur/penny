const generateMessage = (username, text) => {
    return {
        username, 
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocation = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

const generateColour = (username, colour) => {
    return {
        username,
        colour,
        createdAt: new Date().getTime()
    }
}

const generateImage = (username,image) => {
    return {
        username,
        image,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocation,
    generateColour,
    generateImage
}