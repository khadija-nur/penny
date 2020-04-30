const users = []
const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //DATA VALIDATION
    if (!username || !room) {
        return {
            error: 'username and room required'
        }
    }
    // check for existing users
    const existingUser = users.find((user) =>{
        return user.room === room && user.username === username
    })
    //validate
    if (existingUser) {
        return {
            error: 'user already exists'
        }
    }
    //store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}
const getUser = (id) => {
    return users.find((user) => user.id === id)
}
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

const removedUser = removeUser(3)

console.log(removedUser)
console.log(users)
const userList = getUsersInRoom('')

module.exports = {
    addUser,
    getUser,
    removeUser,
    getUsersInRoom
} 