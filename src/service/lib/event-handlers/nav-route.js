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

    let jumpsToDestination = null

    const route = ((await this.eliteJson.json())?.NavRoute?.Route ?? []).map(system => {
      const distanceToHop = distance(currentSystem.position, system.StarPos)
      const isCurrentSystem = (distanceToHop === 0)

      if (isCurrentSystem) {
        jumpsToDestination = 0
      } else if (isCurrentSystem !== null) {
        jumpsToDestination++
      }

      return {
        system: system.StarSystem,
        address: system.SystemAddress,
        position: system.StarPos,
        starClass: system.StarClass,
        distance: distanceToHop,
        isCurrentSystem
      }
    })

    const navRoute = {
      currentSystem,
      destination: route?.[route.length - 1] ?? [],
      jumpsToDestination,
      route
    }

    return navRoute
  }
}

module.exports = NavRoute
