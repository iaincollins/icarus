const EDSM = require('../edsm')
const SystemMap = require('../system-map')
const { UNKNOWN_VALUE } = require('../../../shared/consts')
const distance = require('../../../shared/distance')

const systemCache = {}

class NavigationModel {
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
      const systemMap = new SystemMap(system)

      // Create/Update cache entry
      systemCache[systemName] = {
        ...system,
        ...systemMap
      }
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
        state: FSDJump?.SystemFaction?.FactionState ?? UNKNOWN_VALUE,
        distance: 0,
        isCurrentLocation: true
      }
    } else {
      // TODO if last jump was not to this system, check database (or do a
      // lookup via an API) to get most recent info for this system
      response = {
        ...response,
        distance: distance(response.position, FSDJump?.StarPos),
        isCurrentLocation: false
      }
    }

    return response
  }
}

module.exports = NavigationModel
