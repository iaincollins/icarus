const EDSM = require('../edsm')
const SystemMap = require('../system-map')
const { UNKNOWN_VALUE } = require('../../../shared/consts')
const distance = require('../../../shared/distance')

class System {
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

    // If no system name was provided amd we don't know the players location
    if (!systemName || systemName === UNKNOWN_VALUE) {
      return {
        name: UNKNOWN_VALUE,
        unknownSystem: true
      }
    }

    // Check for entry in cache in case we have it already
    // Note: System names are unique (they can change, but will still be unique)
    // so is okay to use them as a key.
    if (!global.CACHE.SYSTEMS[systemName.toLowerCase()] || useCache === false) {
      // Get system from EDSM
      const system = await EDSM.system(systemName)

      // TODO Look up recent local data we have in the logs for bodies in the
      // system and merge data with about bodies and stations from EDSM,
      // overwriting data from EDSM with with more recent local where there are
      // conflicts.

      // Merge in local scan data with information about the body
      if (system?.bodies) {
        for (const body of system.bodies) {
          body.signals = {
            geological: 0,
            biological: 0,
            human: 0
          }
          
          // Merge in body signal scan data
          const FSSBodySignals = await this.eliteLog._query({ event: 'FSSBodySignals', BodyName: body.name }, 1)
          if (FSSBodySignals[0]?.Signals) {
            ;(FSSBodySignals[0]?.Signals).map(signal => {
              if (signal?.Type === '$SAA_SignalType_Geological;') {
                body.signals.geological = signal?.Count ?? 0
              }
              if (signal?.Type === '$SAA_SignalType_Biological;') {
                body.signals.biological = signal?.Count ?? 0
              }
              if (signal?.Type === '$SAA_SignalType_Human;') {
                body.signals.human = signal?.Count ?? 0
              }
            })
          }

          // Merge in surface scan data
          const SAASignalsFound = await this.eliteLog._query({ event: 'SAASignalsFound', BodyName: body.name }, 1)
          if (SAASignalsFound[0]?.Signals) {
            ;(SAASignalsFound[0]?.Signals).map(signal => {
              if (signal?.Type === '$SAA_SignalType_Geological;') {
                body.signals.geological = signal?.Count ?? 0
              }
              if (signal?.Type === '$SAA_SignalType_Biological;') {
                body.signals.biological = signal?.Count ?? 0
              }
              if (signal?.Type === '$SAA_SignalType_Human;') {
                body.signals.human = signal?.Count ?? 0
              }
            })
          }

          // If we have data from a surface scan about the plants, merge it
          if (body.signals.biological > 0 && SAASignalsFound[0]?.Genuses) {
            body.biologicalGenuses = []
            ;(SAASignalsFound[0]?.Genuses).map(biologicalSamples => {
              body.biologicalGenuses.push(biologicalSamples.Genus_Localised)
            })
          }

          // Only log discovered / mapped if in an unhabited system
          // FIXME Suspect this logic isn't entirely correct
          const inhabitedSystem = (system?.population > 0 || system?.stations?.length > 0 || system?.ports?.length > 0 || system?.megaships?.length > 0 || system?.settlements?.length > 0)
          if (!inhabitedSystem) {
            const Scan = await this.eliteLog._query({ event: 'Scan', BodyName: body.name }, 1)
            body.discovered = Scan[0]?.WasDiscovered ?? false
            body.mapped = Scan[0]?.WasMapped ?? false

            // If there is an SAAScanComplete entry for the body, it has been scanned
            // (even if the Scan entry says it has not, because it's old data)
            const SAAScanComplete = await this.eliteLog._query({ event: 'SAAScanComplete', BodyName: body.name }, 1)
            if (SAAScanComplete[0]?.BodyName) body.mapped = true
          }
        }
      }


      // Generate map data from the system data
      const systemMap = new SystemMap(system)

      // Create/Update cache entry with merged system and system map data
      global.CACHE.SYSTEMS[systemName.toLowerCase()] = {
        ...system,
        ...systemMap
      }
    }

    const cacheResponse = global.CACHE.SYSTEMS[systemName.toLowerCase()] // Get entry from cache

    // Determine how many bodies we actaully know of in the current system, and
    // how many we think there are based on FSS Discovery Scan
    let numberOfBodiesFound = cacheResponse?.bodies?.length ?? 0
    let numberOfBodiesInSystem = numberOfBodiesFound // We start with this value (until we know otherwise)
    let scanPercentComplete = null

    if (cacheResponse.name && cacheResponse.name !== UNKNOWN_VALUE) {
      // If we have an FSSDiscoveryScan result with a BodyCount then we can estimate
      // percentage of the system that has been scanned
      const FSSDiscoveryScan = await this.eliteLog._query({ event: 'FSSDiscoveryScan', SystemName: cacheResponse.name }, 1)
      if (FSSDiscoveryScan?.[0]?.BodyCount) {
        numberOfBodiesInSystem = FSSDiscoveryScan?.[0]?.BodyCount
        scanPercentComplete = Math.floor((numberOfBodiesFound / numberOfBodiesInSystem) * 100)
      }
    }

    // If we don't know what system this is return what we have
    if (!cacheResponse.name || cacheResponse.name === UNKNOWN_VALUE) {
      const isCurrentLocation = (systemName.toLowerCase() === currentLocation?.name?.toLowerCase())

      const response = {
        name: systemName,
        unknownSystem: true,
        isCurrentLocation,
        scanPercentComplete,
        _cacheTimestamp: new Date().toISOString()
      }

      if (isCurrentLocation && currentLocation?.position && currentLocation?.address) {
        response.position = currentLocation.position
        response.address = currentLocation.address
        response.distance = 0
      }

      return response
    }

    if (systemName.toLowerCase() === currentLocation?.name?.toLowerCase()) {
      // Handle if this is the system the player is currently in
      return {
        ...cacheResponse,
        ...currentLocation,
        distance: 0,
        isCurrentLocation: true,
        scanPercentComplete,
        _cacheTimestamp: new Date().toISOString()
      }

    } else {
      // Handle if this is not the system the player is currently in
      return {
        ...cacheResponse,
        distance: distance(cacheResponse?.position, currentLocation?.position),
        isCurrentLocation: false,
        scanPercentComplete,
        _cacheTimestamp: new Date().toISOString()
      }
    }
  }
}

module.exports = System
