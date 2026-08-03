class UnsupportedInputBackend {
  async tapBinding () {
    throw new Error(`No input backend implemented for ${process.platform}`)
  }

  async bindingDown () {
    throw new Error(`No input backend implemented for ${process.platform}`)
  }

  async bindingUp () {
    throw new Error(`No input backend implemented for ${process.platform}`)
  }
}

module.exports = UnsupportedInputBackend
