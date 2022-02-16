const { UNKNOWN_VALUE } = require('../../shared/consts')

// https://www.edsm.net/en_GB/api-v1
// Most endpoints take systemName or systemId
// https://www.edsm.net/api-v1/system
// https://www.edsm.net/api-system-v1/estimated-value
// https://www.edsm.net/api-system-v1/bodies
// https://www.edsm.net/api-system-v1/stations
// https://www.edsm.net/api-system-v1/stations/market
// https://www.edsm.net/api-system-v1/stations/shipyard

const axios = require('axios')
const retry = require('async-retry')

const baseUrl = 'https://www.edsm.net/'

class EDSM {
  static async bodies (systemName) {
    return await retry(async bail => {
      const res = await axios.get(`${baseUrl}api-system-v1/bodies?systemName=${encodeURIComponent(systemName)}`)
      return res.data.bodies
    }, {
      retries: 10
    })
  }

  static async stations (systemName) {
    return await retry(async bail => {
      const res = await axios.get(`${baseUrl}api-system-v1/stations?systemName=${encodeURIComponent(systemName)}`)
      return res.data.stations
    }, {
      retries: 10
    })
  }

  static async system (systemName) {
    return await retry(async bail => {
      const resSystem = await axios.get(`${baseUrl}api-v1/system?systemName=${encodeURIComponent(systemName)}&showInformation=1&showCoordinates=1`)
      const resBodies = await axios.get(`${baseUrl}api-system-v1/bodies?systemName=${encodeURIComponent(systemName)}`)
      const resStations = await axios.get(`${baseUrl}api-system-v1/stations?systemName=${encodeURIComponent(systemName)}`)
      return {
        name: resSystem?.data?.name ?? UNKNOWN_VALUE,
        address: resSystem?.data?.address ?? UNKNOWN_VALUE,
        position: resSystem?.data?.coords ? [resSystem?.data?.coords.x, resSystem?.data?.coords.y, resSystem?.data?.coords.z] : null,
        allegiance: resSystem?.data?.information?.allegiance ?? UNKNOWN_VALUE,
        government: resSystem?.data?.information?.government ?? UNKNOWN_VALUE,
        security: resSystem?.data?.information?.security ? `${resSystem.data.information.security} Security` : UNKNOWN_VALUE,
        state: resSystem?.data?.information?.factionState ?? UNKNOWN_VALUE,
        economy: {
          primary: resSystem?.data?.information?.economy ?? UNKNOWN_VALUE,
          secondary: resSystem?.data?.information?.secondEconomy ?? UNKNOWN_VALUE
        },
        population: resSystem?.data?.information?.population ?? UNKNOWN_VALUE,
        faction: resSystem?.data?.information?.faction ?? UNKNOWN_VALUE,
        bodies: resBodies?.data?.bodies ?? [],
        stations: resStations?.data?.stations ?? []
      }
    }, {
      retries: 10
    })
  }
}

module.exports = EDSM
