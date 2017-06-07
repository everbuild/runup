import SockJS from 'sockjs-client/dist/sockjs'

let msgId = 0
const socket = new SockJS('/.runup/api')

socket.onerror = err => console.error('server connection error - refresh page to reconnect', err)
socket.onclose = () => console.error('server connection closed - refresh page to reconnect')

const resolveMap = {}
const recvHandlers = []

socket.onmessage = event => {
    const msg = JSON.parse(event.data)
    const resolve = msg.id && resolveMap[msg.id]
    if(resolve) {
        resolveMap[msg.id] = null
        resolve(msg.result)
    } else {
        recvHandlers.forEach(handler => handler.call(this, msg))
    }
}

export function send(msg) {
    return new Promise((resolve, reject) => {
        msg.id = msgId++
        resolveMap[msg.id] = resolve
        socket.send(JSON.stringify(msg))
        setTimeout(() => {
            if(resolveMap[msg.id]) {
                resolveMap[msg.id] = null
                reject(new Error('timeout'))
            }
        }, 500)
    })
}

export function recv(handler) {
    recvHandlers.push(handler)
}