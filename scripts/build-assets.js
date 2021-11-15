const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')

const {
  BIN_DIR,
  ASSETS_SRC_DIR,
  ASSETS_DEST_DIR
} = require('./lib/build-options')

;(async () => {
  clean()
  copy()
})()

function clean() {
  if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true })
  if (fs.existsSync(ASSETS_DEST_DIR)) fs.rmdirSync(ASSETS_DEST_DIR, { recursive: true })
}

function copy() {
  // Note: Assets are now bundled inside the service executable so for now
  // we no longer need to copy them or include them explicitly (but may change)
  //fse.copySync(ASSETS_SRC_DIR, ASSETS_DEST_DIR, { recursive: true })
}