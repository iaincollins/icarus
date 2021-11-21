// This step is not required currently as assets are now bundled into the
// service executable, but it may be used again in future.
const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')
const toIco = require('to-ico')
const svgtofont = require('svgtofont')
const packageJson = require('../package.json')

const {
  ASSETS_DIR,
  RESOURCES_DIR
} = require('./lib/build-options')

const ICON_FONT_DIR = path.join(ASSETS_DIR, 'icon-font')
console.log('ICON_FONT_DIR', ICON_FONT_DIR)
;(async () => {
  clean()
  await build()
  copy()
})()

function clean () {
  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true })
  if (fs.existsSync(ICON_FONT_DIR)) fs.rmdirSync(ICON_FONT_DIR, { recursive: true })
}

async function build () {

  // Convert icon.png to icon.ico (used for windows app icon)
  // TODO Refactor build steps for icon (NB: should be 256x256 bitmap)
  const files = [fs.readFileSync(path.join(RESOURCES_DIR, 'icon.png'))]
  const buf = await toIco(files)
  fs.writeFileSync(path.join(ASSETS_DIR, 'icon.ico'), buf)
  fse.copySync(path.join(ASSETS_DIR, 'icon.ico'), 'src/web/public/favicon.ico', { recursive: true })
   
  // Build icon font
  svgtofont({
    src: path.join(RESOURCES_DIR, 'icons'),
    dist: ICON_FONT_DIR,
    fontName: 'icarus-terminal',
    css: true,
    outSVGReact: false,
    outSVGPath: true,
    svgicons2svgfont: {
      fixedWidth: true,
      centerHorizontally: true,
      normalize: true
    },
    website: {
      title: "ICARUS Terminal Font",
      logo: false,
      version: packageJson.version,
    }
  }).then(() => {
    console.log('done!');
  });
}

function copy () {
  
}
