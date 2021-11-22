const os = require('os')
const path = require('path')
const { throttle } = require('throttle-debounce')

const EliteJson = require('./elite-json')
const EliteLog = require('./elite-log')

let loadingComplete = false
let loadingInProgress = false
let logEntriesLoaded = 0
const filesLoaded = []

const eventHandlers = {
  debug: (message) => {
    console.log('debug', message)
    return 'Debug message received'
  },
  hostInfo: () => {
    const urls = Object.values(os.networkInterfaces())
      .flat()
      .filter(({ family, internal }) => family === 'IPv4' && !internal)
      .map(({ address }) => `http://${address}:${global.PORT}`)
    return {
      urls
    }
  },
  loadData: async () => {
    // Try to avoid running more than once concurrently
    if (loadingComplete === false && loadingInProgress === false) {
      loadingInProgress = true
      loadData()
    }

    while (loadingComplete === false) {
      await new Promise(resolve => {
        setTimeout(() => resolve(), 100)
      })
    }

    return { filesLoaded, logEntriesLoaded }
  }
}

async function loadData () {
  // Throttle loading events to avoid excessive updates
  const loadingEvent = throttle(100, false, () => global.BROADCAST_EVENT('loading', { logEntriesLoaded, filesLoaded }))

  // Callback to be invoked when a new file is loaded
  const loadFileCallback = (fileLoaded) => {
    filesLoaded.push(path.basename(fileLoaded))
    loadingEvent()
  }

  // Callback when a log entry is loaded
  const loadLogEntryCallback = () => {
    logEntriesLoaded++
    loadingEvent()
  }

  // Load JSON files and watch for changes
  const eliteJson = new EliteJson(global.DATA_DIR)
  const jsonFilesLoaded = (await eliteJson.load({ loadFileCallback })).map(file => file.label)

  // Load logs and watch for changes
  const eliteLog = new EliteLog(global.DATA_DIR)
  logEntriesLoaded = (await eliteLog.load({ loadFileCallback, loadLogEntryCallback })).length

  loadingComplete = true
  loadingInProgress = false
}

module.exports = eventHandlers
