const path = require('path')

const ROOT_DIR = path.join(__dirname, '..', '..')

// Development builds are faster, larger and can contain debug routines
const DEVELOPMENT_BUILD = process.env.DEVELOPMENT || false
const DEBUG_CONSOLE = DEVELOPMENT_BUILD

const BUILD_DIR = path.join(ROOT_DIR, 'build') // For intermediate build steps
const BIN_DIR = path.join(BUILD_DIR, 'bin') // For final binary build
const DIST_DIR = path.join(ROOT_DIR, 'dist') // For distributable build
const RESOURCES_DIR = path.join(ROOT_DIR, 'resources')
const ASSETS_SRC_DIR = path.join(RESOURCES_DIR, 'assets')
const ASSETS_DEST_DIR = path.join(BIN_DIR, 'assets')

const INSTALLER_NSI = path.join(RESOURCES_DIR, 'installer.nsi') // Installer config
const INSTALLER_EXE = path.join(DIST_DIR, 'ICARUS Setup.exe') // Should match INSTALLER_NAME in .nsi

const PRODUCT_VERSION = '0.0.0.1'

const APP_BINARY_NAME = 'ICARUS Terminal.exe'
const APP_UNOPTIMIZED_BUILD = path.join(BUILD_DIR, `~UNOPT_${safeBinaryName(APP_BINARY_NAME)}`)
const APP_OPTIMIZED_BUILD = path.join(BUILD_DIR, `~OPT_${safeBinaryName(APP_BINARY_NAME)}`)
const APP_FINAL_BUILD =  path.join(BIN_DIR, APP_BINARY_NAME)
const APP_ICON =  path.join(RESOURCES_DIR, 'icon.ico')

const APP_VERSION_INFO = {
  CompanyName: "ICARUS",
  ProductName: "ICARUS Terminal",
  FileDescription: "ICARUS Terminal",
  FileVersion: '0.0.0.1',
  ProductVersion: PRODUCT_VERSION,
  OriginalFilename: "ICARUS Terminal.exe",
  InternalName: "ICARUS Terminal",
  LegalCopyright: "ICARUS"
}

const SERVICE_BINARY_NAME = 'ICARUS Service.exe'
const SERVICE_UNOPTIMIZED_BUILD = path.join(BUILD_DIR, `~UNOPT_${safeBinaryName(SERVICE_BINARY_NAME)}`)
const SERVICE_OPTIMIZED_BUILD = path.join(BUILD_DIR, `~OPT_${safeBinaryName(SERVICE_BINARY_NAME)}`)
const SERVICE_FINAL_BUILD =  path.join(BIN_DIR, SERVICE_BINARY_NAME)
const SERVICE_ICON =  path.join(RESOURCES_DIR, 'icon.ico')

const SERVICE_VERSION_INFO = {
  CompanyName: "ICARUS",
  ProductName: "ICARUS Terminal Service",
  FileDescription: "ICARUS Terminal Service",
  FileVersion: '0.0.0.1',
  ProductVersion: PRODUCT_VERSION,
  OriginalFilename: "ICARUS Service.exe",
  InternalName: "ICARUS Service",
  LegalCopyright: "ICARUS"
}

// Some of the third party libraries used in buildings choke on characters
// like spaces in filenames; to work around this they are replaced during build
function safeBinaryName(binaryName) {
  return binaryName.replace(/ /g, '_')
}

module.exports = {
  DEVELOPMENT_BUILD,
  DEBUG_CONSOLE,
  BIN_DIR,
  BUILD_DIR,
  DIST_DIR,
  RESOURCES_DIR,
  ASSETS_SRC_DIR,
  ASSETS_DEST_DIR,
  APP_UNOPTIMIZED_BUILD,
  APP_OPTIMIZED_BUILD,
  APP_FINAL_BUILD,
  APP_ICON,
  SERVICE_UNOPTIMIZED_BUILD,
  SERVICE_OPTIMIZED_BUILD,
  SERVICE_FINAL_BUILD,
  SERVICE_ICON,
  APP_VERSION_INFO,
  SERVICE_VERSION_INFO,
  INSTALLER_NSI,
  INSTALLER_EXE
}
