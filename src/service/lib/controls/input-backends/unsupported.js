class UnsupportedInputBackend {
  async tapKey () {
    throw new Error(`No input backend implemented for ${process.platform}`)
  }

  async keyDown () {
    throw new Error(`No input backend implemented for ${process.platform}`)
  }

  async keyUp () {
    throw new Error(`No input backend implemented for ${process.platform}`)
  }
}

module.exports = UnsupportedInputBackend
