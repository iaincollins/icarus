// Convert files from raw data to useable / enriched JSON
const glob = require('glob')
const csv = require('csvtojson')
const fs = require('fs')
const path = require('path')

const { RESOURCES_DIR } = require('./lib/build-options')

const ROOT_INPUT_DATA_DIR = path.join(RESOURCES_DIR, 'data')
const ROOT_OUTPUT_DATA_DIR = 'src/service/data'

;(async () => {
  fdevids()
  coriolisDataBlueprints()
  coriolisDataModules()
  materialUses()
})()

function fdevids () {
  // https://github.com/EDCD/FDevIDs
  const dataDir = 'edcd/fdevids'
  fs.mkdirSync(`${ROOT_OUTPUT_DATA_DIR}/${dataDir}`, { recursive: true })
  glob(`${ROOT_INPUT_DATA_DIR}/${dataDir}/*.csv`, {}, async (error, files) => {
    if (error) return console.error(error)
    files.forEach(async (name) => {
      const jsonOutput = await csv().fromFile(name)
      const basename = path.basename(name, '.csv')
      fs.writeFileSync(`${ROOT_OUTPUT_DATA_DIR}/${dataDir}/${basename}.json`, JSON.stringify(jsonOutput, null, 2))
    })
  })
}

function coriolisDataBlueprints () {
  // https://github.com/EDCD/coriolis-data
  const dataDir = 'edcd/coriolis/modifications'
  const outputDir = `${ROOT_OUTPUT_DATA_DIR}/edcd/coriolis`
  fs.mkdirSync(outputDir, { recursive: true })
  const blueprints = JSON.parse(fs.readFileSync(`${ROOT_INPUT_DATA_DIR}/${dataDir}/blueprints.json`))
  const modifications = JSON.parse(fs.readFileSync(`${ROOT_INPUT_DATA_DIR}/${dataDir}/modifications.json`))
  const modules = JSON.parse(fs.readFileSync(`${ROOT_INPUT_DATA_DIR}/${dataDir}/modules.json`))

  const moduleBlueprints = {}
  Object.keys(modules).forEach(module => {
    Object.keys(modules[module].blueprints).forEach(blueprintName => {
      moduleBlueprints[blueprintName] = modules[module].blueprints[blueprintName]
    })
  })

  const output = []
  Object.keys(blueprints).forEach(blueprintSymbol => {
    const blueprint = blueprints[blueprintSymbol]
    blueprint.symbol = blueprintSymbol
    blueprint.engineers = {}

    Object.keys(blueprint.grades).forEach(grade => {
      const features = {}

      // Get all engineers who can make this grade
      moduleBlueprints?.[blueprintSymbol]?.grades[grade]?.engineers.forEach(engineer => {
        if (!blueprint.engineers[engineer]) {
          blueprint.engineers[engineer] = { grades: [] }
        }
        blueprint.engineers[engineer].grades.push(grade)
      })

      Object.entries(blueprint.grades[grade].features).forEach(([k, v]) => {
        features[getEngineeringPropertyName(k)] = {
          value: v,
          type: modifications[k].type,
          method: modifications[k].method,
          improvement: ((Math.max(...v) > 0 && modifications[k].higherbetter === true) || (Math.min(...v) < 0 && modifications[k].higherbetter === false))
        }
      })

      blueprint.grades[grade].features = features
    })

    output.push(blueprint)
  })

  fs.writeFileSync(`${outputDir}/blueprints.json`, JSON.stringify(output, null, 2))
}

function coriolisDataModules () {
  // https://github.com/EDCD/coriolis-data
  const dataDir = 'edcd/coriolis/modules'
  const outputDir = `${ROOT_OUTPUT_DATA_DIR}/edcd/coriolis`
  fs.mkdirSync(outputDir, { recursive: true })

  glob(`${ROOT_INPUT_DATA_DIR}/${dataDir}/**/*.json`, {}, async (error, files) => {
    if (error) return console.error(error)

    let modules = []
    files.forEach(async (name) => {
      const fileContents = JSON.parse(fs.readFileSync(name))
      Object.keys(fileContents).forEach(key => {
        modules = modules.concat(fileContents[key])
      })
    })

    modules.forEach(module => {
      if (module.ukDiscript) {
        module.description = module.ukDiscript
        delete module.ukDiscript
      }

      module.properties = {}
      Object.keys(module).forEach(moduleProperty => {
        if (getEngineeringPropertyName(moduleProperty) !== moduleProperty) {
          module.properties[getEngineeringPropertyName(moduleProperty)] = module[moduleProperty]
          delete module[moduleProperty]
        }
      })
    })

    fs.writeFileSync(`${outputDir}/modules.json`, JSON.stringify(modules, null, 2))
  })
}

