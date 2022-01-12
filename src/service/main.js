require('dotenv').config()

const connect = require('connect')
const serveStatic = require('serve-static')
const http = require('http')
const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer({})
const WebSocket = require('ws')
const os = require('os')
const fs = require('fs')
const path = require('path')
const yargs = require('yargs')
const commandLineArgs = yargs.argv

// Parse command line arguments
const PORT = commandLineArgs.port || 3300 // Port to listen on
const HTTP_SERVER = commandLineArgs['http-server'] || false // URL of server
const WEB_DIR = 'build/web'
const LOG_DIR = getLogDir()

function getLogDir () {
  // Hard coded fallback
  const FALLBACK_LOG_DIR = path.join(os.homedir(), 'Saved Games', 'Frontier Developments', 'Elite Dangerous')
  let logDir = FALLBACK_LOG_DIR

  // Use provided Save Game dir as base path to look for the the files we need
  // This must be obtained via native OS APIs so is typically passed by the client
  if (commandLineArgs['save-game-dir']) {
    logDir = path.join(commandLineArgs['save-game-dir'], 'Frontier Developments', 'Elite Dangerous')
  }

  // For development / Unix platforms, you can use the LOG_DIR environment
  // variable to specify the direct path (relative or absolute). You can also
  // use a .env file
  if (process.env.LOG_DIR) {
    logDir = process.env.LOG_DIR.startsWith('/') ? process.env.LOG_DIR : path.join(__dirname, process.env.LOG_DIR)
  }

  // Check if the log dir exists and seems valid, try fallback as needed
  if (!fs.existsSync(logDir) && fs.existsSync(FALLBACK_LOG_DIR)) return FALLBACK_LOG_DIR

  return logDir
}

// Export globals BEFORE loading libraries that use them
global.PORT = PORT
global.LOG_DIR = LOG_DIR
global.BROADCAST_EVENT = broadcastEvent

const packageJson = require('../../package.json')
const { eventHandlers, init } = require('./lib/events')

let httpServer
if (HTTP_SERVER) {
  // If HTTP_SERVER is specified (i.e. in development) then HTTP requests
  // other than web socket requests will be forwarded to it. This is useful
  // for inteface development, to allow hot reloading of the UI.
  httpServer = http.createServer((req, res) => proxy.web(req, res, { target: HTTP_SERVER }))
} else {
  // The default behaviour (i.e. production) to serve static assets. When the
  // application is compiled to a native executable these assets will be bundled
  // with the executable in a virtual file system.
  const webServer = connect().use(serveStatic(WEB_DIR, { extensions: ['html'] }))
  httpServer = http.createServer(webServer)
}

const webSocketServer = new WebSocket.Server({ server: httpServer })

function webSocketDebugMessage () { /* console.log(...arguments) */ }

// Bind message event handler to WebSocket server before starting server
webSocketServer.on('connection', socket => {
  webSocketDebugMessage('WebSocket connection open')
  socket.on('message', async (event) => {
    const { requestId, name, message } = JSON.parse(event)
    webSocketDebugMessage('WebSocket message received', name, event.toString())
    if (eventHandlers[name]) {
      try {
        const data = await eventHandlers[name](message || {})
        socket.send(JSON.stringify({ requestId, name, message: data }))
      } catch (e) {
        console.error('ERROR_SOCKET_NO_EVENT_HANDLER', name, e)
      }
    }
  })
})

// A function for broadcasting events to all connected clients
function broadcastEvent (name, message) {
  // Use try/catch here to suppress errors caused when main window is
  // closed and app is in process of shutting down
  try {
    if (!webSocketServer) return
    webSocketServer.clients.forEach(client => {
      if (client && client !== webSocketServer && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ name, message }))
      }
    })
    webSocketDebugMessage('WebSocket broadcast sent', name, message)
  } catch (e) {
    console.error('ERROR_SOCKET_BROADCAST_EVENT_FAILED', name, message, e)
  }
}

webSocketServer.on('error', function (error) {
  if (error.code && error.code === 'EADDRINUSE') {
    console.error(`Failed to start service, port ${PORT} already in use.`)
    process.exit(1)
  }
})

// Start server
console.log(`ICARUS Terminal Service ${packageJson.version}`)
httpServer.listen(PORT)
console.log(`Listening on port ${PORT}`)

// Initialize app - start parsing data and watching for game state changes
setTimeout(() => init(), 250)
