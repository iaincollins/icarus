const os = require('os')

const EliteJson = require('./elite-json')
const EliteLog = require('./elite-log')
let dataLoaded = false

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
  loadData: async (forceReload = false) => {
    // Only load data if (a) we haven't already or (b) force reload requested
    if (forceReload === true || dataLoaded === false) {
      // Load logs and watch for changes
      const eliteLog = new EliteLog(global.DATA_DIR)
      const logEntries = (await eliteLog.load()).length

      // Load data and watch for changes
      const eliteJson = new EliteJson(global.DATA_DIR)
      const jsonFiles = (await eliteJson.load()).map(file => file.label)
      dataLoaded = { logEntries, jsonFiles }
    }
    return dataLoaded
  }
}

module.exports = eventHandlers
