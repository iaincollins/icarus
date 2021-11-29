// systemName or systemId
// https://www.edsm.net/en_GB/api-system-v1
// https://www.edsm.net/api-system-v1/estimated-value
// https://www.edsm.net/api-system-v1/bodies
// https://www.edsm.net/api-system-v1/stations
// https://www.edsm.net/api-system-v1/stations/market
// https://www.edsm.net/api-system-v1/stations/shipyard

const axios = require('axios')
const retry = require('async-retry')

// Using a crude in-memory cache until persistant storage is implemented.
// For now this will reduce the amount of traffic to the EDSM API and won't use
// too much memory as unlikely to visit enough systems in a single session
// to ever be problematic. Ultimately want to persist local caches.
const systemBodiesCache = {}
const systemStationsCache = {}

const baseUrl = 'https://www.edsm.net/api-system-v1/'

class EDSM {
  static bodies (systemName) {
    // Try to use cache
    if (systemBodiesCache[systemName]) return systemBodiesCache[systemName]

    return new Promise(async (resolve) => {
      await retry(async bail => {
        // console.log('Fetching system bodies from EDSM...', systemName)
        const res = await axios.get(`${baseUrl}bodies?systemName=${encodeURIComponent(systemName)}`)
        systemBodiesCache[systemName] = res.data.bodies
        resolve(res.data.bodies)
      }, {
        retries: 10
      })
    })
  }

  static stations (systemName) {
    // Try to use cache
    if (systemStationsCache[systemName]) return systemStationsCache[systemName]

    return new Promise(async (resolve) => {
      await retry(async bail => {
        // console.log('Fetching system stations from EDSM...', systemName)
        const res = await axios.get(`${baseUrl}stations?systemName=${encodeURIComponent(systemName)}`)
        systemStationsCache[systemName] = res.data.stations
        resolve(res.data.stations)
      }, {
        retries: 10
      })
    })
  }

  // static system(systemName) {
  //   return new Promise(async (resolve) => {
  //     await retry(async bail => {
  //       const res = await axios.get(`${baseUrl}bodies?systemName=${encodeURIComponent(systemName)}`)
  //       resolve({...res.data, stations: await EDSM.stations(systemName)})
  //     }, {
  //       retries: 10
  //     })
  //   })
  // }
}

module.exports = EDSM
