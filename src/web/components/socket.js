/* global WebSocket */
import { createContext, useState, useContext } from 'react'

let socket
const callbacks = {}
const eventQueue = []

const defaultSocketState = {
  connected: false,
  sendEvent
}

function connect (socketState, setSocketState) {
  socket = new WebSocket('ws://' + window.location.host)
  socket.onmessage = (event) => {
    const { requestId } = JSON.parse(event.data)
    if (callbacks[requestId]) callbacks[requestId](event)
    console.log('Message received from socket server', requestId)
  }
  socket.onopen = (e) => {
    console.log('Connected to socket server')
    setSocketState({
      ...socketState,
      connected: true
    })

    for (let i = 0; i < eventQueue.length; i++) {
      const { requestId, name, message } = eventQueue.shift()
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
    callbacks[requestId] = (event) => {
      const { message } = JSON.parse(event.data)
      delete callbacks[requestId]
      resolve(message)
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ requestId, name, message }))
      console.log('Message sent to socket server', requestId, name, message)
    } else {
      eventQueue.push({ requestId, name, message })
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
