const { CONTROL_REGISTRY } = require('./control-registry')
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
    this.bindingCache = {
      bindingsDir: bindingResolver.bindingsDir,
      bindingsFile: null,
      controls: {}
    }

    this.refreshBindings()
  }

  async toggleSwitch ({ switchName }) {
    if (!this.enabled) {
      console.warn('CONTROL_REJECTED_DISABLED', switchName)
      return false
    }

    const control = CONTROL_REGISTRY[switchName]
    if (!control) {
      console.warn('CONTROL_REJECTED_UNSUPPORTED_SWITCH', switchName)
      return false
    }

    const key = this.bindingCache.controls[switchName] || process.env[control.keyEnv]
    if (!key) {
      console.warn('CONTROL_REJECTED_MISSING_KEY', switchName, control.keyEnv)
      return false
    }

    try {
      await this.inputBackend.sendKey(key)
      console.log('CONTROL_SENT', switchName, key, control.eliteBinding)
      return true
    } catch (e) {
      console.error('ERROR_SENDING_KEY', switchName, e.toString())
      return false
    }
  }

  async refreshBindings () {
    try {
      this.bindingCache = await this.bindingResolver.resolveBindings(CONTROL_REGISTRY)
      console.log('CONTROL_BINDINGS_REFRESHED', this.bindingCache.bindingsFile || 'no bindings file')
    } catch (e) {
      console.error('ERROR_REFRESHING_CONTROL_BINDINGS', e.toString())
    }

    return this.getControlStatus()
  }

  getControlStatus () {
    const controls = {}

    for (const [controlName, control] of Object.entries(CONTROL_REGISTRY)) {
      controls[controlName] = {
        eliteBinding: control.eliteBinding,
        key: this.bindingCache.controls[controlName] || process.env[control.keyEnv] || null,
        source: this.bindingCache.controls[controlName] ? 'bindings' : process.env[control.keyEnv] ? 'env' : null
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
