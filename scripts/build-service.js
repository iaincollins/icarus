const fs = require('fs')
const path = require('path')
const { compile } = require('nexe')
const changeExe = require('changeexe')
const UPX = require('upx')({ brute: false }) // Brute on service seems to hang

const {
  DEVELOPMENT_BUILD,
  DEBUG_CONSOLE,
  BUILD_DIR,
  BIN_DIR,
  RESOURCES_DIR,
  SERVICE_UNOPTIMIZED_BUILD,
  SERVICE_OPTIMIZED_BUILD,
  SERVICE_FINAL_BUILD,
  SERVICE_ICON,
  SERVICE_VERSION_INFO
} = require('./lib/build-options')

const ENTRY_POINT = path.join(__dirname, '..', 'src', 'service', 'main.js')

;(async () => {
  clean()
  await build()
})()

function clean () {
  if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true })
  if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true })
  if (fs.existsSync(SERVICE_UNOPTIMIZED_BUILD)) fs.unlinkSync(SERVICE_UNOPTIMIZED_BUILD)
  if (fs.existsSync(SERVICE_OPTIMIZED_BUILD)) fs.unlinkSync(SERVICE_OPTIMIZED_BUILD)
  if (fs.existsSync(SERVICE_FINAL_BUILD)) fs.unlinkSync(SERVICE_FINAL_BUILD)
}

async function build () {
  await compile({
    name: 'ICARUS Service',
    ico: path.join(RESOURCES_DIR, 'icon.ico'),
    input: ENTRY_POINT,
    output: SERVICE_UNOPTIMIZED_BUILD,
    target: 'windows-x86-14.15.3', // from https://github.com/nexe/nexe/releases/tag/v3.3.3
    resources: ['resources/assets/**'],
    debug: DEBUG_CONSOLE,
    build: false,
    bundle: true,
    runtime: {
      nodeConfigureOpts: ['--fully-static']
    },
    // https://github.com/nodejs/node/blob/master/src/res/node.rc
    rc: SERVICE_VERSION_INFO
  })

  await changeExe.icon(SERVICE_UNOPTIMIZED_BUILD, SERVICE_ICON)
  await changeExe.versionInfo(SERVICE_UNOPTIMIZED_BUILD, SERVICE_VERSION_INFO)

  if (DEVELOPMENT_BUILD) {
    console.log('Development build (skipping compression)')
    fs.copyFileSync(SERVICE_UNOPTIMIZED_BUILD, SERVICE_FINAL_BUILD)
  } else {
    console.log('Optimizing...')
    const optimisationStats = await UPX(SERVICE_UNOPTIMIZED_BUILD)
      .output(SERVICE_OPTIMIZED_BUILD)
      .start()
    console.log('Optimization', optimisationStats)
    fs.copyFileSync(SERVICE_OPTIMIZED_BUILD, SERVICE_FINAL_BUILD)
  }
}
