const { UNKNOWN_VALUE } = require('../../shared/consts')

const System = require('./event-handlers/system')
const ShipStatus = require('./event-handlers/ship-status')
const Materials = require('./event-handlers/materials')
const Blueprints = require('./event-handlers/blueprints')
const Inventory = require('./event-handlers/inventory')
const CmdrStatus = require('./event-handlers/cmdr-status')
const NavRoute = require('./event-handlers/nav-route')

class EventHandlers {
  constructor ({ eliteLog, eliteJson }) {
    this.eliteLog = eliteLog
    this.eliteJson = eliteJson

    this.system = new System({ eliteLog })
    this.shipStatus = new ShipStatus({ eliteLog, eliteJson })
    this.materials = new Materials({ eliteLog, eliteJson })
    this.inventory = new Inventory({ eliteLog, eliteJson })
    this.cmdrStatus = new CmdrStatus({ eliteLog, eliteJson })

    this.blueprints = new Blueprints({ materials: this.materials, shipStatus: this.shipStatus })
    this.navRoute = new NavRoute({ eliteLog, eliteJson, system: this.system })

    return this
  }

  getEventHandlers () {
    if (!this.eventHandlers) {
      this.eventHandlers = {
        getCmdr: async () => {
          const [LoadGame] = await Promise.all([this.eliteLog.getEvent('LoadGame')])
          return {
            commander: LoadGame?.Commander ?? UNKNOWN_VALUE,
            credits: LoadGame?.Credits ?? UNKNOWN_VALUE
          }
        },
        getLogEntries: async ({ count = 100, timestamp }) => {
          if (timestamp) {
            return await this.eliteLog.getFromTimestamp(timestamp)
          } else {
            return await this.eliteLog.getNewest(count)
          }
        },
        getSystem: (args) => this.system.getSystem(args),
        getShipStatus: (args) => this.shipStatus.getShipStatus(args),
        getMaterials: (args) => this.materials.getMaterials(args),
        getInventory: (args) => this.inventory.getInventory(args),
        getCmdrStatus: (args) => this.cmdrStatus.getCmdrStatus(args),
        getBlueprints: (args) => this.blueprints.getBlueprints(args),
        getNavRoute: (args) => this.navRoute.getNavRoute(args)
      }
    }
    return this.eventHandlers
  }
}

module.exports = EventHandlers
