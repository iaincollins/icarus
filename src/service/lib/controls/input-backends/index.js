const LinuxXdotoolInputBackend = require('./linux-xdotool')
const UnsupportedInputBackend = require('./unsupported')

function createInputBackend () {
  switch (process.platform) {
    case 'linux':
      return new LinuxXdotoolInputBackend()
    // Windows should get a native SendInput backend here instead of shelling
    // out from the request handler.
    default:
      return new UnsupportedInputBackend()
  }
}

module.exports = {
  createInputBackend
}
