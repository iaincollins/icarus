
// const EDCDMaterials = new (require('../data'))('edcd/fdevids/material')
const CoriolisBlueprints = new (require('../data'))('edcd/coriolis/blueprints')

class BlueprintEvents {
  async getBlueprints () {
    const blueprints = CoriolisBlueprints.data.map(blueprint => {
      const [first, second] = blueprint.symbol.split('_')
      const name = `${second} ${first}`.replace(/([a-z])([A-Z])/g, '$1 $2').replace('Misc', '').trim()

      return {
        symbol: blueprint.symbol,
        name: name,
        originalName: blueprint?.name,
        grades: Object.keys(blueprint.grades).map(k => {
          const grade = blueprint.grades[k]
          return {
            grade: parseInt(k),
            components: grade.components,
            features: grade.features
          }
        }),
        modules: blueprint.modulename
      }
    })

    blueprints.sort((a, b) => a.name.localeCompare(b.name))

    return blueprints
  }
}

module.exports = BlueprintEvents
