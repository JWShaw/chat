const socket = io()

socket.on('message', (text) => {
    console.log(text)
})

const chatForm = document.querySelector('#message-form')
const message = document.querySelector('input')

chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const messageText = message.value
    socket.emit('sendMessage', messageText)
})

socket.on('sendMessage', (text) => {
    console.log(text)
})