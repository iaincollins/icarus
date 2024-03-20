require('dotenv').config()

const path = require('path')
const packageJson = require('../../package.json')

const PRODUCT_VERSION = `${packageJson.version}.0`
const APP_FILE_VERSION = PRODUCT_VERSION
const SERVICE_FILE_VERSION = PRODUCT_VERSION

const PATH_TO_SIGNTOOL = '../code-signing/signtool.exe'
const SIGN_BUILD = process.env?.SIGN_BUILD === 'true'
const SIGN_CERT_NAME = process.env?.SIGN_CERT_NAME ?? 'Open Source Developer, Iain Collins'
const SIGN_TIME_SERVER = process.env?.SIGN_TIME_SERVER ?? 'http://time.certum.pl'

// Development builds are faster, larger and can contain debug routines
const DEVELOPMENT_BUILD = process.env.DEVELOPMENT || false
const DEBUG_CONSOLE = DEVELOPMENT_BUILD

const ROOT_DIR = path.join(__dirname, '..', '..')
const BUILD_DIR = path.join(ROOT_DIR, 'build') // For intermediate build steps
const BIN_DIR = path.join(BUILD_DIR, 'bin') // For final binary build
const DIST_DIR = path.join(ROOT_DIR, 'dist') // For distributable build
const RESOURCES_DIR = path.join(ROOT_DIR, 'resources')
const ASSETS_DIR = path.join(RESOURCES_DIR, 'assets')
const ICON = path.join(ASSETS_DIR, 'icon.ico')

const PATH_TO_MAKENSIS = 'C:\\Program Files (x86)\\NSIS\\makensis.exe'
const INSTALLER_NSI = path.join(RESOURCES_DIR, 'installer', 'installer.nsi') // Installer config
const INSTALLER_EXE = path.join(DIST_DIR, 'ICARUS Setup.exe') // Should match INSTALLER_NAME in .nsi

const APP_BINARY_NAME = 'ICARUS Terminal.exe'
const APP_UNOPTIMIZED_BUILD = path.join(BUILD_DIR, `~UNOPT_${safeBinaryName(APP_BINARY_NAME)}`)
const APP_OPTIMIZED_BUILD = path.join(BUILD_DIR, `~OPT_${safeBinaryName(APP_BINARY_NAME)}`)
const APP_FINAL_BUILD = path.join(BIN_DIR, APP_BINARY_NAME)
const APP_ICON = ICON

const APP_VERSION_INFO = {
  CompanyName: 'ICARUS',
  ProductName: 'ICARUS Terminal',
  FileDescription: 'ICARUS Terminal',
  FileVersion: APP_FILE_VERSION,
  ProductVersion: PRODUCT_VERSION,
  OriginalFilename: 'ICARUS Terminal.exe',
  InternalName: 'ICARUS Terminal',
  LegalCopyright: 'ICARUS'
}

const SERVICE_BINARY_NAME = 'ICARUS Service.exe'
const SERVICE_UNOPTIMIZED_BUILD = path.join(BUILD_DIR, `~UNOPT_${safeBinaryName(SERVICE_BINARY_NAME)}`)
const SERVICE_OPTIMIZED_BUILD = path.join(BUILD_DIR, `~OPT_${safeBinaryName(SERVICE_BINARY_NAME)}`)
const SERVICE_FINAL_BUILD = path.join(BIN_DIR, SERVICE_BINARY_NAME)
const SERVICE_STANDALONE_BUILD = path.join(DIST_DIR, 'icarus-terminal-service')
const SERVICE_ICON = ICON

const SERVICE_VERSION_INFO = {
  CompanyName: 'ICARUS',
  ProductName: 'ICARUS Terminal Service',
  FileDescription: 'ICARUS Terminal Service',
  FileVersion: SERVICE_FILE_VERSION,
  ProductVersion: PRODUCT_VERSION,
  OriginalFilename: 'ICARUS Service.exe',
  InternalName: 'ICARUS Service',
  LegalCopyright: 'ICARUS'
}

// Some of the third party libraries used in buildings choke on characters
// like spaces in filenames; to work around this they are replaced during build
function safeBinaryName (binaryName) {
  return binaryName.replace(/ /g, '_')
}

module.exports = {
  DEVELOPMENT_BUILD,
  DEBUG_CONSOLE,
  BIN_DIR,
  BUILD_DIR,
  DIST_DIR,
  RESOURCES_DIR,
  ASSETS_DIR,
  ICON,
  APP_UNOPTIMIZED_BUILD,
  APP_OPTIMIZED_BUILD,
  APP_FINAL_BUILD,
  APP_ICON,
  SERVICE_UNOPTIMIZED_BUILD,
  SERVICE_OPTIMIZED_BUILD,
  SERVICE_FINAL_BUILD,
  SERVICE_STANDALONE_BUILD,
  SERVICE_ICON,
  APP_VERSION_INFO,
  SERVICE_VERSION_INFO,
  INSTALLER_NSI,
  INSTALLER_EXE,
  PRODUCT_VERSION,
  PATH_TO_MAKENSIS,
  PATH_TO_SIGNTOOL,
  SIGN_BUILD,
  SIGN_CERT_NAME,
  SIGN_TIME_SERVER
}
