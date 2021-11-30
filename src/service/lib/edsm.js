// systemName or systemId
// https://www.edsm.net/en_GB/api-system-v1
// https://www.edsm.net/api-system-v1/estimated-value
// https://www.edsm.net/api-system-v1/bodies
// https://www.edsm.net/api-system-v1/stations
// https://www.edsm.net/api-system-v1/stations/market
// https://www.edsm.net/api-system-v1/stations/shipyard

const axios = require('axios')
const retry = require('async-retry')

const baseUrl = 'https://www.edsm.net/api-system-v1/'

class EDSM {
  static async bodies (systemName) {
    return await retry(async bail => {
      // console.log('Fetching system bodies from EDSM...', systemName)
      const res = await axios.get(`${baseUrl}bodies?systemName=${encodeURIComponent(systemName)}`)
      return res.data.bodies
    }, {
      retries: 10
    })
  }

  static async stations (systemName) {
    return await retry(async bail => {
      // console.log('Fetching system stations from EDSM...', systemName)
      const res = await axios.get(`${baseUrl}stations?systemName=${encodeURIComponent(systemName)}`)
      return res.data.stations
    }, {
      retries: 10
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
