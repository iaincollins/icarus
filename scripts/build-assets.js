// This step is not required currently as assets are now bundled into the
// service executable, but it may be used again in future.
const fs = require('fs')
const fse = require('fs-extra')

const {
  ASSETS_SRC_DIR,
  ASSETS_BUILD_DIR
} = require('./lib/build-options')

;(async () => {
  clean()
  copy()
})()

function clean () {
  if (fs.existsSync(ASSETS_BUILD_DIR)) fs.rmdirSync(ASSETS_BUILD_DIR, { recursive: true })
}

function copy () {
  fse.copySync(ASSETS_SRC_DIR, ASSETS_BUILD_DIR, { recursive: true })
}
