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
  const output = []
  Object.keys(blueprints).forEach(blueprintSymbol => {
    const blueprint = blueprints[blueprintSymbol]
    blueprint.symbol = blueprintSymbol
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
