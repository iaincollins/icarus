const System = require('./system')

class CmdrStatus {
  constructor ({ eliteJson, eliteLog }) {
    this.eliteJson = eliteJson
    this.eliteLog = eliteLog
    this.system = new System({ eliteLog })
    this.flags = {
      docked: 1,
      landed: 2,
      landingGearDown: 4,
      shieldsUp: 8,
      supercruise: 16,
      flightAssistOff: 32,
      hardpointsDeployed: 64,
      inWing: 128,
      lightsOn: 256,
      cargoScoopDeployed: 512,
      slientRunning: 1024,
      scoopingFuel: 2048,
      srvHandbrake: 4096,
      srvUsignTurrentView: 8192,
      srvTurretRetracted: 16384,
      srvDriveAssist: 32768,
      fsdMassLocked: 65536,
      fsdCharging: 131072,
      fsdCooldown: 262144,
      lowFuel: 524288, // < 25%
      overHeating: 1048576, // > 100%
      hasLatLon: 2097152,
      inDanger: 4194304,
      beingInterdicted: 8388608,
      inMainShip: 16777216,
      inFighter: 33554432,
      inSrv: 67108864,
      hudInAnalysisMode: 134217728,
      nightVision: 268435456,
      altitudeFromAverageRadius: 536870912,
      fsdJump: 1073741824,
      srvHighBeam: 2147483648
    }
    this.flags2 = {
      onFoot: 1,
      inTaxi: 2,
      inMulticrew: 4,
      onFootInStation: 8,
      onFootInPlanet: 16,
      aimDownSight: 32,
      lowOxygen: 64,
      lowHealth: 128,
      cold: 256,
      hot: 512,
      veryCold: 1024,
      veryHot: 2048,
      glideMode: 4096,
      onFootInHanger: 8192,
      onFootSocialSpace: 16384,
      onFootExterior: 32768,
      breathableAtmosphere: 65536
    }
    return this
  }

  getFlag (flags, flag) {
    return (flags & flag) !== 0
  }

  async getStatusFlags (StatusJson) {
    const statusFlags = {}

    for (const flag of Object.keys(this.flags)) {
      if (StatusJson?.Flags) {
        statusFlags[flag] = this.getFlag(StatusJson.Flags, this.flags[flag])
      } else {
        statusFlags[flag] = false
      }
    }

    for (const flag of Object.keys(this.flags2)) {
      if (StatusJson?.Flags2) {
        statusFlags[flag] = this.getFlag(StatusJson.Flags2, this.flags2[flag])
      } else {
        statusFlags[flag] = false
      }
    }

    return statusFlags
  }

