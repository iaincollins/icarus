// Convert CSV files from sources like EDCD to JSON
// https://github.com/EDCD/FDevIDs
const glob = require('glob')
const csv = require('csvtojson')
const fs = require('fs')
const path = require('path')

const { RESOURCES_DIR } = require('./lib/build-options')

const INPUT_DIR = path.join(RESOURCES_DIR, 'data')
const OUTPUT_DIR = 'src/service/data'

;(async () =>
  glob(`${INPUT_DIR}/*.csv`, {}, async (error, files) => {
    if (error) return console.error(error)

    files.map(async (name) => {
      const jsonOutput = await csv().fromFile(name)
      const basename = path.basename(name, '.csv')
      fs.writeFileSync(`${OUTPUT_DIR}/${basename}.json`, JSON.stringify(jsonOutput, null, 2))
    })
  })
)()
