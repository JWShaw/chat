const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMsgTemplate = document.querySelector('#location-msg-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationMsgTemplate, {
        username: location.username,
        link: location.text,
        createdAt: moment(location.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // Disable form

    $messageFormButton.setAttribute('disabled', 'disabled')

    const messageText = e.target.elements.message.value
    socket.emit('sendMessage', messageText, (error) => {
        $messageFormButton.removeAttribute('disabled', 'disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        
        console.log('Message delivered!')
    })
})

$locationButton.addEventListener('click', () => {
    // if (!navigator.geolocation) {
    //     return alert('Geolocation is not supported by your browser')
    // }

    $locationButton.setAttribute('disabled', 'disabled')

    // Location hard-coded for now.
    setTimeout(() => {
        socket.emit('sendLocation', {
            latitude: 53.91,
            longitude: -122.77
        }, () => {
            console.log('Location sent!')
            $locationButton.removeAttribute('disabled', 'disabled')
        })
    }, 2000)

    // navigator.geolocation.getCurrentPosition(() => {
    //     console.log('Success!')
    //   }, (e) => {
    //     console.log('Error!')
    //     console.log(e)
    //   })

    // navigator.geolocation.getCurrentPosition((pos) => {
    //     socket.emit('sendLocation', {
    //         latitude: 53.91,
    //         longitude: -122.77
    //     })
    // })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})