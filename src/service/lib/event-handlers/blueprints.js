const DataLoader = require('../data')
const coriolisBlueprints = new DataLoader('edcd/coriolis/blueprints').data

class Blueprints {
  constructor ({ engineers, materials, shipStatus }) {
    this.engineers = engineers
    this.materials = materials
    this.shipStatus = shipStatus
    return this
  }

  async getBlueprints () {
    const engineers = await this.engineers.getEngineers()
    const materials = await this.materials.getMaterials()
    const ship = await this.shipStatus.getShipStatus()
    const blueprints = coriolisBlueprints.map(blueprint => {
      const [first, second] = blueprint.symbol.split('_')
      const name = `${second} ${first}`.replace(/([a-z])([A-Z])/g, '$1 $2').replace('Misc', 'Utility').trim()

      // FIXME Could do with optimising (not urgent)
      for (const engineerName in blueprint.engineers) {
        const engineer = engineers?.filter(e => e.name.toLowerCase().trim() === engineerName.toLowerCase().trim())?.[0]

        // May fail to look them up if app is still loading when called
        if (!engineer) {
          console.error('Failed to lookup engineer', engineerName)
          continue
        }

        blueprint.engineers[engineerName] = {
          ...blueprint.engineers[engineerName],
          system: engineer.system.name,
          location: engineer.system.position,
          rank: engineer.progress.rank,
          progress: engineer.progress.status
        }
      }

      return {
        symbol: blueprint.symbol,
        name: name,
        originalName: blueprint?.name,
        grades: Object.keys(blueprint.grades).map(k => {
          const grade = blueprint.grades[k]
          const components = Object.keys(grade.components).map(component => {
            const material = materials.filter(m => m.name.toLowerCase() === component.toLowerCase())?.[0] ?? { name: component }
            const cost = grade.components[component]
            return {
              ...material,
              cost
            }
          }).sort((a, b) => a.grade < b.grade ? -1 : 0)

          return {
            grade: parseInt(k),
            components: components,
            features: grade.features
          }
        }),
        modules: blueprint.modulename,
        appliedToModules: Object.values(ship?.modules ?? []).filter(module => module?.engineering?.symbol === blueprint?.symbol),
        engineers: blueprint.engineers
      }
    })

    blueprints.sort((a, b) => a.name.localeCompare(b.name))

    return blueprints
  }
}

module.exports = Blueprints
