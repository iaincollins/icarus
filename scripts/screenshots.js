const takeScreenshot = require('take-screenshots')

const HOST = 'http://localhost:3300'
const BASE_DIR = __dirname + '/../resources/images/screenshots'
const DEFAULT_OPTIONS = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
  viewport: {
    width: 1024,
    height: 768,
    deviceScaleFactor: 2
  }
}

function screenshot (url, path, options) {
  return takeScreenshot(url, { ...DEFAULT_OPTIONS, ...options, screenshot: { path } })
}

;(async () => {
  await Promise.all([
    screenshot(`${HOST}/nav/map?system=maia`, `${BASE_DIR}/nav-map.png`, { pageDelay: 1000 }),
    screenshot(`${HOST}/nav/list?system=farwell&selected=farwell+a+6+a`, `${BASE_DIR}/nav-list.png`),
    screenshot(`${HOST}/nav/route`, `${BASE_DIR}/nav-route.png`),
    screenshot(`${HOST}/eng/blueprints?symbol=FSD_LongRange`, `${BASE_DIR}/eng-blueprint.png`),
    screenshot(`${HOST}/ship/status`, `${BASE_DIR}/ship-status.png`)
  ])
  await takeScreenshot.closeBrowser()
  process.exit()
})()
