const EDSM = require('../edsm')
const SystemMap = require('../system-map')
const { UNKNOWN_VALUE } = require('../../../shared/consts')

const systemCache = {}

class NavigationEvents {
  constructor ({ eliteLog }) {
    this.eliteLog = eliteLog
    return this
  }

  async getSystem ({ name = null, useCache = true } = {}) {
    let systemName = name ? name.trim().toLowerCase() : null
    const FSDJump = await this.eliteLog.getEvent('FSDJump')

    if (!systemName) {
      systemName = FSDJump?.StarSystem.toLowerCase() ?? UNKNOWN_VALUE
      if (systemName === UNKNOWN_VALUE) return null
    }

    if (!systemCache[systemName] || useCache === false) { // Check for entry in cache
      const system = await EDSM.system(systemName)
      systemCache[systemName] = new SystemMap(system) // Create/Update cache entry
    }

    let response = systemCache[systemName] // Use cache

    if (!response.name) {
      response.name = systemName
      response.unknownSystem = true
    }

    if (FSDJump?.StarSystem.toLowerCase() === systemName) {
      response = {
        ...response,
        address: FSDJump?.SystemAddress ?? UNKNOWN_VALUE,
        position: FSDJump?.StarPos ?? UNKNOWN_VALUE,
        allegiance: FSDJump?.SystemAllegiance ?? UNKNOWN_VALUE,
        government: FSDJump?.SystemGovernment_Localised ?? UNKNOWN_VALUE,
        security: FSDJump?.SystemSecurity_Localised ?? UNKNOWN_VALUE,
        economy: {
          primary: FSDJump?.SystemEconomy_Localised ?? UNKNOWN_VALUE,
          secondary: FSDJump?.SystemSecondEconomy_Localised ?? UNKNOWN_VALUE
        },
        population: FSDJump?.Population ?? UNKNOWN_VALUE,
        faction: FSDJump?.SystemFaction?.Name ?? UNKNOWN_VALUE,
        isCurrentLocation: true
      }
    } else {
      // TODO if last jump was not to this system, check database (or do a
      // lookup via an API) to get most recent info for this system
      response = {
        ...response,
        address: UNKNOWN_VALUE,
        position: UNKNOWN_VALUE,
        allegiance: UNKNOWN_VALUE,
        government: UNKNOWN_VALUE,
        security: UNKNOWN_VALUE,
        economy: {
          primary: UNKNOWN_VALUE,
          secondary: UNKNOWN_VALUE
        },
        population: UNKNOWN_VALUE,
        faction: UNKNOWN_VALUE,
        isCurrentLocation: false
      }
    }

    return response
  }
}

module.exports = NavigationEvents
