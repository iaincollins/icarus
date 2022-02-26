class CmdrStatusModel {
  flags = {
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
  
  flags2 = {
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

  constructor ({ eliteJson }) {
    this.eliteJson = eliteJson
    return this
  }

  getFlag(flags, flag) {
    return (flags & flag) !== 0
  }

  async getStatusFlags(StatusJson) {
    let statusFlags = {}
  
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

  async getCmdrStatus() {
    const StatusJson = (await this.eliteJson.json()).Status

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

    return cmdrStatus
  }
  
}

module.exports = CmdrStatusModel