const { UNKNOWN_VALUE } = require('../../shared/consts')

const os = require('os')
const fs = require('fs')
const path = require('path')

const pjXML = require('pjxml')
const sendKeys = require('sendkeys-js')
// const ioHook = require('iohook')

// ioHook.start(true)

// ioHook.on('keydown', (event) => {
//   console.log('keydown', event)
// })


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

            await sendKeys.activate('Elite - Dangerous (CLIENT)')

            // Special keys (Home, Insert, F1) need to be wrapped in {} - e.g. {f1}
            //await sendKeys.send(keyToUse?.length > 1 ? `{${keyToUse.toLowerCase()}}` : keyToUse)

            console.log('keycode.codes[keyToUse]', keyToUse, keycode.codes[keyToUse.toLowerCase()])
            KeyTap(keycode.codes[keyToUse.toLowerCase()]);
 
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



// https://stackoverflow.com/questions/41350341/using-sendinput-in-node-ffi
const keycode = require("keycode");
const ffi = require( "ffi-napi");
const ref = require( "ref-napi");
//const os = require( "os");
const import_Struct  = require( "ref-struct-di");

var arch = os.arch();
const Struct = import_Struct(ref);

var Input = Struct({
    "type": "int",

    // For some reason, the wScan value is only recognized as the wScan value when we add this filler slot.
    // It might be because it's expecting the values after this to be inside a "wrapper" substructure, as seen here:
    //     https://msdn.microsoft.com/en-us/library/windows/desktop/ms646270(v=vs.85).aspx
    "???": "int",
     
    "wVK": "short",
    "wScan": "short",
    "dwFlags": "int",
    "time": "int",
    "dwExtraInfo": "int64"
});

var user32 = ffi.Library("user32", {
    SendInput: ["int", ["int", Input, "int"]],
    MapVirtualKeyExA: ["uint", ["uint", "uint", "int"]],
});

const extendedKeyPrefix = 0xe000;
const INPUT_KEYBOARD = 1;
const KEYEVENTF_EXTENDEDKEY = 0x0001;
const KEYEVENTF_KEYUP       = 0x0002;
const KEYEVENTF_UNICODE     = 0x0004;
const KEYEVENTF_SCANCODE    = 0x0008;
//const MAPVK_VK_TO_VSC = 0;

class KeyToggle_Options {
    asScanCode = true;
    keyCodeIsScanCode = false;
    flags = 0;
    async = false; // async can reduce stutter in your app, if frequently sending key-events
}

let entry = new Input(); // having one persistent native object, and just changing its fields, is apparently faster (from testing)
entry.type = INPUT_KEYBOARD;
entry.time = 0;
entry.dwExtraInfo = 0;
function KeyToggle(keyCode, type = "down", options) {
    const opt = Object.assign({}, new KeyToggle_Options(), options);
    
    // scan-code approach (default)
    if (opt.asScanCode) {
        let scanCode = opt.keyCodeIsScanCode ? keyCode : ConvertKeyCodeToScanCode(keyCode);
        let isExtendedKey = (scanCode & extendedKeyPrefix) == extendedKeyPrefix;

        entry.dwFlags = KEYEVENTF_SCANCODE;
        if (isExtendedKey) {
            entry.dwFlags |= KEYEVENTF_EXTENDEDKEY;
        }

        entry.wVK = 0;
        entry.wScan = isExtendedKey ? scanCode - extendedKeyPrefix : scanCode;
    }
    // (virtual) key-code approach
    else {
        entry.dwFlags = 0;
        entry.wVK = keyCode;
        //info.wScan = 0x0200;
        entry.wScan = 0;
    }

    if (opt.flags != null) {
        entry.dwFlags = opt.flags;
    }
    if (type == "up") {
        entry.dwFlags |= KEYEVENTF_KEYUP;
    }

    if (opt.async) {
        return new Promise((resolve, reject)=> {
            user32.SendInput.async(1, entry, arch === "x64" ? 40 : 28, (error, result)=> {
                if (error) reject(error);
                resolve(result);
            });
        });
    }
    return user32.SendInput(1, entry, arch === "x64" ? 40 : 28);
}

function KeyTap(keyCode, opt) {
    KeyToggle(keyCode, "down", opt);
    KeyToggle(keyCode, "up", opt);
}

// function ConvertKeyCodeToScanCode(keyCode) {
//     return user32.MapVirtualKeyExA(keyCode, 0, 0);
// }

//https://pastebin.pl/view/f527be0e
// Scan-code for a char equals its index in this list. List based on: https://qb64.org/wiki/Scancodes, https://www.qbasic.net/en/reference/general/scan-codes.htm
// Not all keys are in this list, of course. You can add a custom mapping for other keys to the function below it, as needed.
let keys = "**1234567890-=**qwertyuiop[]**asdfghjkl;'`*\\zxcvbnm,./".split("");
function ConvertKeyCodeToScanCode(keyCode) {
  let keyChar = String.fromCharCode(keyCode).toLowerCase();
  let result = keys.indexOf(keyChar);
  console.assert(result != -1, `Could not find scan-code for key ${keyCode} (${keycode.names[keyCode]}).`)
  return result;
}

module.exports = EventHandlers
