/* global WebSocket, CustomEvent */
import { createContext, useState, useContext } from 'react'

let socket // Store socket connection
const callbackHandlers = {} // Store callbacks waiting to be executed (pending response from server)
const deferredEventQueue = [] // Store events waiting to be sent (used when server is not ready yet or offline)

const defaultSocketState = {
  connected: false, // Boolean to indicate current connection status
  sendEvent // An async function components can call to send an event
}

function connect (socketState, setSocketState) {
  socket = new WebSocket('ws://' + window.location.host)
  socket.onmessage = (event) => {
    const { requestId, name, message } = JSON.parse(event.data)
    // Invoke callback to handler (if there is one)
    if (callbackHandlers[requestId]) { callbackHandlers[requestId](event) }
    // Broadcast event to anything that is listening for an event with this name
    if (name) {
      window.dispatchEvent(new CustomEvent(`socket.${name}`, { detail: message }))
    }
    console.log('Message received from socket server', requestId, name, message)
  }
  socket.onopen = (e) => {
    console.log('Connected to socket server')
    setSocketState({
      ...socketState,
      connected: true
    })

    while (deferredEventQueue.length > 0) {
      const { requestId, name, message } = deferredEventQueue.shift()
      socket.send(JSON.stringify({ requestId, name, message }))
      console.log('Queued message sent to socket server', requestId, name, message)
    }
  }
  socket.onclose = (e) => {
    console.log('Disconnected from socket server')
    setSocketState({
      ...socketState,
      connected: false
    })
  }
}

function sendEvent (name, message = null) {
  return new Promise((resolve, reject) => {
    const requestId = generateUuid()
    callbackHandlers[requestId] = (event) => {
      const { message } = JSON.parse(event.data)
      delete callbackHandlers[requestId]
      resolve(message)
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ requestId, name, message }))
      console.log('Message sent to socket server', requestId, name, message)
    } else {
      deferredEventQueue.push({ requestId, name, message })
      console.log('Message queued', requestId, name, message)
    }
  })
}

function generateUuid () {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const SocketContext = createContext()

export function Socket ({ children }) {
  const [socketState, setSocketState] = useState(defaultSocketState)

  if (typeof WebSocket !== 'undefined' && socketState.connected !== true) {
    connect(socketState, setSocketState)
  }

  return (
    <SocketContext.Provider value={socketState}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket () {
  return useContext(SocketContext)
}
