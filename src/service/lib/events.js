const os = require('os')
// const throttle = require('lodash.throttle')

const {
  PORT,
  LOG_DIR,
  BROADCAST_EVENT: broadcastEvent
} = global

const UNKNOWN_VALUE = 'Unknown'

const EliteJson = require('./elite-json')
const EliteLog = require('./elite-log')
const NavigationEvents = require('./events/system')
const ShipEvents = require('./events/ship')

// Instances that can be used to query game state
const eliteJson = new EliteJson(LOG_DIR)
const eliteLog = new EliteLog(LOG_DIR)
const navigationEvents = new NavigationEvents({ eliteLog })
const shipEvents = new ShipEvents({ eliteLog, eliteJson })

// TODO Define these in another file / merge with eventHandlers before porting
// over existing event handlers from the internal build
const ICARUS_EVENTS = {
  IcarusGameLoadedEvent: {
    events: ['LoadGame'],
    handler: async () => { /* Return JSON */ }
  }
}

const GAME_EVENT_TO_ICARUS_EVENT_MAP = {}

// Create mapping of game events to ICARUS events, so that when a game event
// happens it's easy to lookup what ICARUS events to fire
Object.keys(ICARUS_EVENTS).forEach(icarusEventName => {
  ICARUS_EVENTS[icarusEventName].events.forEach(gameEventName => {
    if (!GAME_EVENT_TO_ICARUS_EVENT_MAP[gameEventName]) GAME_EVENT_TO_ICARUS_EVENT_MAP[gameEventName] = []
    GAME_EVENT_TO_ICARUS_EVENT_MAP[gameEventName].push(icarusEventName)
  })
})

// Track initial file load
let loadingComplete = false
let loadingInProgress = false
let numberOfEventsImported = 0 // Count of log entries loaded
let numberOfLogLines = 0
let logSizeInBytes = 0 //
const filesLoaded = [] // List of files loaded
const eventTypesLoaded = {} // List of event types seen
let loadingStartTime, loadingEndTime // Used to track how long loading takes
let loadingProgressInterval // Used to update clients on loading progress

// const loadingProgressEvent = throttle(() => broadcastEvent('loadingProgressEvent', getLoadingStatus()), 250, { leading: true, trailing: true })

const loadingProgressEvent = () => broadcastEvent('loadingProgress', getLoadingStatus())

// Callback to be invoked when a file is loaded
// Fires every time a file is loaded or reloaded
const loadFileCallback = (file) => {
  if (!filesLoaded.includes(file.name)) {
    filesLoaded.push(file.name)
    logSizeInBytes += file.size
    if (file.lineCount) numberOfLogLines += file.lineCount
  }
}

// Callback when a log entry is loaded
// Fires once for each log entry, duplicate entries won't fire multiple events
const logEventCallback = (log) => {
  const eventName = log.event

  // Update stats
  numberOfEventsImported = eliteLog.stats().numberOfEventsImported

  // Add logic to handle broadcasting specific game events
  if (GAME_EVENT_TO_ICARUS_EVENT_MAP[eventName]) {
    // Only fire events *if* we are not loading (otherwise can generate
    // thousands of messages in a few seconds, which slows loading)
    if (!loadingInProgress) {
      // Fire off all ICARUS_EVENTS that depend on this game event
      GAME_EVENT_TO_ICARUS_EVENT_MAP[eventName].map(async (icarusEventName) => {
        const message = await ICARUS_EVENTS[icarusEventName].handler()
        broadcastEvent(icarusEventName, message)
      })
    }
  } else {
    // Keep track of all event types seen (and how many of each type)
    // TODO Move this into the EliteLog class
    if (!eventTypesLoaded[eventName]) eventTypesLoaded[eventName] = 0
    eventTypesLoaded[eventName]++
  }

  if (!loadingInProgress) broadcastEvent('newLogEntry', log)
}

// Callbacks are bound here so we can track data being parsed
eliteJson.loadFileCallback = loadFileCallback
eliteLog.loadFileCallback = loadFileCallback
eliteLog.logEventCallback = logEventCallback

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
  getLoadingStatus: () => getLoadingStatus(),
  getCommander: async () => {
    const [LoadGame] = await Promise.all([eliteLog.getEvent('LoadGame')])
    return {
      commander: LoadGame?.Commander ?? UNKNOWN_VALUE,
      credits: LoadGame?.Credits ?? UNKNOWN_VALUE
    }
  },
  getLogEntries: async ({ count = 100, timestamp }) => {
    if (timestamp) {
      return await eliteLog.getFromTimestamp(timestamp)
    } else {
      return await eliteLog.getNewest(count)
    }
  },
  getSystem: (args) => navigationEvents.getSystem(args),
  getShip: (args) => shipEvents.getShip(args)
}

async function init ({ days = 30 } = {}) {
  // If already run (or already started) don't run again
  if (loadingComplete || loadingInProgress) return getLoadingStatus()

  loadingInProgress = true // True while initial loading is happening
  loadingStartTime = new Date()
  loadingEndTime = null // Reset

  loadingProgressEvent() // Fire first event
  loadingProgressInterval = setInterval(loadingProgressEvent, 200)

  await eliteJson.load() // Load JSON files then watch for changes
  eliteJson.watch(eliteJsonCallback) // @TODO Pass a callback to handle new messages

  await eliteLog.load({ days }) // Load logs then watch for changes
  eliteLog.watch() // @TODO Pass a callback to handle new messages

  clearInterval(loadingProgressInterval)

  loadingInProgress = false // We are done with the loading phase
  loadingComplete = true // Set to true when data has been loaded
  loadingEndTime = new Date()

  loadingProgressEvent() // Trigger once complete

  return getLoadingStatus()
}

function getLoadingStatus () {
  return {
    loadingComplete,
    loadingInProgress,
    loadingCompleted: loadingEndTime,
    loadingTime: (loadingEndTime) ? loadingEndTime - loadingStartTime : new Date() - loadingStartTime,
    numberOfFiles: filesLoaded.length,
    numberOfEventsImported,
    numberOfLogLines,
    logSizeInBytes,
    lastActivity: eliteLog.stats().lastActivity
  }
}

function eliteJsonCallback () {
  broadcastEvent('gameStateChange')
}

module.exports = {
  eventHandlers,
  init
}
