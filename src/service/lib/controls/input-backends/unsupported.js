class UnsupportedInputBackend {
  async sendKey () {
    throw new Error(`No input backend implemented for ${process.platform}`)
  }
}

module.exports = UnsupportedInputBackend
