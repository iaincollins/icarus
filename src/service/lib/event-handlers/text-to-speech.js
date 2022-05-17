const say = require('say')

class TextToSpeech {
  constructor ({ eliteLog, eliteJson, preferences }) {
    this.eliteLog = eliteLog
    this.eliteJson = eliteJson
    this.preferences = preferences || {}
    return this
  }

  async speak(text) {
    // TODO Only fire if Text To Speech enabled in preferences
    const voice = await this.getVoice()
    say.speak(text, voice)
  }

  speechEventHandler(message) {
    if (message.event === 'StartJump' && message.StarSystem) this.speak(`Jumping to ${message.StarSystem}`)
    if (message.event === 'FSDJump') this.speak(`Jump complete. Arrived in ${message.StarSystem}`)
    if (message.event === 'ApproachBody') this.speak(`Approaching ${message.Body}`)
    if (message.event === 'LeaveBody') this.speak(`Leaving ${message.Body}`)
    if (message.event === 'NavRoute') this.speak('New route plotted')
    if (message.event === 'DockingGranted') this.speak(`Docking at ${message.StationName}`)
    if (message.event === 'Docked') this.speak(`Docked at ${message.StationName}`)
    if (message.event === 'Undocked') this.speak(`Now leaving ${message.StationName}`)
    if (message.event === 'ApproachSettlement') this.speak(`Approaching ${message.Name}`)
    if (message.event === 'MarketBuy') this.speak(`Purchased ${message.Count} ${message.Count === 1 ? 'tonne' : `tonnes`} of ${message.Type_Localised || message.Type}`)
    if (message.event === 'MarketSell') this.speak(`Sold  ${message.Count} ${message.Count === 1 ? 'tonne' : `tonnes`} of  ${message.Type_Localised || message.Type}`)
    if (message.event === 'BuyDrones') this.speak(`Purchased ${message.Count} Limpet ${message.Count === 1 ? 'Drone' : `Drones`}`)
    if (message.event === 'SellDrones') this.speak(`Sold ${message.Count} Limpet ${message.Count === 1 ? 'Drone' : `Drones`}`)
    if (message.event === 'CargoDepot' && message.UpdateType === 'Collect') this.speak(`Collected ${message.Count} ${message.Count === 1 ? 'tonne' : `tonnes`} of ${message.CargoType.replace(/([a-z])([A-Z])/g, '$1 $2')}`)
    if (message.event === 'CargoDepot' && message.UpdateType === 'Deliver') this.speak(`Delivered  ${message.Count} ${message.Count === 1 ? 'tonne' : `tonnes`} of ${message.CargoType.replace(/([a-z])([A-Z])/g, '$1 $2')}`)
    if (message.event === 'Scanned') this.speak('Scan detected')
    if (message.event === 'FSSDiscoveryScan') {
      if (message.NonBodyCount > 0) {
        this.speak(`Discovery Scan Complete. ${message.BodyCount} ${message.BodyCount === 1 ? 'Body' : 'Bodies'} and ${message.NonBodyCount} other ${message.NonBodyCount === 1 ? 'signal source' : 'signal sources'} found in system.`)
      } else {
        this.speak(`Discovery Scan Complete. ${message.BodyCount} ${message.BodyCount === 1 ? 'Body' : 'Bodies'} found in system. No signal sources detected.`)
      }
    }
  }

  async getVoice() {
    if (this.preferences?.textToSpeech?.voice)
      return this.preferences.textToSpeech.voice

    return await this.getVoices()[0]
  }

  getVoices() {
    return new Promise(resolve =>
      say.getInstalledVoices((err, voices) => {
        resolve(voices)
      })
    )
  }
}

module.exports = TextToSpeech
