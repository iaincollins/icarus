// This step is not required currently as assets are now bundled into the
// service executable, but it may be used again in future.
const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')
const toIco = require('to-ico')

const {
  ASSETS_SRC_DIR,
  ASSETS_BUILD_DIR,
  RESOURCES_DIR
} = require('./lib/build-options')

;(async () => {
  clean()
  await build()
  copy()
})()

function clean () {
  if (fs.existsSync(ASSETS_BUILD_DIR)) fs.rmdirSync(ASSETS_BUILD_DIR, { recursive: true })
}

async function build() {
  // TODO Refactor build steps for icon (NB: should be 256x256 image)
  const files = [ fs.readFileSync(path.join(RESOURCES_DIR, 'icon.png')) ]
  const buf = await toIco(files)
  fs.writeFileSync(path.join(RESOURCES_DIR,'icon.ico'), buf)
  fse.copySync(path.join(RESOURCES_DIR,'icon.ico'), 'src/web/public/favicon.ico', { recursive: true })
}

function copy () {
  fse.copySync(ASSETS_SRC_DIR, ASSETS_BUILD_DIR, { recursive: true })
}
