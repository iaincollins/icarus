// Convert files from raw data to useable / enriched JSON
const glob = require('glob')
const csv = require('csvtojson')
const fs = require('fs')
const path = require('path')
const xml2js = require('xml2js')
const WT2PT = require('wikitext2plaintext')

const xmlParser = new xml2js.Parser()
const wikiTextParser = new WT2PT()

const { RESOURCES_DIR } = require('./lib/build-options')

const ROOT_INPUT_DATA_DIR = path.join(RESOURCES_DIR, 'data')
const ROOT_OUTPUT_DATA_DIR = path.join('src', 'service', 'data')

;(async () => {
  fdevids()
  coriolisDataBlueprints()
  coriolisDataModules()
  materialUses()
  await codexArticles()
})()

function fdevids () {
  // TODO Make this a sync task, as codexArticles depends on it's output
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


async function codexArticles () {
  const pathToFile = path.join(RESOURCES_DIR, 'data', 'fandom', 'elite_dangerousfandomcom-20220527-wikidump', 'elite_dangerousfandomcom-20220527-current.xml')
  const xml = fs.readFileSync(pathToFile).toString()
  const wikiData = (await xmlParser.parseStringPromise(xml)).mediawiki
  const codexIndex = {}
  const codexRedirects = {}
  const codexPages = wikiData.page.reduce((response, item) => {
    const page = item
    const title = page.title[0].trim()
    const id = `${page.id}-${title.toLowerCase().replace(/[^A-z0-9\(\)\'-]/g, '_').replace(/(__+)/g, '_')}`

    // Ignore Talk and User pages
    if (title.startsWith('Talk:') || title.startsWith('User:')) return response

    const rawText = page.revision[0].text[0]._
    const parsedText = wikiTextParser.parse(rawText || '').replace(/\r/g, '')

    // Ignore blank pages
    if (!rawText || !parsedText) return response

    if (rawText.toLowerCase().startsWith('- redirect ') || parsedText.toLowerCase().includes('__staticredirect__')) {
      const redirectTo = parsedText
        .replace(/- REDIRECT /i, '')
        .replace(/__STATICREDIRECT__/i, '')
        .replace(/\n(.*)?/, '')
        .replace(/\r(.*)?/, '')
        .trim()

      // Ignore broken redirects
      if (!redirectTo) return response

      // Add to list of redirects
      codexRedirects[title] = redirectTo

      return response
    }

    const rawQuotes = rawText
      .replace(/\r\n/img, '')
      .match(/{{quote(.*?)}}/img)

    const quote = rawQuotes?.[0]
      .replace(/^{{(.*?)\|/, '')
      .replace(/\|(.*?)}}$/, '')
      .replace(/<!--(.*?)-->/, '')
      .replace(/\[\[/, '')
      .replace(/\]\]/, '')
      .trim()
      ?? null

    // Clean up text / omit certain sections
    const text = parsedText
      .replace(/\n\n- /img, '\n- ')
      .replace(/\n\nGallery\n(.*?)\n/im, '\n')
      .replace(/\n\nVideos\n(.*?)\n/im, '\n')
      .replace(/\n\nReferences\n(.*?)\n/im, '\n')
      .replace(/\nCategory:(.*?)\n/img, '\n')
      .replace(/\nCategory:(.*?)$/img, '\n')
      .replace(/\n([a-z]{2}):(.*?)\n/img, '\n')
      .replace(/\n([a-z]{2}):(.*?)$/img, '\n')
      .trim()

    response.push({
      id,
      title,
      timestamp: page.revision[0].timestamp[0],
      contributor: {
        id: page.revision[0].contributor[0]?.id?.[0] ?? null,
        name: page.revision[0].contributor[0]?.username?.[0] ?? null
      },
      rawText,
      text,
      quote
    })

    codexIndex[title] = id

    return response
  }, [])

  // Write files to disk
  // const codexDir = path.join(ROOT_OUTPUT_DATA_DIR, 'codex')
  // fs.mkdirSync(codexDir, { recursive: true })

  // codexPages.forEach(codexPage => {
  //   const filename = path.join(codexDir, `${codexPage.id}.json`)
  //   fs.writeFileSync(filename, JSON.stringify(codexPage, null, 2))
  // })

  // fs.writeFileSync(path.join(codexDir, '_index.json'), JSON.stringify({
  //   index: codexIndex,
  //   redirects: codexRedirects
  // }, null, 2))

  // This requires the the fdevids() import to have been run at least once
  const pathToCommodities = `${ROOT_OUTPUT_DATA_DIR}/edcd/fdevids/commodity.json`
  const commodities = JSON.parse(fs.readFileSync(pathToCommodities))

  const pathToRareCommodities = `${ROOT_OUTPUT_DATA_DIR}/edcd/fdevids/rare_commodity.json`
  const rareCommodities = JSON.parse(fs.readFileSync(pathToRareCommodities))

  const commodityDescriptions = {}
  codexPages.forEach(codexPage => {
    if (!codexPage?.quote) return

    commodities.map(commodity => {
      if (commodity.name === codexPage.title) {
        commodity.description = codexPage.quote
        commodityDescriptions[codexPage.title] = codexPage.quote
      }
    })
    rareCommodities.map(rareCommodity => {
      if (rareCommodity.name === codexPage.title) {
        rareCommodity.description = codexPage.quote
        commodityDescriptions[codexPage.title] = codexPage.quote
      }
    })
  })
  // These wil fail as the task to generate them is currently an async function
  // fs.writeFileSync(pathToCommodities, JSON.stringify(commodities, null, 2))
  // fs.writeFileSync(pathToRareCommodities, JSON.stringify(rareCommodities, null, 2))
  fs.writeFileSync(`${ROOT_OUTPUT_DATA_DIR}/commodity-descriptions.json`, JSON.stringify(commodityDescriptions, null, 2))
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
