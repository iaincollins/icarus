const EDSM = require('../edsm')
const SystemMap = require('../system-map')

const distance = require('../../../shared/distance')

class NavRoute {
  constructor ({ eliteLog, eliteJson, system }) {
    this.eliteLog = eliteLog
    this.eliteJson = eliteJson
    this.system = system

    return this
  }

  async getNavRoute () {
    const currentSystem = await this.system.getSystem()

    let inSystemOnRoute = false
    let jumpsToDestination = null

    const route = await Promise.all(
      ((await this.eliteJson.json())?.NavRoute?.Route ?? []).map(async (system) => {
        const distanceToHop = distance(currentSystem.position, system.StarPos)

        // Replaced logic as currentSystem.position (and hence distanceToHop)
        // is not known. Using the name like this should work, although there may
        // be edge cases where the names don't match, may have to watch for that.
        // const isCurrentSystem = (distanceToHop === 0)
        const isCurrentSystem = (system?.StarSystem?.toLowerCase() === currentSystem?.name?.toLowerCase())

        if (isCurrentSystem) { inSystemOnRoute = true }

        if (isCurrentSystem) {
          jumpsToDestination = 0
        } else {
          jumpsToDestination++
        }

        // Look up system in EDSM (if it's not alrady in cache) to see if it's
        // a previously explored system
        if (!global.CACHE.SYSTEMS[system.StarSystem.toLowerCase()]) {
          const systemFromESDM = await EDSM.system(system.StarSystem)
          const systemMap = new SystemMap(systemFromESDM)
          global.CACHE.SYSTEMS[system.StarSystem.toLowerCase()] = {
            ...systemFromESDM,
            ...systemMap
          }
        }
        const cacheResponse = global.CACHE.SYSTEMS[system.StarSystem.toLowerCase()]
        
        // FIXME Refactor this if how objects orbiting a null point changes
        // Currently there is always at least one "star" for a system, an 
        // object that is a placeholder for bodies not orbiting a star
        // (this is useful as as a placeholder for edge cases, such as if there
        // is data for a body but not for a star in ESDM, more likely with older
        // data as the scanner used to work differently)
        //
        // Note: Sometimes there is incomplete data for a system, so it may
        // have stars and planets mapped in EDSM but with incomplete data,
        // in which case we don't count it as explored.
        const isExplored = (cacheResponse?.stars?.length ?? 0) > 1

        return {
          system: system.StarSystem,
          address: system.SystemAddress,
          position: system.StarPos,
          starClass: system.StarClass,
          distance: distanceToHop,
          isCurrentSystem,
          numberOfStars: (cacheResponse?.stars?.length ?? 1) - 1,
          numberOfPlanets: (cacheResponse?.bodies?.length ?? 0) - ((cacheResponse?.stars?.length ?? 1) - 1),
          isExplored
        }
      })
    )

    const navRoute = {
      currentSystem,
      destination: route?.[route.length - 1] ?? [],
      jumpsToDestination,
      route,
      inSystemOnRoute
    }

    return navRoute
  }
}

module.exports = NavRoute
