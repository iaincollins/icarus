const EDCDOutfitting = new (require('../data'))('edcd/fdevids/outfitting')
const EDCDShipyard = new (require('../data'))('edcd/fdevids/shipyard')
const CoriolisBlueprints = new (require('../data'))('edcd/coriolis/blueprints')
const CoriolisModules = new (require('../data'))('edcd/coriolis/modules')
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
    let modules = {}

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
    loadoutModules.forEach(async module => {
      const slot = module.Slot
      if (!modules[slot]) modules[slot] = {}
      modules[slot].slot = module.Slot
      modules[slot].item = module.Item
      modules[slot].on = module.On
      modules[slot].health = module.Health
      modules[slot].value = module.Value

      // For passenger cabins, AmmoInClip refers to number of passengers
      if (slot.includes('PassengerCabin')) {
        modules[slot].passengers = module.AmmoInClip
      } else {
        modules[slot].ammoInClip = module.AmmoInClip
        modules[slot].ammoInHopper = module.AmmoInHopper
      }

      if (module?.Engineering) {
        // Enrich engineering data as we add it
        const blueprint = await CoriolisBlueprints.getBySymbol(module.Engineering.BlueprintName)
        modules[slot].engineering = {
          name: blueprint?.name ?? module.Engineering.BlueprintName?.replace(/_/g, ' ')?.replace(/([a-z])([A-Z])/g, '$1 $2')?.trim(),
          level: module.Engineering.Level,
          quality: module.Engineering.Quality,
          modifiers: module.Engineering.Modifiers.map(mod => {
            // Determine if change is better or worse and how much it differs
            let difference = ''
            let improvement = false
            if (mod.LessIsGood === 0) {
              if (mod.Value > mod.OriginalValue) {
                difference = `+${(mod.Value - mod.OriginalValue).toFixed(2)}`
                improvement = true
              } else {
                difference = `-${(mod.OriginalValue - mod.Value).toFixed(2)}`
              }
            } else {
              if (mod.Value < mod.OriginalValue) {
                difference = `-${(mod.OriginalValue - mod.Value).toFixed(2)}`
                improvement = true
              } else {
                difference = `+${(mod.Value - mod.OriginalValue).toFixed(2)}`
              }
            }
            if (mod.Value === mod.OriginalValue) difference = ''
            
            difference = difference.replace(/\.00$/, '').replace(/0$/, '')

            return {
              name: mod.Label.replace(/_/g, ' ')?.replace(/([a-z])([A-Z])/g, '$1 $2')?.trim(),
              value: mod.Value,
              originalValue: mod.OriginalValue,
              lessIsGood: mod.LessIsGood,
              difference,
              improvement
            }
          }),
          experimentalEffect: module.Engineering?.ExperimentalEffect_Localised?.replace(/_/g, ' ')?.replace(/([a-z])([A-Z])/g, '$1 $2')?.trim() ?? false,
          engineer: module.Engineering.Engineer,
          grades: blueprint?.grades ?? null
        }
      } else {
        modules[slot].engineering = false
      }
    })

    let armour = UNKNOWN_VALUE
    let totalModuleValue = 0
    let totalModulePowerDraw = 0
    for (const moduleName in modules) {
      const module = modules[moduleName]
      
      // As a fallback, use cleaned up version of internal symbol for name
      module.name = module.item
        .replace(/ Package$/, '') // Hull / Armour modules
        .replace(/int_/, '')
        .replace(/_size(.*?)$/g, ' ')
        .replace(/_/g, ' ')

      // Populate additional metadata for module by looking it up
      const outfittingModule = await EDCDOutfitting.getBySymbol(module.item)
      const coriolisModule = await CoriolisModules.getBySymbol(module.item)

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

      module.hardpoint = module.slot.includes('Hardpoint') ? true : false
      module.utility = module.slot.includes('TinyHardpoint') ? true : false

      // Keep running total of module cost and total power draw
      if (module.value) totalModuleValue += module.value
      if (module.power) totalModulePowerDraw += module.power

      if (coriolisModule) {
        // Just grab the first line of the description
        const [firstLine, junk] = (coriolisModule?.description ?? '').split('. ')
        module.description = ''
        if (firstLine) module.description = firstLine.replace(/\.$/, '')
      }

      module.slotName = module.slot.replace('_', ' ')
        .replace(/([0-9]+)/g, ' $1 ')
        .replace(/^Slot ([0-9]+) Size ([0-9]+)/g, '') // "(Max size: $2)")
        .replace(/ 0/g, ' ') // Leading zeros in numbers
        .replace(/Military ([0-9])/, 'Military slot $1')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^Tiny /, 'Utility ')
        .trim()
    }

    totalModulePowerDraw = totalModulePowerDraw.toFixed(2)

    const ship = await EDCDShipyard.getBySymbol(Loadout?.Ship)

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
