const os = require('os')
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
const filesLoaded = [] // List of files loaded
const eventTypesLoaded = {} // List of event types seen

// The gameStateChange event is fired for each event during initial load *and*
// in response to new events logged anytime game is running.
//
// These events are throttled to avoid sending excessive updates to clients
// (eg during initial import of thousands - or millions! - of log entries)
const gameStateChangeEvent = throttle(() => broadcastEvent('gameStateChange', stats()), 100, { leading: true, trailing: true })

// Callback to be invoked when a file is loaded
// Fires every time a file is loaded or reloaded
const loadFileCallback = (file) => {
  if (!filesLoaded.includes(file.name)) filesLoaded.push(file.name)
  gameStateChangeEvent()
}

// Callback when a log entry is loaded
// Fires once for each log entry, duplicate entries won't fire multiple events
const loadLogEntryCallback = (log) => {
  numberOfLogEntries++

  // Keep track of all event types seen (and how many of each type)
  const eventName = log.event
  if (!eventTypesLoaded[eventName]) eventTypesLoaded[eventName] = 0
  eventTypesLoaded[eventName]++

  gameStateChangeEvent()
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
  gameState: () => stats(),
  commander: async () => {
    const [LoadGame] = await Promise.all([eliteLog.getEvent('LoadGame')])
    return {
      commander: LoadGame?.Commander ?? UNKNOWN_VALUE,
      credits: LoadGame?.Credits ?? UNKNOWN_VALUE
    }
  }
}

async function init () {
  if (loadingComplete) return stats() // If already run, don't run again

  // @TODO If in progress, wait until loadingInProgress is false
  
  loadingInProgress = true // Track that loading is in progress
 
  await eliteJson.load() // Load JSON files then watch for changes
  eliteJson.watch() // @TODO Pass a callback to handle new messages

  await eliteLog.load()  // Load logs then watch for changes
  eliteLog.watch() // @TODO Pass a callback to handle new messages

  loadingInProgress = false // Track that loading is complete
  loadingComplete = true // Set to true if data has been loaded at least once

  return stats()
}

function stats () {
  return {
    loadingComplete,
    loadingInProgress,
    numberOfFiles: filesLoaded.length,
    numberOfLogEntries,
    eventTypesLoaded
  }
}

module.exports = {
  eventHandlers,
  init
}
