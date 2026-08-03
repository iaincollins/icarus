const BindingResolver = require('./binding-resolver')
const { createInputBackend } = require('./input-backends')

class Controls {
  constructor ({
    bindingResolver = new BindingResolver(),
    inputBackend = createInputBackend(),
    enabled = process.env.ICARUS_ENABLE_CONTROLS === 'true'
  } = {}) {
    this.bindingResolver = bindingResolver
    this.inputBackend = inputBackend
    this.enabled = enabled
    this.controlRegistry = {}
    this.bindingCache = {
      bindingsDir: bindingResolver.bindingsDir,
      bindingsFile: null,
      controls: {}
    }

    this.refreshBindings()
  }

  async toggleSwitch ({ switchName }) {
    return this.tapControl({ controlName: switchName })
  }

  async tapControl ({ controlName }) {
    if (!this.enabled) {
      console.warn('CONTROL_REJECTED_DISABLED', controlName)
      return false
    }

    const control = this.controlRegistry[controlName]
    if (!control) {
      console.warn('CONTROL_REJECTED_UNSUPPORTED_CONTROL', controlName)
      return false
    }

    const binding = this.bindingCache.controls[controlName]
    if (!binding) {
      console.warn('CONTROL_REJECTED_MISSING_KEY', controlName)
      return false
    }

    try {
      await this.inputBackend.tapKey(binding)
      console.log('CONTROL_SENT', controlName, binding.display, control.eliteBinding)
      return true
    } catch (e) {
      console.error('ERROR_SENDING_KEY', controlName, e.toString())
      return false
    }
  }

  async startControl ({ controlName }) {
    return this.sendControlKey('down', controlName)
  }

  async stopControl ({ controlName }) {
    return this.sendControlKey('up', controlName)
  }

  async sendControlKey (direction, controlName) {
    if (!this.enabled) {
      console.warn('CONTROL_REJECTED_DISABLED', controlName)
      return false
    }

    const control = this.controlRegistry[controlName]
    const binding = control && this.bindingCache.controls[controlName]
    if (!control || !binding) {
      console.warn('CONTROL_REJECTED_MISSING_KEY', controlName)
      return false
    }

    try {
      if (direction === 'down') await this.inputBackend.keyDown(binding)
      else await this.inputBackend.keyUp(binding)
      return true
    } catch (e) {
      console.error('ERROR_SENDING_KEY', direction, controlName, e.toString())
      return false
    }
  }

  async refreshBindings () {
    try {
      this.bindingCache = await this.bindingResolver.resolveBindings()
      this.controlRegistry = this.bindingCache.registry || {}
      console.log('CONTROL_BINDINGS_REFRESHED', this.bindingCache.bindingsFile || 'no bindings file')
    } catch (e) {
      console.error('ERROR_REFRESHING_CONTROL_BINDINGS', e.toString())
    }

    return this.getControlStatus()
  }

  getControlStatus () {
    const controls = {}

    for (const [controlName, control] of Object.entries(this.controlRegistry)) {
      const binding = this.bindingCache.controls[controlName]
      controls[controlName] = {
        id: controlName,
        label: control.label || controlName,
        context: control.context || 'ship',
        eliteBinding: control.eliteBinding,
        inputMode: control.inputMode || 'tap',
        stateFlag: control.stateFlag || null,
        requiresConfirmation: control.requiresConfirmation === true,
        key: binding?.display || null,
        binding: binding || null,
        source: binding ? 'bindings' : null
      }
    }

    return {
      enabled: this.enabled,
      platform: process.platform,
      bindingsDir: this.bindingCache.bindingsDir,
      bindingsFile: this.bindingCache.bindingsFile,
      controls
    }
  }
}

module.exports = Controls
