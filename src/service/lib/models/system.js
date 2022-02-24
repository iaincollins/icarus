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

  async getCurrentLocation () {
    // Get most recent Location event (written at startup and after respawn)
    const Location = await this.eliteLog.getEvent('Location')

    const currentLocation = {
      name: UNKNOWN_VALUE, // System Name
      mode: 'SHIP' // ENUM: [SHIP|SRV|FOOT|TAXI|MULTICREW]
    }

    if (!Location) return currentLocation

    const FSDJump = (await this.eliteLog.getEventsFromTimestamp('FSDJump', Location?.timestamp, 1))?.[0]

    // If there is an FSD Jump event more recent than the Location event
    // then use that for current location (note: they are formatted almost
    // the same way)
    const event = FSDJump || Location

    if (event.StarSystem) currentLocation.name = event.StarSystem
    if (event.StarPos) currentLocation.position = event.StarPos
    if (event.SystemAddress) currentLocation.address = event.SystemAddress

    if (event.InSRV) currentLocation.mode = 'SRV'
    if (event.OnFoot) currentLocation.mode = 'FOOT'
    if (event.Taxi) currentLocation.mode = 'TAXI'
    if (event.Multicrew) currentLocation.mode = 'MULTICREW'

    // Station is only set if docked
    if (event.Docked) currentLocation.docked = true
    if (event.StationName) currentLocation.station = event.StationName

    // Body can be a star or a planet
    if (event.Body) currentLocation.body = event.Body
    if (event.BodyType) currentLocation.bodyType = event.BodyType

    // Set if on (or near) a planet
    if (event.Latitude) currentLocation.latitude = event.Latitude
    if (event.Longitude) currentLocation.longitude = event.Longitude
    if (event.Altitude) currentLocation.altitude = event.Altitude

    // System information
    if (event.SystemAllegiance) currentLocation.allegiance = event.SystemAllegiance
    if (event.SystemGovernment_Localised || event.SystemGovernment) currentLocation.government = event.SystemGovernment_Localised || event.SystemGovernment
    if (event.SystemSecurity_Localised || event.SystemSecurity) currentLocation.government = event.SystemSecurity_Localised || event.SystemSecurity
    if (event.Population) currentLocation.population = event.Population
    if (event?.SystemFaction?.Name) currentLocation.faction = event.SystemFaction.Name
    if (event?.SystemFaction?.FactionState) currentLocation.state = event.SystemFaction.FactionState
    if (event.SystemEconomy_Localised || event.SystemEconomy) {
      currentLocation.economy = {
        primary: event.SystemEconomy_Localised || event.SystemEconomy
      }
      if (event.SystemSecondEconomy_Localised || event.SystemSecondEconomy) {
        currentLocation.economy.secondary = event.SystemSecondEconomy_Localised || event.SystemSecondEconomy
      }
    }

    // Not setting this until there is code to also work out when it has been cleared
    // if (event.Wanted) currentLocation.wanted = event.true

    return currentLocation
  }

  async getSystem ({ name = null, useCache = true } = {}) {
    const currentLocation = await this.getCurrentLocation()

    // If no system name was specified, get the star system the player is in
    const systemName = name?.trim() ?? currentLocation?.name ?? null

    // If no system name was provided don't know the players location
    if (!systemName || systemName === UNKNOWN_VALUE) {
      return {
        name: UNKNOWN_VALUE,
        unknownSystem: true
      }
    }

    // Check for entry in cache in case we have it already
    // Note: System names are unique (they can change, but will still be unique)
    // so is okay to use them as a key.
    if (!systemCache[systemName] || useCache === false) {
      // Get system from EDSM
      const system = await EDSM.system(systemName)

      // TODO Look up recent local data we have in the logs for bodies in the
      // system and merge data with about bodies and stations from EDSM,
      // overwriting data from EDSM with with more recent local where there are
      // conflicts.

      // Generate map data from the system data
      const systemMap = new SystemMap(system)

      // Create/Update cache entry with merged system and system map data
      systemCache[systemName] = {
        ...system,
        ...systemMap
      }
    }

    const cacheResponse = systemCache[systemName] // Get entry from cache

    // If we don't know what system this is, return empty object
    if (!cacheResponse.name || cacheResponse.name === UNKNOWN_VALUE) {
      return {
        name: systemName,
        unknownSystem: true
      }
    }

    if (systemName.toLowerCase() === currentLocation?.name?.toLowerCase()) {
      // Handle if this is the system the player is currently in
      return {
        ...cacheResponse,
        ...currentLocation,
        distance: 0,
        isCurrentLocation: true
      }
    } else {
      // Handle if this is not the system the player is currently in
      return {
        ...cacheResponse,
        distance: distance(cacheResponse?.position, currentLocation?.position),
        isCurrentLocation: false
      }
    }
  }
}

module.exports = NavigationModel
