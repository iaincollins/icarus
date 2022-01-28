const CoriolisBlueprints = new (require('../data'))('edcd/coriolis/blueprints')

class BlueprintEvents {
  constructor ({ materialsEvents, shipEvents }) {
    this.materialsEvents = materialsEvents
    this.shipEvents = shipEvents
    return this
  }

  async getBlueprints () {
    const materials = await this.materialsEvents.getMaterials()
    const ship = await this.shipEvents.getShip()
    const blueprints = CoriolisBlueprints.data.map(blueprint => {
      const [first, second] = blueprint.symbol.split('_')
      const name = `${second} ${first}`.replace(/([a-z])([A-Z])/g, '$1 $2').replace('Misc', '').trim()

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
        appliedToModules: Object.values(ship?.modules ?? []).filter(module => module.engineering.symbol === blueprint.symbol)
      }
    })

    blueprints.sort((a, b) => a.name.localeCompare(b.name))

    return blueprints
  }
}

module.exports = BlueprintEvents
