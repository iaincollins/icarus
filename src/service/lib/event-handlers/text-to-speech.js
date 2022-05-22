const os = require('os')
const path = require('path')
const fs = require('fs')
const say = require('../say')

// FIXME Refactor Preferences handling into a singleton
const PREFERENCES_DIR = path.join(os.homedir(), 'AppData', 'Local', 'ICARUS Terminal')
const PREFERENCES_FILE = path.join(PREFERENCES_DIR, 'Preferences.json')

class TextToSpeech {
  constructor ({ eliteLog, eliteJson, cmdrStatus, shipStatus }) {
    this.eliteLog = eliteLog
    this.eliteJson = eliteJson
    this.cmdrStatus = cmdrStatus
    this.shipStatus = shipStatus

    this.currentCmdrStatus = null
    this.voiceAlertDebounce = null

    return this
  }

  async speak (text, voice, force) {
    // Only fire if Text To Speech voice has been selected in preferences
    const preferences = fs.existsSync(PREFERENCES_FILE) ? JSON.parse(fs.readFileSync(PREFERENCES_FILE)) : {}
    if (!force && !preferences?.voice) return
    const _voice = voice || preferences?.voice || (await this.getVoices())[0]

    // Only allow valid voice names (also combats potential shell escaping)
    if (!_voice || !(await this.getVoices()).includes(_voice)) return

    say.speak(text, _voice)
  }

  logEventHandler (logEvent) {
    if (logEvent.event === 'StartJump' && logEvent.StarSystem) this.speak(`Jumping to ${logEvent.StarSystem}`)
    if (logEvent.event === 'FSDJump') this.speak(`Jump complete. Arrived in ${logEvent.StarSystem}`)
    if (logEvent.event === 'ApproachBody') this.speak(`Approaching ${logEvent.Body}`)
    if (logEvent.event === 'LeaveBody') this.speak(`Leaving ${logEvent.Body}`)
    if (logEvent.event === 'NavRoute') this.speak('New route plotted')
    if (logEvent.event === 'DockingGranted') this.speak(`Docking at ${logEvent.StationName}`)
    if (logEvent.event === 'Docked') this.speak(`Docked at ${logEvent.StationName}`)
    if (logEvent.event === 'Undocked') this.speak(`Now leaving ${logEvent.StationName}`)
    if (logEvent.event === 'ApproachSettlement') this.speak(`Approaching ${logEvent.Name}`)
    if (logEvent.event === 'MarketBuy') this.speak(`Purchased ${logEvent.Count} ${logEvent.Count === 1 ? 'tonne' : 'tonnes'} of ${logEvent.Type_Localised || logEvent.Type}`)
    if (logEvent.event === 'MarketSell') this.speak(`Sold  ${logEvent.Count} ${logEvent.Count === 1 ? 'tonne' : 'tonnes'} of  ${logEvent.Type_Localised || logEvent.Type}`)
    if (logEvent.event === 'BuyDrones') this.speak(`Purchased ${logEvent.Count} Limpet ${logEvent.Count === 1 ? 'Drone' : 'Drones'}`)
    if (logEvent.event === 'SellDrones') this.speak(`Sold ${logEvent.Count} Limpet ${logEvent.Count === 1 ? 'Drone' : 'Drones'}`)
    if (logEvent.event === 'CargoDepot' && logEvent.UpdateType === 'Collect') this.speak(`Collected ${logEvent.Count} ${logEvent.Count === 1 ? 'tonne' : 'tonnes'} of ${logEvent.CargoType.replace(/([a-z])([A-Z])/g, '$1 $2')}`)
    if (logEvent.event === 'CargoDepot' && logEvent.UpdateType === 'Deliver') this.speak(`Delivered  ${logEvent.Count} ${logEvent.Count === 1 ? 'tonne' : 'tonnes'} of ${logEvent.CargoType.replace(/([a-z])([A-Z])/g, '$1 $2')}`)
    if (logEvent.event === 'Scanned') this.speak('Scan detected')
    if (logEvent.event === 'FSSDiscoveryScan') this.speak(`Discovery Scan Complete. ${logEvent.BodyCount} ${logEvent.BodyCount === 1 ? 'Body' : 'Bodies'} found in system.`)
  }

  async gameStateChangeHandler () {
    // TODO Refine so this logic is only evaluated on changes to Status.json
    const previousCmdStatus = JSON.parse(JSON.stringify(this.currentCmdrStatus))
    this.currentCmdrStatus = await this.cmdrStatus.getCmdrStatus()
    const shipStatus = await this.shipStatus.getShipStatus()

    // Only evaluate these if we are on board the ship, there is a previous
    // status (i.e. not at startup) and we have not recently alerted
    if (shipStatus?.onBoard && previousCmdStatus && !this.voiceAlertDebounce) {
      // TODO improve with better debounce function
      this.voiceAlertDebounce = true
      setTimeout(() => { this.voiceAlertDebounce = false }, 1000)

      // These functions handle changes to ship state
      if (this.currentCmdrStatus?.flags?.lightsOn !== previousCmdStatus?.flags?.lightsOn) {
        this.speak(this.currentCmdrStatus?.flags?.lightsOn ? 'Lights On' : 'Lights Off')
      }
      if (this.currentCmdrStatus?.flags?.nightVision !== previousCmdStatus?.flags?.nightVision) {
        this.speak(this.currentCmdrStatus?.flags?.nightVision ? 'Night Vision On' : 'Night Vision Off')
      }
      if (this.currentCmdrStatus?.flags?.cargoScoopDeployed !== previousCmdStatus?.flags?.cargoScoopDeployed) {
        this.speak(this.currentCmdrStatus?.flags?.cargoScoopDeployed ? 'Cargo Hatch Open' : 'Cargo Hatch Closed')
      }
      if (this.currentCmdrStatus?.flags?.landingGearDown !== previousCmdStatus?.flags?.landingGearDown) {
        this.speak(this.currentCmdrStatus?.flags?.landingGearDown ? 'Landing Gear Down' : 'Landing Gear Up')
      }
      if (this.currentCmdrStatus?.flags?.supercruise === false && this.currentCmdrStatus?.flags?.hardpointsDeployed !== previousCmdStatus?.flags?.hardpointsDeployed) {
        this.speak(this.currentCmdrStatus?.flags?.hardpointsDeployed ? 'Hardpoints Deployed' : 'Hardpoints Retracted')
      }
      if (this.currentCmdrStatus?.flags?.hudInAnalysisMode !== previousCmdStatus?.flags?.hudInAnalysisMode) {
        this.speak(this.currentCmdrStatus?.flags?.hudInAnalysisMode ? 'Analysis mode activated' : 'Combat mode activated')
      }
    }
  }

  async getVoice () {
    const preferences = fs.existsSync(PREFERENCES_FILE) ? JSON.parse(fs.readFileSync(PREFERENCES_FILE)) : {}
    if (preferences?.voice) return preferences.voice

    return await this.getVoices()[0]
  }

  getVoices () {
    return new Promise(resolve =>
      say.getInstalledVoices((err, voices) => {
        resolve(voices)
      })
    )
  }
}

module.exports = TextToSpeech
