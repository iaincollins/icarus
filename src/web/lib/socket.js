/* global WebSocket, CustomEvent */
import { createContext, useState, useContext } from 'react'
import notification from 'lib/notification'

let socket = null// Store socket connection (defaults to null)
let callbackHandlers = {} // Store callbacks waiting to be executed (pending response from server)
let deferredEventQueue = [] // Store events waiting to be sent (used when server is not ready yet or offline)
let recentBroadcastEvents = 0

const defaultSocketState = {
  connected: false, // Boolean to indicate current connection status
  active: false, // Boolean to indicate if any pending requests
  ready: false // Boolean to indicate if the service is ready and loaded
}

const socketOptions = {
  messages: true
}

function socketDebugMessage () { /* console.log(...arguments) */ }

function connect (socketState, setSocketState) {
  if (socket !== null) return
  
  // Reset on reconnect
  callbackHandlers = {}
  deferredEventQueue = []

  socket = new WebSocket('ws://' + window.location.host)
  socket.onmessage = (event) => {
    const { requestId, name, message } = JSON.parse(event.data)
    // Invoke callback to handler (if there is one)
    if (requestId && callbackHandlers[requestId]) callbackHandlers[requestId](event, setSocketState)

    // Updating resync whern loading completes tells any components to resync
    // with the server. it is useful for remote clients that disconnects then
    // reconnects to tell them to update once the service is ready.
    if (name === 'loadingProgress') {
      if (message.loadingComplete) {
        setSocketState(prevState => ({
          ...prevState,
          ready: true
        }))
      }
    }

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

      // Trigger notifications for key actions
      // TODO Refactor out into a seperate handler
      try { // Don't crash if fails because properties are missing
        if (socketOptions.notifications === true && name === 'newLogEntry') {
          if (message.event === 'StartJump' && message.StarSystem) notification(`Jumping to ${message.StarSystem}`)
          if (message.event === 'FSDJump') notification(`Arrived in ${message.StarSystem}`)
          if (message.event === 'ApproachBody') notification(`Approaching ${message.Body}`)
          if (message.event === 'LeaveBody') notification(`Leaving ${message.Body}`)
          if (message.event === 'NavRoute') notification('New route plotted')
          if (message.event === 'DockingGranted') notification(`Docking at ${message.StationName}`)
          if (message.event === 'Docked') notification(`Docked at ${message.StationName}`)
          if (message.event === 'Undocked') notification(`Now leaving ${message.StationName}`)
          if (message.event === 'ApproachSettlement') notification(`Approaching ${message.Name}`)
          if (message.event === 'ReceiveText' && message.From) notification(() => <><p className='text-primary text-right' style={{ marginRight: '1rem' }}>{message.From_Localised || message.From}</p><p className='text-info text-no-transform'>{message.Message_Localised || message.Message}</p></>)
          if (message.event === 'MarketBuy') notification(`Bought ${message.Count} T of ${message.Type_Localised || message.Type}`)
          if (message.event === 'MarketSell') notification(`Sold ${message.Count} T of ${message.Type_Localised || message.Type}`)
          if (message.event === 'BuyDrones') notification(`Bought ${message.Count} Limpet ${message.Count === 1 ? 'Done' : 'Dones'}`)
          if (message.event === 'SellDrones') notification(`Sold ${message.Count} Limpet ${message.Count === 1 ? 'Done' : 'Dones'}`)
          if (message.event === 'CargoDepot' && message.UpdateType === 'Collect') notification(`Collected ${message.Count} T of ${message.CargoType.replace(/([a-z])([A-Z])/g, '$1 $2')}`)
          if (message.event === 'CargoDepot' && message.UpdateType === 'Deliver') notification(`Delivered ${message.Count} T of ${message.CargoType.replace(/([a-z])([A-Z])/g, '$1 $2')}`)
          if (message.event === 'Scanned') notification('Scan detected')
        }
      } catch (e) { console.log('NOTIFICATION_ERROR', e) }
    }
    socketDebugMessage('Message received from socket server', requestId, name, message)
  }
  socket.onopen = async (e) => {
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

    // If we are fully loaded, then set 'ready' state to true, otherwise wait
    // until get a loadingProgress event that indicates the service is loaded
    const loadingStats = await sendEvent('getLoadingStatus')
    if (loadingStats.loadingComplete) {
      setSocketState(prevState => ({
        ...prevState,
        ready: true
      }))
    }
  }
  socket.onclose = (e) => {
    socket = null
    socketDebugMessage('Disconnected from socket server (will attempt reconnection)')
    setSocketState(prevState => ({
      ...prevState,
      active: socketRequestsPending(),
      connected: false,
      ready: false
    }))
    setTimeout(() => { connect(socketState, setSocketState) }, 5000)
  }

  socket.onerror = function (err) {
    socketDebugMessage('Socket error', err.message)
    socket.close()
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
  eventListener,
  socketOptions
}
