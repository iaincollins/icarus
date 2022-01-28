
const EDCDMaterials = new (require('../data'))('edcd/fdevids/material')
const MaterialUses = new (require('../data'))('material-uses')

const materialGrades = {
  1: {
    name: 'Very Common',
    maxCount: 300
  },
  2: {
    name: 'Common',
    maxCount: 250
  },
  3: {
    name: 'Standard',
    maxCount: 200
  },
  4: {
    name: 'Rare',
    maxCount: 150
  },
  5: {
    name: 'Very Rare',
    maxCount: 100
  }
}

class MaterialsEvents {
  constructor ({ eliteLog, eliteJson }) {
    this.eliteLog = eliteLog
    this.eliteJson = eliteJson
    return this
  }

  async getMaterials () {
    const [Materials] = await Promise.all([
      this.eliteLog.getEvent('Materials')
    ])

    const materials = []
    let materialsInventory = []
    if (Materials?.Raw) materialsInventory = materialsInventory.concat(Materials?.Raw)
    if (Materials?.Manufactured) materialsInventory = materialsInventory.concat(Materials?.Manufactured)
    if (Materials?.Encoded) materialsInventory = materialsInventory.concat(Materials?.Encoded)

    EDCDMaterials.data.forEach(material => {
      const materialUses = MaterialUses.getBySymbol(material.symbol)
      const materialInInventory = materialsInventory.filter(m => m.Name.toLowerCase() === material.symbol.toLowerCase())[0] // Get existing reference to this material
      const type = material.category === 'None' ? 'Xeno' : material.type

      let category = (material?.type === 'Raw') ? `Category ${material?.category}` : material?.category
      if (material.category === 'None') category = material.type

      materials.push({
        symbol: material.symbol,
        name: material.name,
        type,
        grade: material?.rarity ?? 0,
        rarity: materialGrades[material?.rarity].name ?? '',
        count: materialInInventory?.Count ?? 0,
        maxCount: materialGrades[material?.rarity]?.maxCount ?? null,
        category,
        blueprints: materialUses?.blueprints ?? []
      })
    })

    // Get all MaterialCollected and MaterialDiscarded events since the last
    // Materials event was logged (Materials event is only logged at startup)
    const timestamp = Materials?.timestamp
    const materialsCollected = await this.eliteLog.getEventsFromTimestamp('MaterialCollected', timestamp)
    const materialsDiscarded = await this.eliteLog.getEventsFromTimestamp('MaterialDiscarded', timestamp)
    const engineeringCrafted = await this.eliteLog.getEventsFromTimestamp('EngineerCraft', timestamp)

    // Combine all collected/discarded events, sort by timestamp and replay them
    // by modifying the material manifest recorded at startup (increasing,
    // decreasing or adding new materials as they are collected or discarded)
    const materialEvents = materialsCollected.concat(materialsDiscarded).concat(engineeringCrafted)
    materialEvents.sort((a, b) => Date.parse(a.timestamp) < Date.parse(b.timestamp) ? 1 : -1).reverse()

    for (const materialEvent of materialEvents) {
      const material = materials.filter(m => m.symbol.toLowerCase() === materialEvent.Name.toLowerCase())[0] // Get existing reference to this material
      if (!material) {
        console.log('Failed to handle event for unknown material', materialEvent)
        continue
      }
      if (materialEvent.event === 'MaterialCollected') {
        material.count += materialEvent.Count
      } else if (materialEvent.event === 'MaterialDiscarded') {
        material.count -= materialEvent.Count
      } else if (materialEvent.event === 'EngineerCraft') {
        materialEvent.Ingredients.forEach(ingredient => {
          const craftingMaterial = materials.filter(m => m.symbol.toLowerCase() === ingredient.Name.toLowerCase())[0] // Get existing reference to this material
          craftingMaterial.count -= materialEvent.Count
        })
      }
    }

    // Sort all materials by name (to reduce effort required in UI)
    materials.sort((a, b) => a.name.localeCompare(b.name))

    return materials
  }
}

module.exports = MaterialsEvents
