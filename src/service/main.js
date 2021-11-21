const connect = require('connect')
const serveStatic = require('serve-static')
const http = require('http')
const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer({})
const WebSocket = require('ws')
const os = require('os')
const path = require('path')
const yargs = require('yargs')
const commandLineArgs = yargs.argv

const packageJson = require('../../package.json')
const eventHandlers = require('./lib/event-handlers')

const PORT = commandLineArgs.port || 3300 // Port to listen on
const HTTP_SERVER = commandLineArgs['http-server'] || false // URL of server
const DATA_DIR = process.env.DATA_DIR
  ? process.env.DATA_DIR.startsWith('/') ? process.env.DATA_DIR : path.join(__dirname, process.env.DATA_DIR)
  : path.join(os.homedir(), 'Saved Games', 'Frontier Developments', 'Elite Dangerous')
const WEBROOT = 'build/web'

global.PORT = PORT
global.DATA_DIR = DATA_DIR

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
  const webServer = connect().use(serveStatic(WEBROOT))
  httpServer = http.createServer(webServer)
}

const webSocketServer = new WebSocket.Server({ server: httpServer })

// Bind message event handler to WebSocket server before starting server
webSocketServer.on('connection', socket => {
  console.log('WebSocket connection open')
  socket.on('message', async (event) => {
    const { requestId, name, message } = JSON.parse(event)
    console.log('WebSocket message received', name, event.toString())
    if (eventHandlers[name]) {
      try {
        const data = await eventHandlers[name](message)
        socket.send(JSON.stringify({ requestId, name, message: data }))
      } catch (e) {
        console.error('ERROR_SOCKET_NO_EVENT_HANDLER', name, e)
      }
    }
  })
})

// A function for broadcasting events to all connected clients
function broadcastMessage (name, data) {
  // Use try/catch here to suppress errors caused when main window is
  // closed and app is in process of shutting down
  try {
    if (!webSocketServer) return
    webSocketServer.clients.forEach(client => {
      if (client && client !== webSocketServer && client.readyState === WebSocket.OPEN) {
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

// Start server
console.log(`ICARUS Terminal Service ${packageJson.version}`)
httpServer.listen(PORT)
console.log(`Listening on port ${PORT}`)
