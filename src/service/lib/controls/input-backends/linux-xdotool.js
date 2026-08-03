const { execFile } = require('child_process')

class LinuxXdotoolInputBackend {
  async tapKey (key) {
    await this.keyDown(key)
    await this.keyUp(key)
    return true
  }

  async keyDown (key) {
    return this.sendKeyCommand('keydown', key)
  }

  async keyUp (key) {
    return this.sendKeyCommand('keyup', key)
  }

  async sendKeyCommand (command, key) {
    const keyParts = normalizeXdotoolKey(key)

    // Send modifiers before the main key and release them in reverse order.
    const orderedKeys = command === 'keyup' ? [...keyParts].reverse() : keyParts
    for (const keyPart of orderedKeys) {
      await runXdotool(command, keyPart)
    }
    return true
  }
}

function normalizeXdotoolKey (key) {
  const normalizedKey = `${key}`.trim()
  const keyParts = normalizedKey.split('+').map((keyPart) => keyPart.trim()).filter(Boolean)

  if (keyParts.length === 0) throw new Error('No key configured')
  if (keyParts.length > 4) throw new Error(`Unsupported key combination: ${normalizedKey}`)
  if (keyParts.some((keyPart) => !/^[a-z0-9_]+$/i.test(keyPart))) {
    throw new Error(`Unsafe key name: ${normalizedKey}`)
  }

  return keyParts
}

function runXdotool (command, key) {
  return new Promise((resolve, reject) => {
    execFile('xdotool', [command, key], (error) => {
      if (error) reject(error)
      else resolve(true)
    })
  })
}

module.exports = LinuxXdotoolInputBackend
