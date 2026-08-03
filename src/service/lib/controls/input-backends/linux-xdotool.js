const { execFile } = require('child_process')

class LinuxXdotoolInputBackend {
  async tapKey (binding) {
    await this.keyDown(binding)
    await this.keyUp(binding)
    return true
  }

  async keyDown (binding) {
    return this.sendKeyCommand('keydown', binding)
  }

  async keyUp (binding) {
    return this.sendKeyCommand('keyup', binding)
  }

  async sendKeyCommand (command, binding) {
    const keyParts = normalizeXdotoolBinding(binding)

    // Send modifiers before the main key and release them in reverse order.
    const orderedKeys = command === 'keyup' ? [...keyParts].reverse() : keyParts
    for (const keyPart of orderedKeys) {
      await runXdotool(command, keyPart)
    }
    return true
  }
}

function normalizeXdotoolBinding (binding) {
  if (typeof binding === 'string') {
    return validateXdotoolKeys(binding.split('+').map((keyPart) => keyPart.trim()).filter(Boolean), binding)
  }

  const keyParts = [
    ...(binding?.modifiers || []).map(convertEliteKeyToXdotoolKey),
    convertEliteKeyToXdotoolKey(binding?.key)
  ].filter(Boolean)

  return validateXdotoolKeys(keyParts, binding?.display || binding?.key)
}

function validateXdotoolKeys (keyParts, label) {
  if (keyParts.length === 0) throw new Error('No key configured')
  if (keyParts.length > 4) throw new Error(`Unsupported key combination: ${label}`)
  if (keyParts.some((keyPart) => !/^[a-z0-9_]+$/i.test(keyPart))) {
    throw new Error(`Unsafe key name: ${label}`)
  }

  return keyParts
}

function convertEliteKeyToXdotoolKey (key) {
  if (!key) return null
  if (key.length === 1) return key.toLowerCase()

  const numpadKeys = {
    Numpad_0: 'KP_0',
    Numpad_1: 'KP_1',
    Numpad_2: 'KP_2',
    Numpad_3: 'KP_3',
    Numpad_4: 'KP_4',
    Numpad_5: 'KP_5',
    Numpad_6: 'KP_6',
    Numpad_7: 'KP_7',
    Numpad_8: 'KP_8',
    Numpad_9: 'KP_9',
    Numpad_Add: 'KP_Add',
    Numpad_Decimal: 'KP_Decimal',
    Numpad_Divide: 'KP_Divide',
    Numpad_Enter: 'KP_Enter',
    Numpad_Multiply: 'KP_Multiply',
    Numpad_Subtract: 'KP_Subtract'
  }

  const specialKeys = {
    BackSlash: 'backslash',
    BackSpace: 'BackSpace',
    Comma: 'comma',
    Delete: 'Delete',
    DownArrow: 'Down',
    End: 'End',
    Enter: 'Return',
    Equals: 'equal',
    Escape: 'Escape',
    ForwardSlash: 'slash',
    Home: 'Home',
    Insert: 'Insert',
    LeftAlt: 'alt',
    LeftArrow: 'Left',
    LeftControl: 'ctrl',
    LeftShift: 'shift',
    Minus: 'minus',
    PageDown: 'Page_Down',
    PageUp: 'Page_Up',
    Period: 'period',
    RightAlt: 'alt',
    RightArrow: 'Right',
    RightControl: 'ctrl',
    RightShift: 'shift',
    Space: 'space',
    Tab: 'Tab',
    UpArrow: 'Up'
  }

  if (numpadKeys[key]) return numpadKeys[key]
  return specialKeys[key] || key
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
