// The standalone build creates cross platform (Win/Mac/Linux) build of the
// service with nexe. Unlike the full release, this build does not feature
// an installer, auto-updating or a native UI and must be configured using
// command line options.
const fs = require('fs')
const path = require('path')
const { compile } = require('nexe')
// const UPX = require('upx')({ brute: false }) // Brute on service seems to hang
const yargs = require('yargs')
const commandLineArgs = yargs.argv

const {
  DEBUG_CONSOLE: DEBUG_CONSOLE_DEFAULT,
  BUILD_DIR,
  BIN_DIR,
  DIST_DIR,
  SERVICE_STANDALONE_BUILD,
  SERVICE_ICON
} = require('./lib/build-options')

const DEBUG_CONSOLE = commandLineArgs.debug || DEBUG_CONSOLE_DEFAULT
const ENTRY_POINT = path.join(__dirname, '..', 'src', 'service', 'main.js')

;(async () => {
  clean()
  await build()
})()

function clean () {
  if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true })
  if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true })
  if (fs.existsSync(DIST_DIR)) fs.rmdirSync(DIST_DIR, { recursive: true })
}

async function build () {
  await compile({
    name: 'ICARUS Service',
    ico: SERVICE_ICON,
    input: ENTRY_POINT,
    output: SERVICE_STANDALONE_BUILD + '-linux',
    resources: [
      path.join(BUILD_DIR, 'web'), // Include web UI
      'src/service/data' // Include dynamically loaded JSON files
    ],
    debug: DEBUG_CONSOLE,
    target: 'linux-x64-14.15.3',
    build: false,
    bundle: true,
    runtime: {
      nodeConfigureOpts: ['--fully-static']
    }
  })
  await compile({
    name: 'ICARUS Service',
    ico: SERVICE_ICON,
    input: ENTRY_POINT,
    output: SERVICE_STANDALONE_BUILD + '-mac',
    resources: [
      path.join(BUILD_DIR, 'web'), // Include web UI
      'src/service/data' // Include dynamically loaded JSON files
    ],
    debug: DEBUG_CONSOLE,
    target: 'mac-x64-14.15.3',
    build: false,
    bundle: true,
    runtime: {
      nodeConfigureOpts: ['--fully-static']
    }
  })
  await compile({
    name: 'ICARUS Service',
    ico: SERVICE_ICON,
    input: ENTRY_POINT,
    output: SERVICE_STANDALONE_BUILD + '-windows',
    resources: [
      path.join(BUILD_DIR, 'web'), // Include web UI
      'src/service/data' // Include dynamically loaded JSON files
    ],
    debug: DEBUG_CONSOLE,
    target: 'windows-x86-14.15.3',
    build: false,
    bundle: true,
    runtime: {
      nodeConfigureOpts: ['--fully-static']
    }
  })
}