function materialUses () {
  const materials = JSON.parse(fs.readFileSync(`${ROOT_OUTPUT_DATA_DIR}/edcd/fdevids/material.json`))
  const blueprints = JSON.parse(fs.readFileSync(`${ROOT_OUTPUT_DATA_DIR}/edcd/coriolis/blueprints.json`))

  const materialUses = materials.map(material => {
    const blueprintsMaterialIsUsedIn = []

    blueprints.forEach(blueprint => {
      const newBlueprint = {
        symbol: blueprint.symbol,
        name: blueprint.name,
        grades: []
      }

      Object.keys(blueprint.grades).forEach(grade => {
        if (blueprint.grades[grade].components[material.name]) {
          newBlueprint.grades.push(grade)
        }
      })

      if (newBlueprint.grades.length > 0) blueprintsMaterialIsUsedIn.push(newBlueprint)
    })

    return ({
      symbol: material.symbol,
      name: material.name,
      blueprints: blueprintsMaterialIsUsedIn
    })
  })

  fs.writeFileSync(`${ROOT_OUTPUT_DATA_DIR}/material-uses.json`, JSON.stringify(materialUses, null, 2))
}

function getEngineeringPropertyName (engineeringPropertyName) {
  const engineeringPropertyNames = {
    fallofffromrange: 'Damage Falloff Start',
    power: 'Power Draw',
    range: 'Maximum Range',
    optmass: 'Optimal Mass',
    optmul: 'Optimal Multiplier',
    thermload: 'Thermal Load',
    thermres: 'Thermal Resistance',
    explres: 'Explosive Resistance',
    kinres: 'Kinetic Resistance',
    hullboost: 'Hull Boost',
    hullreinforcement: 'Hull Reinforcement',
    shotspeed: 'Shot Speed',
    pgen: 'Power Generation',
    eff: 'Heat Efficiency',
    reload: 'Reload Time',
    ammo: 'Ammo Maximum',
    mass: 'Mass',
    bust: 'Burst',
    burstrof: 'Burst Rate Of Fire',
    boot: 'Boot time',
    clip: 'Ammo Clip Size',
    distdraw: 'Distributer Draw',
    damage: 'Damage',
    facinglimit: 'Facing Limit',
    ranget: 'Range',
    proberadius: 'Probe Radius',
    scantime: 'Scan Time',
    angle: 'Scan Angle',
    falloff: 'Damage Falloff',
    piercing: 'Armour Piercing',
    shieldboost: 'Shield Boost',
    rof: 'Rate of Fire',
    shieldreinforcement: 'Shield Reinforcement',
    engcap: 'Engines Capacity',
    engrate: 'Engines Recharge',
    syscap: 'Systems Capacity',
    sysrate: 'Systems Recharge',
    wepcap: 'Weapons Capacity',
    weprate: 'Weapons Recharge',
    spinup: 'Spin Up Time',
    integrity: 'Integrity',
    jitter: 'Jitter',
    burst: 'Burst',
    duration: 'Duration',
    brokenregen: 'Broken Regeneration Rate',
    maxmass: 'Maximum Mass',
    maxmul: 'Maximum Multipler',
    maxmulacceleration: 'Maximum Acceleration Multiplier',
    maxmulrotation: 'Maximum Rotation Multiplier',
    maxmulspeed: 'Maximum Speed Multiplier',
    minmass: 'Minimum Mass',
    minmul: 'Minimum Multiplier',
    minmulacceleration: 'Minimum Accelleration Multiplier',
    minmulrotation: 'Minimum Rotation Multiplier',
    minmulspeed: 'Minimum Speed Multiplier',
    optmulacceleration: 'Optimal Accelleration Multiplier',
    optmulrotation: 'Optimal Rotation Multiplier'
  }

  return engineeringPropertyNames[engineeringPropertyName] || engineeringPropertyName
}
