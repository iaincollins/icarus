const fs = require('fs')
const { execSync } = require('child_process')
const NSIS = require('makensis')

const {
  BUILD_DIR,
  DIST_DIR,
  INSTALLER_NSI,
  INSTALLER_EXE,
  PRODUCT_VERSION,
  PATH_TO_SIGNTOOL,
  SIGN_BUILD,
  SIGN_CERT_NAME,
  SIGN_TIME_SERVER
} = require('./lib/build-options')

;(async () => {
  clean()
  await build()
})()

function clean () {
  if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true })
  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true })
  if (fs.existsSync(INSTALLER_EXE)) fs.unlinkSync(INSTALLER_EXE)
}

async function build () {
  const installerOutput = NSIS.compile.sync(INSTALLER_NSI, {
    pathToMakensis: 'C:\\Program Files (x86)\\NSIS\\makensis.exe',
    verbose: 4,
    define: {
      SPECIAL_BUILD: false,
      PRODUCT_VERSION,
      INSTALLER_EXE
    }
  })
  console.log(installerOutput)

  if (SIGN_BUILD) {
    execSync(`"${PATH_TO_SIGNTOOL}" sign /n "${SIGN_CERT_NAME}" /t ${SIGN_TIME_SERVER} /fd SHA256 /v "${INSTALLER_EXE}"`)
  }
}
