const Outfitting = new (require('../data'))('outfitting')
const Shipyard = new (require('../data'))('shipyard')
const { UNKNOWN_VALUE } = require('../consts')

class ShipEvents {
  constructor ({ eliteLog, eliteJson }) {
    this.eliteLog = eliteLog
    this.eliteJson = eliteJson
    return this
  }

  async getShip () {
    const [LoadGame, Loadout, Json] = await Promise.all([
      this.eliteLog.getEvent('LoadGame'),
      this.eliteLog.getEvent('Loadout'),
      this.eliteJson.json()
    ])

    // Combine information from loadout and modules info to get info for
    // all modules fitted to the ship (including cosmetic and built-in)
    const loadoutModules = Loadout?.Modules ?? []
    const modulesInfoModules = Json?.ModulesInfo?.Modules ?? []
    const modules = {}

    // If Fuel does not exist, then we are on foot (and not on board)
    // If FuelMain exists but is zero, we are in an SVR (and not on board)
    // If FuelMain exists and greater than zero we are in a ship
    const onBoard = !!((Json?.Status?.Fuel?.FuelMain > 0 ?? false))

    // Load ModulesInfo JSON first (as a fallback), then overwrite with Loadout
    // as ModulesInfo is often stale (e.g. not updated after outfitting)
    modulesInfoModules.forEach(module => {
      const slot = module.Slot
      if (!modules[slot]) modules[slot] = {}
      modules[slot].slot = module.Slot
      modules[slot].item = module.Item
      modules[slot].power = module?.Power ?? false
      modules[slot].priority = module?.Priority ?? false
    })

    // Overwrites any module info from ModdulesInfo JSON as Loadout tends to
    // be correct but ModulesInfo is often stale
    loadoutModules.forEach(module => {
      const slot = module.Slot
      if (!modules[slot]) modules[slot] = {}
      modules[slot].slot = module.Slot
      modules[slot].item = module.Item
      modules[slot].on = module.On
      modules[slot].health = module.Health
      modules[slot].value = module.Value
      modules[slot].ammoInClip = module.AmmoInClip
      modules[slot].ammoInHopper = module.AmmoInHopper
      modules[slot].engineering = module?.Engineering ? module.Engineering : false
      modules[slot].engineeringLevel = module?.Engineering ? module.Engineering.Level : 0
    })

    let armour = 'UNKNOWN'
    let totalModuleValue = 0
    let totalModulePowerDraw = 0
    for (const moduleName in modules) {
      const module = modules[moduleName]
      module.name = module.item // Use internal symbol for name as fallback

      // Populate additional metadata for module by looking it up
      const outfittingModule = await Outfitting.getBySymbol(module.item)

      // Enrich module info with metadata, if we have it
      if (outfittingModule) {
        module.name = outfittingModule.name
        if (outfittingModule.class) module.class = outfittingModule.class
        if (outfittingModule.rating) module.rating = outfittingModule.rating
        if (outfittingModule.mount) module.mount = outfittingModule.mount
        if (outfittingModule.guidance) module.guidance = outfittingModule.guidance
      }

      // Each ship has exactly one armour module
      if (module.item.includes('_armour_')) armour = module.name

      // Internal modules start with int_
      if (module.item.startsWith('int_')) module.internal = true

      // Set module size based on slot name
      if (module.slot.includes('HugeHardpoint')) module.size = 'huge'
      if (module.slot.includes('LargeHardpoint')) module.size = 'large'
      if (module.slot.includes('MediumHardpoint')) module.size = 'medium'
      if (module.slot.includes('SmallHardpoint')) module.size = 'small'
      if (module.slot.includes('TinyHardpoint')) module.size = 'tiny' // Utilities

      // Keep running total of module cost and total power draw
      if (module.value) totalModuleValue += module.value
      if (module.power) totalModulePowerDraw += module.power
    }
    totalModulePowerDraw = totalModulePowerDraw.toFixed(2)

    const ship = await Shipyard.getBySymbol(Loadout?.Ship)

    return {
      type: ship?.name ?? Loadout?.Ship ?? UNKNOWN_VALUE,
      name: Loadout?.ShipName ?? UNKNOWN_VALUE,
      ident: Loadout?.ShipIdent ?? UNKNOWN_VALUE,
      pips: {
        systems: onBoard ? Json?.Status?.Pips?.[0] ?? UNKNOWN_VALUE : UNKNOWN_VALUE,
        engines: onBoard ? Json?.Status?.Pips?.[1] ?? UNKNOWN_VALUE : UNKNOWN_VALUE,
        weapons: onBoard ? Json?.Status?.Pips?.[2] ?? UNKNOWN_VALUE : UNKNOWN_VALUE
      },
      fuelLevel: Json?.Status?.Fuel?.FuelMain ?? UNKNOWN_VALUE,
      fuelCapacity: LoadGame?.FuelCapacity ?? UNKNOWN_VALUE,
      maxJumpRange: Loadout?.MaxJumpRange ?? UNKNOWN_VALUE,
      modulePowerDraw: totalModulePowerDraw,
      moduleValue: totalModuleValue,
      rebuy: Loadout?.Rebuy ?? UNKNOWN_VALUE,
      armour,
      cargo: {
        capacity: Loadout?.CargoCapacity ?? UNKNOWN_VALUE,
        count: onBoard ? Json?.Cargo?.Count ?? UNKNOWN_VALUE : UNKNOWN_VALUE,
        inventory: (onBoard && Json?.Cargo?.Inventory)
          ? Json.Cargo.Inventory.map(item => ({
              type: item?.Name ?? UNKNOWN_VALUE,
              name: item?.Name_Localised ?? item?.Name ?? UNKNOWN_VALUE,
              count: item?.Count ?? UNKNOWN_VALUE,
              stolen: item?.Stolen ?? UNKNOWN_VALUE
            }))
          : UNKNOWN_VALUE
      },
      onBoard,
      modules
    }
  }
}

module.exports = ShipEvents
