// This step is not required currently as assets are now bundled into the
// service executable, but it may be used again in future.
/*
const fs = require('fs')
const fse = require('fs-extra')

const {
  BIN_DIR,
  ASSETS_SRC_DIR,
  ASSETS_DEST_DIR
} = require('./lib/build-options')

;(async () => {
  clean()
  copy()
})()

function clean () {
  if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true })
  if (fs.existsSync(ASSETS_DEST_DIR)) fs.rmdirSync(ASSETS_DEST_DIR, { recursive: true })
}

function copy () {
  fse.copySync(ASSETS_SRC_DIR, ASSETS_DEST_DIR, { recursive: true })
}
*/
