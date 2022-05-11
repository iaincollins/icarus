const takeScreenshot = require('take-screenshots')

const HOST = 'http://localhost:3300'
const BASE_DIR = __dirname+'/../resources/images/screenshots'
const OPTIONS = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
  viewport: {width: 1024, height: 768},
  pageDelay: 1000
}

;(async () => {
  //await takeScreenshot(`${HOST}/nav/map?system=Maia`, `${BASE_DIR}/nav-map.png`, OPTIONS)
  await takeScreenshot(`${HOST}/nav/list?system=Farwell`, `${BASE_DIR}/nav-list.png`, OPTIONS)
  await takeScreenshot(`${HOST}/nav/route`, `${BASE_DIR}/nav-route.png`, OPTIONS)
  await takeScreenshot(`${HOST}/eng/blueprints?symbol=FSD_LongRange`, `${BASE_DIR}/eng-blueprint.png`, OPTIONS)
  await takeScreenshot(`${HOST}/ship/status`, `${BASE_DIR}/ship-status.png`, OPTIONS)
  await takeScreenshot.closeBrowser()
})()