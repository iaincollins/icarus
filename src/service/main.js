const fs = require('fs')
const path = require('path')
const connect = require('connect')
const serveStatic = require('serve-static')
const http = require('http')
const WebSocket = require('ws')
const eventHandlers = require('./lib/event-handlers')
const yargs = require('yargs')

const commandLineArgs = yargs.argv
const PORT = commandLineArgs.port || process.env.PORT || 3300
const WEBROOT = 'resources/assets'

// Start simple HTTP server and add WebSocket server
const webServer = connect().use(serveStatic(WEBROOT))
const httpServer = http.createServer(webServer)
const webSocketServer = new WebSocket.Server({ server: httpServer })

// Bind message event handler to WebSocket server before starting server
webSocketServer.on('connection', socket => {
  console.log('WebSocket connection open')
  socket.on('message', async (event) => {
    const { name, message } = JSON.parse(event)
    console.log('WebSocket message received', name)
    if (eventHandlers[name]) {
      try {
        const data =  await eventHandlers[name](message)
        socket.send(JSON.stringify({name, message: data }))
      } catch (e) {
        console.error('ERROR_SOCKET_NO_EVENT_HANDLER', name, e)
      }
    }
  })
})

// A function for broadcasting events to all connected clients
function broadcastMessage(name, data) {
  // Use try/catch here to suppress errors caused when main window is
  // closed and app is in process of shutting down
  console.log('WebSocket broadcast message sent')
  try {
    if (!webSocketServer) return
    webSocketServer.clients.forEach(client => {
      if (client && client !== socketServer && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ name, message: data }))
      }
    })
  } catch (e) {
    console.error('ERROR_SOCKET_BROADCAST_MESSAGE_FAILED', name, data, e)
  }
}

webSocketServer.on('error', function (error) {
  if (error.code && error.code === 'EADDRINUSE') {
    console.error(`Failed to start service, port ${PORT} already in use.`)
    process.exit(1)
  }
})

console.log(`ICARUS Terminal Service v0.0.0.1 (c) ICARUS`)
httpServer.listen(PORT)
console.log(`Listening on port ${PORT}`)