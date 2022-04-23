const { UNKNOWN_VALUE } = require('../../shared/consts')

const os = require('os')
const fs = require('fs')
const path = require('path')

const pjXML = require('pjxml')
const sendKeys = require('sendkeys-js')

const KEYBINDS_DIR = path.join(os.homedir(), 'AppData', 'Local', 'Frontier Developments', 'Elite Dangerous', 'Options', 'Bindings')

// Prefer Keybinds v4 file
// TODO Check what version of game player has active!
const KEYBINDS_FILE_V3 = path.join(KEYBINDS_DIR, 'Custom.3.0.binds') // Horizons
const KEYBINDS_FILE_V4 = path.join(KEYBINDS_DIR, 'Custom.4.0.binds') // Odyssey

// Map ICARUS Terminal names to in-game keybind names
const KEYBINDS_MAP = {
  lights: 'ShipSpotLightToggle',
  nightVision: 'NightVisionToggle',
  landingGear: 'LandingGearToggle',
  cargoHatch: 'ToggleCargoScoop',
  hardpoints: 'DeployHardpointToggle'
}

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
        getNavRoute: (args) => this.navRoute.getNavRoute(args),
        toggleSwitch: async ({switchName}) => {
          // TODO Refactor this out into a dedicated library
          try {
            let KEYBINDS_FILE
            const KEYBIND_XML_ELEMENT = KEYBINDS_MAP[switchName]

            if (fs.existsSync(KEYBINDS_FILE_V4)) {
              KEYBINDS_FILE = KEYBINDS_FILE_V4
            } else if (fs.existsSync(KEYBINDS_FILE_V3)) {
              KEYBINDS_FILE = KEYBINDS_FILE_V3
            }

            const keyBinds = fs.readFileSync(KEYBINDS_FILE).toString()

            const doc = pjXML.parse(keyBinds)
            const primaryElement = doc.select(`//${KEYBIND_XML_ELEMENT}/Primary`)
            const secondaryElement = doc.select(`//${KEYBIND_XML_ELEMENT}/Secondary`)
            let keyToUse

            if (primaryElement?.attributes?.Device === 'Keyboard') {
              keyToUse = primaryElement?.attributes?.Key.replace(/^Key_/, '')
            } else if (secondaryElement?.attributes?.Device === 'Keyboard') {
              keyToUse = secondaryElement?.attributes?.Key.replace(/^Key_/, '')
            }

            // TODO I'm sure there are more of these special cases...
            if (keyToUse.toLowerCase() === 'semicolon') keyToUse = ';'

            // Special keys (Home, Insert, F1) need to be wrapped in {} - e.g. {f1}
            await sendKeys.send(keyToUse?.length > 1 ? `{${keyToUse.toLowerCase()}}` : keyToUse)
            return true
          } catch (e) {
            console.error('ERROR_SENDING_KEY', switchName, e.toString())
            return false
          }
        }
      }
    }
    return this.eventHandlers
  }
}


module.exports = EventHandlers
