const os = require('os')

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
  }
}

module.exports = eventHandlers
