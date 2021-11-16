const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const changeExe = require('changeexe')
const UPX = require('upx')({ brute: true })

const {
  DEVELOPMENT_BUILD,
  DEBUG_CONSOLE,
  BUILD_DIR,
  BIN_DIR,
  RESOURCES_DIR,
  APP_UNOPTIMIZED_BUILD,
  APP_OPTIMIZED_BUILD,
  APP_FINAL_BUILD,
  APP_ICON,
  APP_VERSION_INFO
} = require('./lib/build-options')

;(async () => {
  clean()
  await build()
  copy()
})()

function clean () {
  if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true })
  if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true })
  if (fs.existsSync(APP_UNOPTIMIZED_BUILD)) fs.unlinkSync(APP_UNOPTIMIZED_BUILD)
  if (fs.existsSync(APP_OPTIMIZED_BUILD)) fs.unlinkSync(APP_OPTIMIZED_BUILD)
  if (fs.existsSync(APP_FINAL_BUILD)) fs.unlinkSync(APP_FINAL_BUILD)
}

async function build () {
  if (DEBUG_CONSOLE) {
    // Build that opens console output to a terminal
    execSync(`cd src/app && go build -o "${APP_UNOPTIMIZED_BUILD}"`)
  } else {
    execSync(`cd src/app && go build -ldflags="-H windowsgui -s -w" -o "${APP_UNOPTIMIZED_BUILD}"`)
  }

  await changeExe.icon(APP_UNOPTIMIZED_BUILD, APP_ICON)
  await changeExe.versionInfo(APP_UNOPTIMIZED_BUILD, APP_VERSION_INFO)

  if (DEVELOPMENT_BUILD) {
    console.log('Development build (skipping compression)')
    fs.copyFileSync(APP_UNOPTIMIZED_BUILD, APP_FINAL_BUILD)
  } else {
    console.log('Optimizing...')
    const optimisationStats = await UPX(APP_UNOPTIMIZED_BUILD)
      .output(APP_OPTIMIZED_BUILD)
      .start()
    console.log('Optimization', optimisationStats)
    fs.copyFileSync(APP_OPTIMIZED_BUILD, APP_FINAL_BUILD)
  }
}

function copy () {
  // Resources required by the app
  fs.copyFileSync(path.join(RESOURCES_DIR, 'dll', 'webview.dll'), path.join(BIN_DIR, 'webview.dll'))
  fs.copyFileSync(path.join(RESOURCES_DIR, 'dll', 'WebView2Loader.dll'), path.join(BIN_DIR, 'WebView2Loader.dll'))
  fs.copyFileSync(APP_ICON, path.join(BIN_DIR, 'icon.ico'))
}
