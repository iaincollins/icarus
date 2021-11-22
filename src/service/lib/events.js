const os = require('os')
const path = require('path')
const throttle = require('lodash.throttle')

const {
  PORT,
  DATA_DIR,
  BROADCAST_EVENT: broadcastEvent
} = global

const UNKNOWN_VALUE = 'Unknown'

const EliteJson = require('./elite-json')
const EliteLog = require('./elite-log')

// Instances that can be used to query game state
const eliteJson = new EliteJson(DATA_DIR)
const eliteLog = new EliteLog(DATA_DIR)

// Track initial file load
let loadingComplete = false
let loadingInProgress = false
let numberOfLogEntries = 0 // Count of log entries loaded
const filesLoaded = [] // List of file names loaded

// The loadingUpdate event will be fired during initial load *and* when data
// is loaded while the app is running (ie while the game is active)
//
// These events are throttled to avoid sending excessive updates to clients
// (eg during initial import of thousands - or millions! - of log entries)
const loadingUpdateEvent = throttle(() => broadcastEvent('loadingUpdate', loadingStats()), 100, { leading: true, trailing: true })

// Callback to be invoked when a file is loaded
// Fires every time a file is loaded or reloaded
const loadFileCallback = (file) => {
  if (!filesLoaded.includes(file.name)) filesLoaded.push(file.name)
  loadingUpdateEvent()
}

// Callback when a log entry is loaded
// Fires once for each log entry, duplicate entries won't fire multiple events
const loadLogEntryCallback = () => {
  numberOfLogEntries++
  loadingUpdateEvent()
}

// Callbacks are bound here so we can track data being parsed
eliteJson.loadFileCallback = loadFileCallback
eliteLog.loadFileCallback = loadFileCallback
eliteLog.loadLogEntryCallback = loadLogEntryCallback

const eventHandlers = {
  hostInfo: () => {
    const urls = Object.values(os.networkInterfaces())
      .flat()
      .filter(({ family, internal }) => family === 'IPv4' && !internal)
      .map(({ address }) => `http://${address}:${PORT}`)
    return {
      urls
    }
  },
  loadGameData: async () => {
    // Try to avoid running more than once concurrently
    if (loadingComplete === false && loadingInProgress === false) {
      loadGameData()
    }

    // Idle without blocking while data is loading
    while (loadingComplete === false) {
      await new Promise(resolve => {
        setTimeout(() => resolve(), 100)
      })
    }

    return loadingStats()
  },
  commander: async () => {
    const [LoadGame] = await Promise.all([eliteLog.getEvent('LoadGame')])
    return {
      commander: LoadGame?.Commander ?? UNKNOWN_VALUE,
      credits: LoadGame?.Credits ?? UNKNOWN_VALUE
    }
  }
}

async function loadGameData () {
  loadingInProgress = true
  // The loadingStarted event indicates initial loading of game data has started
  broadcastEvent('loadingStarted')

  // Load JSON files and watch for changes
  await eliteJson.load()
  eliteJson.watch() // @TODO Pass a callback to handle messages

  // Load logs and watch for changes
  await eliteLog.load()
  eliteLog.watch() // @TODO Pass a callback to handle messages

  loadingComplete = true
  loadingInProgress = false

  // The loadingComplete event indicates initial loading is complete, although
  // a loadingUpdate events will continue to fire as new data is loaded when
  // the game is active
  broadcastEvent('loadingComplete', loadingStats())
}

function loadingStats () {
  return { numberOfFiles: filesLoaded.length, numberOfLogEntries }
}

module.exports = {
  eventHandlers,
  loadGameData
}
