
const EDCDMaterials = new (require('../data'))('edcd/fdevids/material')
const CoriolisBlueprints = new (require('../data'))('edcd/coriolis/blueprints')

class BlueprintEvents {
  async getBlueprints () {
    const blueprints = CoriolisBlueprints.data.map(blueprint => {
      return {
        symbol: blueprint.symbol,
        name: blueprint.name,
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
    return blueprints
  }
}

module.exports = BlueprintEvents