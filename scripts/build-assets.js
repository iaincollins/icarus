// This step is not required currently as assets are now bundled into the
// service executable, but it may be used again in future.
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const fse = require('fs-extra')
const toIco = require('to-ico')
const svgtofont = require('svgtofont')
const packageJson = require('../package.json')

const {
  ASSETS_DIR,
  RESOURCES_DIR
} = require('./lib/build-options')

const ICON_FONT_DIR = path.join(ASSETS_DIR, 'icon-font')

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
  const files = [fs.readFileSync(path.join(RESOURCES_DIR, 'images/logo.png'))]
  const buf = await toIco(files)
  fs.writeFileSync(path.join(ASSETS_DIR, 'icon.ico'), buf)

  // Note: Overrides Maskable Icon
  execSync(`npx generate-icons --manifest src/web/public/manifest.json resources/images/logo.svg`)

  // Build icon font
  await svgtofont({
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
      title: 'ICARUS Terminal Font',
      logo: false,
      version: packageJson.version
    }
  })
}

function copy () {
  [
    'icarus-terminal.css',
    'icarus-terminal.eot',
    'icarus-terminal.woff',
    'icarus-terminal.woff2',
    'icarus-terminal.ttf',
    'icarus-terminal.svg',
    'icarus-terminal.json'
  ].forEach(fontAsset => fse.copySync(path.join(ASSETS_DIR, 'icon-font', fontAsset), `src/web/public/fonts/icarus-terminal/${fontAsset}`))

  fse.copySync(path.join(ASSETS_DIR, 'icon.ico'), 'src/web/public/favicon.ico')
  fse.copySync(path.join(RESOURCES_DIR, 'images/icon-maskable.png'), 'src/web/public/icon-maskable.png')
}
