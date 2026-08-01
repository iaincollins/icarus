const { execFile } = require('child_process')

class LinuxXdotoolInputBackend {
  async sendKey (key) {
    const xdotoolKey = normalizeXdotoolKey(key)

    return new Promise((resolve, reject) => {
      execFile('xdotool', ['key', '--clearmodifiers', xdotoolKey], (error) => {
        if (error) reject(error)
        else resolve(true)
      })
    })
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

  return keyParts.join('+')
}

module.exports = LinuxXdotoolInputBackend
