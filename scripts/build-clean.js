const fs = require('fs')

const {
  BUILD_DIR,
  DIST_DIR
} = require('./lib/build-options')

if (fs.existsSync(BUILD_DIR)) fs.rmdirSync(BUILD_DIR, { recursive: true })
if (fs.existsSync(DIST_DIR)) fs.rmdirSync(DIST_DIR, { recursive: true })