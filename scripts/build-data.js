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
  coriolisData_Blueprints()
  coriolisData_Modules()
})()

function fdevids () {
  // https://github.com/EDCD/FDevIDs
  const dataDir = 'edcd/fdevids'
  fs.mkdirSync(`${ROOT_OUTPUT_DATA_DIR}/${dataDir}`, { recursive: true })
  glob(`${ROOT_INPUT_DATA_DIR}/${dataDir}/*.csv`, {}, async (error, files) => {
    if (error) return console.error(error)
    files.map(async (name) => {
      const jsonOutput = await csv().fromFile(name)
      const basename = path.basename(name, '.csv')
      fs.writeFileSync(`${ROOT_OUTPUT_DATA_DIR}/${dataDir}/${basename}.json`, JSON.stringify(jsonOutput, null, 2))
    })
  })
}

function coriolisData_Blueprints () {
  // https://github.com/EDCD/coriolis-data
  const dataDir = 'edcd/coriolis/modifications'
  const outputDir = `${ROOT_OUTPUT_DATA_DIR}/edcd/coriolis`
  fs.mkdirSync(outputDir, { recursive: true })
  const blueprints = JSON.parse(fs.readFileSync(`${ROOT_INPUT_DATA_DIR}/${dataDir}/blueprints.json`))
  const output = []
  Object.keys(blueprints).map(blueprintSymbol => {
    const blueprint = blueprints[blueprintSymbol]
    blueprint.symbol = blueprintSymbol
    output.push(blueprint)
  })
  fs.writeFileSync(`${outputDir}/blueprints.json`, JSON.stringify(output, null, 2))
}

function coriolisData_Modules () {
  // https://github.com/EDCD/coriolis-data
  const dataDir = 'edcd/coriolis/modules'
  const outputDir = `${ROOT_OUTPUT_DATA_DIR}/edcd/coriolis`
  fs.mkdirSync(outputDir, { recursive: true })

  glob(`${ROOT_INPUT_DATA_DIR}/${dataDir}/**/*.json`, {}, async (error, files) => {
    if (error) return console.error(error)
    
    let modules = []
    files.forEach(async (name) => {
      const fileContents = JSON.parse(fs.readFileSync(name))
      Object.keys(fileContents).map(key => {
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
