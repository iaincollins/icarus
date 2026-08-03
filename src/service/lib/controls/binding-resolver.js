const os = require('os')
const fs = require('fs')
const path = require('path')
const xml2js = require('xml2js')
const { createDiscoveredControl, isDashboardControl } = require('./control-registry')

class BindingResolver {
  constructor ({ logDir = global.LOG_DIR, bindingsDir = process.env.ICARUS_BINDINGS_DIR } = {}) {
    this.logDir = logDir
    this.bindingsDir = bindingsDir || inferBindingsDir(logDir) || defaultBindingsDir()
  }

  async resolveBindings () {
    const bindingsFile = this.findActiveBindingsFile()
    if (!bindingsFile) {
      return {
        bindingsDir: this.bindingsDir,
        bindingsFile: null,
        controls: {},
        registry: {}
      }
    }

    const xml = fs.readFileSync(bindingsFile).toString()
    const document = await xml2js.parseStringPromise(xml, {
      explicitArray: false
    })

    const registry = {}
    for (const [name, bindingNode] of Object.entries(document.Root || {})) {
      if (isDashboardControl(name, bindingNode)) {
        registry[name] = createDiscoveredControl(name)
      }
    }

    const controls = {}
    for (const [controlName, control] of Object.entries(registry)) {
      controls[controlName] = resolveKeyboardBinding(document.Root?.[control.eliteBinding])
    }

    return {
      bindingsDir: this.bindingsDir,
      bindingsFile,
      controls,
      registry
    }
  }

  findActiveBindingsFile () {
    if (!this.bindingsDir || !fs.existsSync(this.bindingsDir)) return null

    const presetNames = this.readStartPresetNames()
    const bindFiles = fs.readdirSync(this.bindingsDir).filter((filename) => filename.endsWith('.binds'))

    for (const presetName of presetNames) {
      const matchingBindFiles = bindFiles
        .filter((filename) => filename.startsWith(`${presetName}.`))
        .sort(compareBindingFileVersions)
        .reverse()

      if (matchingBindFiles.length > 0) {
        return path.join(this.bindingsDir, matchingBindFiles[0])
      }
    }

    if (bindFiles.length === 1) return path.join(this.bindingsDir, bindFiles[0])

    const customBindFiles = bindFiles
      .filter((filename) => filename.startsWith('Custom.'))
      .sort(compareBindingFileVersions)
      .reverse()

    return customBindFiles.length > 0 ? path.join(this.bindingsDir, customBindFiles[0]) : null
  }

  readStartPresetNames () {
    if (!this.bindingsDir || !fs.existsSync(this.bindingsDir)) return []

    return fs.readdirSync(this.bindingsDir)
      .filter((filename) => filename.endsWith('.start'))
      .flatMap((filename) => {
        const contents = fs.readFileSync(path.join(this.bindingsDir, filename)).toString()
        return contents.split(/\r?\n/)
          .map((presetName) => presetName.trim())
          .filter(Boolean)
      })
      .reverse()
  }
}

function resolveKeyboardBinding (bindingNode) {
  const bindingCandidates = [
    getBindingElement(bindingNode, 'Primary'),
    getBindingElement(bindingNode, 'Secondary')
  ].filter(Boolean)

  for (const bindingElement of bindingCandidates) {
    if (bindingElement.$?.Device !== 'Keyboard') continue

    const key = stripEliteKeyPrefix(bindingElement.$?.Key)
    if (!key) continue

    const modifier = parseEliteKeyboardModifier(bindingElement.Modifier)
    const modifiers = modifier ? [modifier] : []

    return {
      key,
      modifiers,
      display: [...modifiers, key].join('+')
    }
  }

  return null
}

function getBindingElement (bindingNode, elementName) {
  const element = bindingNode?.[elementName]
  return Array.isArray(element) ? element[0] : element
}

function stripEliteKeyPrefix (key) {
  if (!key || !key.startsWith('Key_')) return null
  return key.replace(/^Key_/, '')
}

function parseEliteKeyboardModifier (modifierElement) {
  const modifier = Array.isArray(modifierElement) ? modifierElement[0] : modifierElement
  if (modifier?.$?.Device !== 'Keyboard') return null

  return stripEliteKeyPrefix(modifier.$?.Key)
}

function inferBindingsDir (logDir) {
  if (!logDir) return null

  const suffix = path.join('Saved Games', 'Frontier Developments', 'Elite Dangerous')
  if (!logDir.endsWith(suffix)) return null

  const profileDir = logDir.slice(0, -suffix.length)
  return path.join(profileDir, 'AppData', 'Local', 'Frontier Developments', 'Elite Dangerous', 'Options', 'Bindings')
}

function defaultBindingsDir () {
  return path.join(os.homedir(), 'AppData', 'Local', 'Frontier Developments', 'Elite Dangerous', 'Options', 'Bindings')
}

function compareBindingFileVersions (left, right) {
  const leftVersion = extractBindingFileVersion(left)
  const rightVersion = extractBindingFileVersion(right)

  for (let index = 0; index < Math.max(leftVersion.length, rightVersion.length); index++) {
    const diff = (leftVersion[index] || 0) - (rightVersion[index] || 0)
    if (diff !== 0) return diff
  }

  return left.localeCompare(right)
}

function extractBindingFileVersion (filename) {
  return filename.match(/\d+/g)?.map((numberPart) => Number(numberPart)) || []
}

module.exports = BindingResolver
