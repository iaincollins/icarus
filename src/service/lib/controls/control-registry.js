// ICARUS names stay stable even if the underlying Elite binding or input
// backend changes.
const CONTROL_REGISTRY = {
  lights: {
    eliteBinding: 'ShipSpotLightToggle',
    keyEnv: 'ICARUS_CONTROL_LIGHTS_KEY'
  },
  nightVision: {
    eliteBinding: 'NightVisionToggle',
    keyEnv: 'ICARUS_CONTROL_NIGHT_VISION_KEY'
  },
  landingGear: {
    eliteBinding: 'LandingGearToggle',
    keyEnv: 'ICARUS_CONTROL_LANDING_GEAR_KEY'
  },
  cargoHatch: {
    eliteBinding: 'ToggleCargoScoop',
    keyEnv: 'ICARUS_CONTROL_CARGO_HATCH_KEY'
  },
  hardpoints: {
    eliteBinding: 'DeployHardpointToggle',
    keyEnv: 'ICARUS_CONTROL_HARDPOINTS_KEY'
  }
}

module.exports = {
  CONTROL_REGISTRY
}
