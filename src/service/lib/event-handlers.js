const os = require('os')
const fs = require('fs')
const path = require('path')
// const pjXML = require('pjxml')
// const sendKeys = require('sendkeys-js')
// onst keycode = require('keycodes')
const { UNKNOWN_VALUE } = require('../../shared/consts')

const { BROADCAST_EVENT: broadcastEvent } = global

// const TARGET_WINDOW_TITLE = 'Elite - Dangerous (CLIENT)'
const KEYBINDS_DIR = path.join(os.homedir(), 'AppData', 'Local', 'Frontier Developments', 'Elite Dangerous', 'Options', 'Bindings')

// Prefer Keybinds v4 file
// TODO Check what version of game player has active
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

const PREFERENCES_DIR = path.join(os.homedir(), 'AppData', 'Local', 'ICARUS Terminal')
const PREFERENCES_FILE = path.join(PREFERENCES_DIR, 'Preferences.json')

const System = require('./event-handlers/system')
const ShipStatus = require('./event-handlers/ship-status')
const Materials = require('./event-handlers/materials')
const Blueprints = require('./event-handlers/blueprints')
const Engineers = require('./event-handlers/engineers')
const Inventory = require('./event-handlers/inventory')
const CmdrStatus = require('./event-handlers/cmdr-status')
const NavRoute = require('./event-handlers/nav-route')
const TextToSpeech = require('./event-handlers/text-to-speech')

class EventHandlers {
  constructor ({ eliteLog, eliteJson, preferences }) {
    this.eliteLog = eliteLog
    this.eliteJson = eliteJson
    this.preferences = preferences

    // TTS needs access to preferences (e.g. is tts on/off, which voice to)
    this.textToSpeech = new TextToSpeech({ eliteLog, eliteJson, preferences })

    this.system = new System({ eliteLog })
    this.shipStatus = new ShipStatus({ eliteLog, eliteJson })
    this.materials = new Materials({ eliteLog, eliteJson })
    this.engineers = new Engineers({ eliteLog, eliteJson })
    this.inventory = new Inventory({ eliteLog, eliteJson })
    this.cmdrStatus = new CmdrStatus({ eliteLog, eliteJson })

    // These handlers depend on calls to other handlers
    this.blueprints = new Blueprints({ engineers: this.engineers, materials: this.materials, shipStatus: this.shipStatus })
    this.navRoute = new NavRoute({ eliteLog, eliteJson, system: this.system })

    return this
  }

  // logEventHandler is fired on every in-game log event
  logEventHandler(logEvent) {
    this.textToSpeech.speechEventHandler(logEvent)
  }

  // Return handlers for events that are fired from the client
  getEventHandlers () {
    if (!this.eventHandlers) {
      this.eventHandlers = {
        getCmdr: async () => {
          const [LoadGame] = await this.eliteLog.getEvent('LoadGame')
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
        getEngineers: (args) => this.engineers.getEngineers(args),
        getCmdrStatus: (args) => this.cmdrStatus.getCmdrStatus(args),
        getBlueprints: (args) => this.blueprints.getBlueprints(args),
        getNavRoute: (args) => this.navRoute.getNavRoute(args),
        getPreferences: () => {
            return fs.existsSync(PREFERENCES_FILE) ? JSON.parse(fs.readFileSync(PREFERENCES_FILE)) : {}
        },
        setPreferences: (preferences) => {
          if (!fs.existsSync(PREFERENCES_DIR)) fs.mkdirSync(PREFERENCES_DIR, { recursive: true })
          fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(preferences))
          broadcastEvent('syncMessage', { name: 'preferences' })
          return preferences
        },
        getVoices: () => this.textToSpeech.getVoices(),
        speakText: ({text, voice}) => this.textToSpeech.speak(text, voice),
        toggleSwitch: async ({ switchName }) => {
          return false
          /*
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
            const primaryKey = convertEliteDangerousKeyBindingToInputKey(primaryElement?.attributes?.Key)
            const primaryElementModifier = doc.select(`//${KEYBIND_XML_ELEMENT}/Primary/Modifier`)
            const secondaryElement = doc.select(`//${KEYBIND_XML_ELEMENT}/Secondary`)
            const secondaryKey = convertEliteDangerousKeyBindingToInputKey(secondaryElement?.attributes?.Key)
            const secondaryElementModifier = doc.select(`//${KEYBIND_XML_ELEMENT}/Primary/Secondary`)

            let keyToSend, modifierKey
            if (primaryElement?.attributes?.Device === 'Keyboard') {
              keyToSend = primaryKey
              modifierKey = primaryElementModifier?.attributes?.Key.replace(/^Key_/, '')
            }

            // If the primary key has a modifer, and the secondary key doesn't
            // then we use the secondary key as the target key instead, as we
            // don't currently support sending modifier keys.
            if (modifierKey && primaryElement?.attributes?.Device === 'Keyboard') {
              if (!secondaryElementModifier) {
                  keyToSend = secondaryKey
                  modifierKey = null
                }
            }

            // If the secondary key is a single keystroke (with modifer) and the
            // primary key is not then prefer the secondary key as it's more
            // likely to work as it won't have to rely on special key mapping.
            if (primaryKey && secondaryKey && primaryKey.length > 1 && !secondaryElementModifier) {
              keyToSend = secondaryKey
              modifierKey = null
            }

            // TODO Support Control and Alt modifiers
            if (modifierKey?.toLowerCase()?.includes('shift')) modifierKey = 'shift'

            const keyAsKeycode = convertKeyToKeycode(keyToSend)
            //const modifierKeyAsKeycode =  keycode.codes[modifierKey?.toLowerCase()]

            console.log('KEYBINDS_MAP[switchName]', switchName, KEYBINDS_MAP[switchName])
            console.log('Key', keyToSend, keyAsKeycode) // modifierKey, modifierKeyAsKeycode)

            // Set Elite Dangerous as the active window
            await sendKeys.activate(TARGET_WINDOW_TITLE)

            // TODO Trigger SendInput (removed for now, being reworked)
            return true

          } catch (e) {
            console.error('ERROR_SENDING_KEY', switchName, e.toString())
            return false
          }
          */
        }
      }
    }
    return this.eventHandlers
  }
}

module.exports = EventHandlers
