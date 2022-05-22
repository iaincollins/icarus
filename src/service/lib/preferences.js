const os = require('os')
const path = require('path')
const fs = require('fs')

const PREFERENCES_FILE = 'Preferences.json'

class Preferences {
  getPreferences () {
    return fs.readSync(path.join(this.preferencesDir(), PREFERENCES_FILE))
  }

  savePreferences (preferencesObject) {
    return fs.writeSync(path.join(this.preferencesDir(), PREFERENCES_FILE), JSON.stringify(preferencesObject))
  }

  preferencesDir () {
    switch (os.platform()) {
      case 'win32': // Windows (all versions)
        return path.join(os.homedir(), 'AppData', 'Local', 'ICARUS Terminal')
      case 'darwin': // Mac OS
        return path.join(os.homedir(), 'Library', 'ICARUS Terminal')
      default: // Default to a location for some other form of unix
        return path.join(os.homedir(), '.icarus-terminal')
    }
  }
}

module.exports = new Preferences()
