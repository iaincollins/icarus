/* global WebSocket, CustomEvent */
import { createContext, useState, useContext } from 'react'

let socket // Store socket connection
const callbackHandlers = {} // Store callbacks waiting to be executed (pending response from server)
const deferredEventQueue = [] // Store events waiting to be sent (used when server is not ready yet or offline)
let recentBroadcastEvents = 0

const defaultSocketState = {
  connected: false, // Boolean to indicate current connection status
  active: false // Boolean to indicate if any pending requests
}

function socketDebugMessage () { /* console.log(...arguments) */ }

function connect (socketState, setSocketState) {
  socket = new WebSocket('ws://' + window.location.host)
  socket.onmessage = (event) => {
    const { requestId, name, message } = JSON.parse(event.data)
    // Invoke callback to handler (if there is one)
    if (requestId && callbackHandlers[requestId]) callbackHandlers[requestId](event, setSocketState)
    // Broadcast event to anything that is listening for an event with this name
    if (!requestId && name) {
      window.dispatchEvent(new CustomEvent(`socketEvent_${name}`, { detail: message }))

      // When a broadcast message is received, use recentBroadcastEvents to
      // track recent requests so the activity monitor in the UI can reflect
      // that there is activity and that the client is receiving events.
      recentBroadcastEvents++
      setTimeout(() => {
        recentBroadcastEvents--
        setSocketState(prevState => ({
          ...prevState,
          active: socketRequestsPending()
        }))
      }, 500)
    }
    socketDebugMessage('Message received from socket server', requestId, name, message)
  }
  socket.onopen = (e) => {
    socketDebugMessage('Connected to socket server')

    setSocketState(prevState => ({
      ...prevState,
      active: socketRequestsPending(),
      connected: true
    }))

    // While connection remains open and there are queued messages, try to
    // deliver. The readyState check matters because otherwise if a connection
    // does down just after going up we want to catch that scenario, and try to
    // send the message again when the open event is next fired.
    while (socket.readyState === WebSocket.OPEN && deferredEventQueue.length > 0) {
      const { requestId, name, message } = deferredEventQueue[0]
      try {
        socket.send(JSON.stringify({ requestId, name, message }))
        setSocketState(prevState => ({
          ...prevState,
          active: socketRequestsPending()
        }))
        deferredEventQueue.shift() // Remove message from queue once delivered
        socketDebugMessage('Queued message sent to socket server', requestId, name, message)
      } catch (e) {
        // Edge case for flakey connections
        socketDebugMessage('Failed to deliver queued message socket server', requestId, name, message)
      }
    }
  }
  socket.onclose = (e) => {
    socketDebugMessage('Disconnected from socket server')
    setSocketState(prevState => ({
      ...prevState,
      active: !!((Object.keys(callbackHandlers).length > 0 || deferredEventQueue.length > 0)),
      connected: false
    }))
  }
}

const SocketContext = createContext()

function SocketProvider ({ children }) {
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

function useSocket () { return useContext(SocketContext) }

function sendEvent (name, message = null) {
  return new Promise((resolve, reject) => {
    const requestId = generateUuid()
    callbackHandlers[requestId] = (event, setSocketState) => {
      const { message } = JSON.parse(event.data)
      delete callbackHandlers[requestId]
      setSocketState(prevState => ({
        ...prevState,
        active: socketRequestsPending()
      }))
      resolve(message)
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ requestId, name, message }))
      socketDebugMessage('Message sent to socket server', requestId, name, message)
    } else {
      deferredEventQueue.push({ requestId, name, message })
      socketDebugMessage('Message queued', requestId, name, message)
    }
  })
}

function eventListener (eventName, callback) {
  const eventHandler = (e) => { callback(e.detail) }
  window.addEventListener(`socketEvent_${eventName}`, eventHandler)
  return () => window.removeEventListener(`socketEvent_${eventName}`, eventHandler)
}

function socketRequestsPending () {
  return !!((Object.keys(callbackHandlers).length > 0 || deferredEventQueue.length > 0 || recentBroadcastEvents > 0))
}

function generateUuid () {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

module.exports = {
  SocketProvider,
  useSocket,
  sendEvent,
  eventListener
}
