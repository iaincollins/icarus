
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

    if (!Materials) return []

    let materials = []

    await Promise.all(
      Materials?.Raw?.map(async (item) => {
        const EDCDMaterial = await EDCDMaterials.getBySymbol(item.Name)
        const materialUses = await MaterialUses.getBySymbol(item.Name)
        materials.push({
          symbol: item.Name,
          name: item?.Name_Localised ?? item.Name,
          type: 'Raw',
          count: item.Count,
          maxCount: materialGrades[EDCDMaterial?.rarity]?.maxCount ?? null,
          rarity: materialGrades[EDCDMaterial?.rarity].name ?? '',
          description: EDCDMaterial?.category ? `Category ${EDCDMaterial?.category}` : '',
          blueprints: materialUses?.blueprints ?? []
        })
      }) ?? []
    )

    await Promise.all(
      Materials?.Manufactured?.map(async (item) => {
        const EDCDMaterial = await EDCDMaterials.getBySymbol(item.Name)
        const materialUses = await MaterialUses.getBySymbol(item.Name)
        materials.push({
          symbol: item.Name,
          name: item?.Name_Localised ?? item.Name,
          type: 'Manufactured',
          count: item.Count,
          maxCount: materialGrades[EDCDMaterial?.rarity]?.maxCount ?? null,
          rarity: materialGrades[EDCDMaterial?.rarity].name ?? '',
          description: EDCDMaterial?.category ?? '',
          blueprints: materialUses?.blueprints ?? []
        })
      }) ?? []
    )

    await Promise.all(
      Materials?.Encoded?.map(async (item) => {
        const EDCDMaterial = await EDCDMaterials.getBySymbol(item.Name)
        const materialUses = await MaterialUses.getBySymbol(item.Name)
        materials.push({
          symbol: item.Name,
          name: item?.Name_Localised ?? item.Name,
          type: 'Encoded',
          count: item.Count,
          maxCount: materialGrades[EDCDMaterial?.rarity]?.maxCount ?? null,
          rarity: materialGrades[EDCDMaterial?.rarity].name ?? '',
          description: EDCDMaterial?.category ?? '',
          blueprints: materialUses?.blueprints ?? []
        })
      }) ?? []
    )

    // Get all MaterialCollected and MaterialDiscarded events since the last
    // Materials event was logged (Materials event is only logged at startup)
    const timestamp = Materials.timestamp
    const materialsCollected = await this.eliteLog.getEventsFromTimestamp('MaterialCollected', timestamp)
    const materialsDiscarded = await this.eliteLog.getEventsFromTimestamp('MaterialDiscarded', timestamp)

    // Combine all collected/discarded events, sort by timestamp and replay them
    // by modifying the material manifest recorded at startup (increasing,
    // decreasing or adding new materials as they are collected or discarded)
    const materialEvents = materialsCollected.concat(materialsDiscarded)
    materialEvents.sort((a, b) => Date.parse(a.timestamp) < Date.parse(b.timestamp) ? 1 : -1).reverse()

    await Promise.all(
      materialEvents.map(async (item) => {
        const symbol = item.Name
        const count = item.Count
        const eventName = item.event
        const material = materials.filter(m => m.symbol === symbol)[0] // Get existing reference to this material
        if (eventName === 'MaterialCollected') {
          if (material) {
            material.count += count
          } else {
            // If this is a material we do not have any of already, add it
            // in the same way we add materials above
            const EDCDMaterial = await EDCDMaterials.getBySymbol(item.Name)
            const materialUses = await MaterialUses.getBySymbol(item.Name)
            const description = item.Category === 'Raw'
              ? EDCDMaterial?.category ? `Category ${EDCDMaterial?.category}` : ''
              : EDCDMaterial?.category ?? ''

            materials.push({
              symbol: item.Name,
              name: item?.Name_Localised ?? item.Name,
              type: item.Category,
              count,
              maxCount: materialGrades[EDCDMaterial?.rarity]?.maxCount ?? null,
              rarity: materialGrades[EDCDMaterial?.rarity].name ?? '',
              description,
              blueprints: materialUses?.blueprints ?? []
            })
          }
        }
        if (eventName === 'MaterialDiscarded') {
          if (material) {
            material.count -= count
          } else {
            // This should never happen (can't discard material you don't have!)
          }
        }
      })
    )

    // Discard materials we don't have any of (e.g. have been discarded to zero)
    materials = materials.filter(item => item.count > 0)

    // Sort all materials by name (saves having to do it multiple times in UI)
    materials.sort((a, b) => a.name.localeCompare(b.name))

    return materials
  }
}

module.exports = MaterialsEvents
