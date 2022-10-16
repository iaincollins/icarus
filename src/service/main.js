require('dotenv').config()

const os = require('os')
const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const connect = require('connect')
const serveStatic = require('serve-static')
const http = require('http')
const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer({})
const WebSocket = require('ws')
const yargs = require('yargs')
const packageJson = require('../../package.json')

const commandLineArgs = yargs
  .help()
  .usage('Usage: $0 --save-game-dir <directory> [--port <port>]')
  .option('port', {
    type: 'number',
    alias: 'p',
    description: 'Port to listen on (default: 3300)'
  })
  .option('save-game-dir', {
    type: 'string',
    alias: 's',
    description: 'Elite Dangerous Save Game Directory'
  })
  .version(packageJson.version)
  .alias('v', 'version')
  .alias('h', 'help')
  .argv

console.log(`ICARUS Terminal Service ${packageJson.version}`)

// Parse command line arguments
const PORT = commandLineArgs.port || commandLineArgs.p || 3300 // Port to listen on
const DEVELOPMENT = commandLineArgs.dev || false // Development mode
const WEB_DIR = 'build/client'
const LOG_DIR = getLogDir()

if (!fs.existsSync(LOG_DIR)) {
  console.error('ERROR: No save game data found in', LOG_DIR, '\n')
  yargs.showHelp()
  process.exit(1)
} else {
  console.log('Loading save game data from', LOG_DIR)
}

function getLogDir () {
  // Hard coded fallback
  const FALLBACK_LOG_DIR = path.join(os.homedir(), 'Saved Games', 'Frontier Developments', 'Elite Dangerous')
  let logDir = FALLBACK_LOG_DIR

  // For development (or on Unix platforms) you can use the LOG_DIR environment
  // variable to specify the direct path (relative or absolute). You can also
  // use a .env file. This is overriden by command line args.
  if (process.env.LOG_DIR) {
    logDir = process.env.LOG_DIR.startsWith('/') ? process.env.LOG_DIR : path.join(__dirname, process.env.LOG_DIR)
  }
  // Use provided Save Game dir as base path to look for the the files we need
  // This must be obtained via native OS APIs so is typically passed by the client.
  const commandLineSaveGameDir = commandLineArgs.s || commandLineArgs['save-game-dir']
  if (commandLineSaveGameDir) {
    // The option can be a path to a Windows Save Game directory (in which case
    // we append 'Frontier Developments\Elite Dangerous') or the direct path.
    // If it doesn't look like a valid Save Game dir then it is treated it as a
    // direct path.
    const FullPathToSaveGameDir = path.join(commandLineSaveGameDir, 'Frontier Developments', 'Elite Dangerous')
    if (fs.existsSync(FullPathToSaveGameDir)) {
      logDir = FullPathToSaveGameDir
    } else {
      logDir = commandLineSaveGameDir
    }
  }

  return logDir
}

// Export globals BEFORE loading libraries that use them
global.PORT = PORT
global.LOG_DIR = LOG_DIR
global.BROADCAST_EVENT = broadcastEvent

// Initalise simple in-memory object cache (reset when program restarted)
global.CACHE = {
  SYSTEMS: {}
}

// Don't load events till globals are set
const { eventHandlers, init } = require('./lib/events')

let httpServer
if (DEVELOPMENT) {
  // If DEVELOPMENT is specified then HTTP requests other than web socket
  // requests will be forwarded to a web server which is started on localhost
  // to allow UI changes to be tested without rebuilding the app.
  exec('npx next src/client')
  httpServer = http.createServer((req, res) => proxy.web(req, res, { target: 'http://localhost:3000' }))
} else {
  // The default behaviour (i.e. production) is to serve static assets. When the
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

    // Look for for loadingProgress events and display information about events
    // loaded to the console when loadingProgress indicates loading is complete
    if (name === 'loadingProgress' && message.loadingComplete === true) {
      console.log(`Scanned ${message.numberOfFiles} files`)
      console.log(`Imported ${message.numberOfEventsImported} events`)
    }
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
httpServer.listen(PORT)
console.log(`Listening on port ${PORT}…`)

// Initialize app - start parsing data and watching for game state changes
setTimeout(() => init(), 500)