  async getCmdrStatus () {
    const StatusJson = (await this.eliteJson.json()).Status
    const currentSystem = await this.system.getSystem()

    const cmdrStatus = {}

    if (StatusJson) {
      for (const key of Object.keys(StatusJson)) {
        // Ignore these properties
        if (['event', 'timestamp', 'Flags', 'Flags2'].includes(key)) continue
        cmdrStatus[key.toLowerCase()] = StatusJson[key]
      }
    }

    // Parse and combine Flags and Flags2 into boolean key/value pairs
    cmdrStatus.flags = await this.getStatusFlags(StatusJson)

    // Override bad flag behaviour
    // If you are in a taxi you are by definition not in your main ship!
    if (cmdrStatus.flags.inTaxi) cmdrStatus.flags.inMainShip = false

    // Determine current location

    /*
    cmdrStatus.location = {
      name: [],
      system: null,
      planet: null,
      facility: null,
    }
    */

    const location = []

    // We use Body Name >
    if (cmdrStatus?.bodyname) location.push(cmdrStatus.bodyname)

    const dockedEvent = await this.eliteLog.getEvent('Docked')
    const embarkEvent = await this.eliteLog.getEvent('Embark')
    const touchdownEvent = await this.eliteLog.getEvent('Touchdown')
    const supercruiseExitEvent = await this.eliteLog.getEvent('SupercruiseExit')

    if (cmdrStatus?.flags?.onFootInPlanet) {
      if (cmdrStatus?.flags?.onFootSocialSpace) {
        // If on foot on a planet and in a social space we are at a port
        if (dockedEvent && dockedEvent.StationName && dockedEvent?.StarSystem === currentSystem?.name) {
          location.push(dockedEvent.StationName)
        }
      } else {
        // If not in a social space then we are at a settlement
        if (dockedEvent && dockedEvent.StationName && dockedEvent?.StarSystem === currentSystem?.name) {
          if (touchdownEvent && Date.parse(touchdownEvent?.timestamp) > Date.parse(dockedEvent?.timestamp)) {
            if (touchdownEvent?.NearestDestination) location.push(touchdownEvent.NearestDestination)
          } else {
            location.push(dockedEvent.StationName)
          }
        }
      }
    }

    if (cmdrStatus?.flags?.onFootInStation || cmdrStatus?.flags?.onFootInPlanet) {
      if (cmdrStatus?.flags?.onFootInHanger) {
        location.push('Hanger')
      } else if (cmdrStatus?.flags?.onFootSocialSpace) {
        location.push('Station')
      }
    }

    if (cmdrStatus?.flags?.docked && cmdrStatus?.flags?.onFoot === false) {
      // If docked and not on foot get the last Embark/Docked event to find out what station we are on
      if (!dockedEvent && embarkEvent?.StationName) location.push(embarkEvent.StationName)
      if (!embarkEvent && dockedEvent?.StationName) location.push(dockedEvent.StationName)
      if (!embarkEvent && !dockedEvent && touchdownEvent?.NearestDestination) location.push(touchdownEvent.NearestDestination)

      if (dockedEvent && embarkEvent) {
        if (touchdownEvent &&
            Date.parse(touchdownEvent?.timestamp) > Date.parse(dockedEvent?.timestamp) &&
            Date.parse(touchdownEvent?.timestamp) > Date.parse(embarkEvent?.timestamp)
        ) {
          if (touchdownEvent?.NearestDestination) location.push(touchdownEvent.NearestDestination)
        } else if (embarkEvent?.StationName && dockedEvent?.StationName) {
          // If we have both a Docked event and an Embark event with a station
          // name, use the newest value
          if (Date.parse(dockedEvent?.timestamp) > Date.parse(embarkEvent?.timestamp)) {
            location.push(dockedEvent.StationName)
          } else {
            location.push(embarkEvent.StationName)
          }
        } else if (dockedEvent?.StationName) {
          // If the Embark event doesn't have a Station Name we fallback to Docked event
          // This can happen when embarking at a settlement (even when on a landing pad,
          // the Embark event when at a Settlement is not always populated).
          // FIXME As a simple sanity check, we at least verify the event was
          // triggered in the same system (crude, but hopefully good enough).
          if (dockedEvent?.StarSystem === currentSystem?.name) {
            location.push(dockedEvent.StationName)
          }
        }
      }
    }

    // If we are not in supercruise, not docked and not landed then we are in space
    // If the last Supercruise Exit event matches the current system (it should)
    // then use the Body from that event as our location, if we don't already know our
    // location. This is useful for scenarios like exiting supercruise near a station
    // as otherwise the game doesn't know where we are. Note that it returns the
    // name of the station as a Body (with BodyType: Station) and does not
    // specify Station Name as you migth expect.
    if (cmdrStatus?.flags?.supercruise === false && cmdrStatus?.flags?.docked === false && cmdrStatus?.flags?.landed === false) {
      if (supercruiseExitEvent?.Body && supercruiseExitEvent?.StarSystem === currentSystem?.name) {
        if (!location.includes(supercruiseExitEvent.Body)) location.push(supercruiseExitEvent.Body)
      }
    }

    // If we don't have a more specific location (planet, station) use the
    // system name as the location
    if (location.length === 0 && currentSystem?.name) {
      location.push(currentSystem.name)
    }

    if (cmdrStatus?.flags?.inTaxi) {
      if (cmdrStatus?.flags?.docked) {
        // If we are in a taxi that is docked at our destination, get the station name
        if (dockedEvent?.StationName && dockedEvent.StationName === cmdrStatus?.destination?.Name) {
          if (!location.includes(dockedEvent.StationName)) location.push(dockedEvent.StationName)
        }
      }
      // Indicate that we are onboard a shuttle (e.g. Apex, Frontline Solutions)
      location.push('Shuttle')
    }
    cmdrStatus._location = location

    return cmdrStatus
  }
}

module.exports = CmdrStatus
