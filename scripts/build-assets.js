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
  RESOURCES_DIR,
  ICON
} = require('./lib/build-options')

const ICON_FONT_DIR = path.join(ASSETS_DIR, 'icon-font')
const ICONS_DIR = path.join(ASSETS_DIR, 'icons')

;(async () => {
  clean()
  await build()
  copy()
})()

function clean () {
  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true })
  if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true })
  if (fs.existsSync(ICON_FONT_DIR)) fs.rmdirSync(ICON_FONT_DIR, { recursive: true })
}

async function build () {

  // Note: Overrides maskable icon, so put back the right icon afterwords
  execSync(`npx generate-icons --manifest ${path.join(ASSETS_DIR, 'icon-manifest.json')} ${path.join(RESOURCES_DIR, 'images/icon.svg')}`)
  fse.copySync(
    path.join(RESOURCES_DIR, 'images/icon-maskable.png'), 
    path.join(ICONS_DIR, 'icon-maskable.png')
  )
  
  // Convert icon.png to icon.ico (used for windows app icon)
  const iconFiles = [
    fs.readFileSync(path.join(ICONS_DIR, 'icon-256x256.png')),
  ]
  const buf = await toIco(iconFiles, { 
    resize: true,
    sizes: [16, 24, 32, 48, 64, 128, 256]
  })
  fs.writeFileSync(ICON, buf)
  fse.copySync(ICON, 'src/web/public/favicon.ico')

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

  fse.copySync(path.join(ASSETS_DIR, 'icons'), `src/web/public/icons`)
}
