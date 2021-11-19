/* global WebSocket */
import { createContext, useState, useContext } from 'react'

let socket

const defaultSocketState = {
  connected: false
}

// function sendEvent (name, message = null) {
//   if (socket) {
//     socket.send(JSON.stringify({ name, message }))
//   }
// }

function connect (socketState, setSocketState) {
  socket = new WebSocket('ws://' + window.location.host)
  socket.onmessage = (event) => {
    const { name, message } = JSON.parse(event.data)
    console.log('message received', name, message)
  }
  socket.onopen = (e) => {
    console.log('Connected to socket server')
    setSocketState({
      ...socketState,
      connected: true
    })
  }
  socket.onclose = (e) => {
    console.log('Disconnected from socket server')
    setSocketState({
      ...socketState,
      connected: false
    })
  }
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
