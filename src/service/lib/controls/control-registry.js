// Elite binding names are the stable command IDs. ICARUS only overlays UI and
// safety metadata where automatic discovery cannot infer enough.
const CONTROL_METADATA = {
  ShipSpotLightToggle: {
    label: 'Ship Lights',
    stateFlag: 'lightsOn'
  },
  NightVisionToggle: {
    label: 'Night Vision',
    stateFlag: 'nightVision'
  },
  ToggleCargoScoop: {
    label: 'Cargo Hatch',
    stateFlag: 'cargoScoopDeployed'
  },
  LandingGearToggle: {
    label: 'Landing Gear',
    stateFlag: 'landingGearDown'
  },
  DeployHardpointToggle: {
    label: 'Hardpoints',
    stateFlag: 'hardpointsDeployed'
  },
  GalaxyMapOpen: {
    label: 'Galaxy Map'
  },
  SystemMapOpen: {
    label: 'System Map'
  },
  TargetNextRouteSystem: {
    label: 'Next Route System'
  },
  CycleNextTarget: {
    label: 'Next Target'
  },
  CyclePreviousTarget: {
    label: 'Previous Target'
  },
  FireChaffLauncher: {
    label: 'Chaff'
  },
  RecallDismissShip: {
    label: 'Recall / Dismiss Ship'
  },
  EjectAllCargo: {
    requiresConfirmation: true
  },
  ToggleDriveAssist: {
    label: 'Drive Assist',
    context: 'srv'
  },
  HumanoidToggleNightVision: {
    label: 'Flashlight',
    context: 'on-foot'
  }
}

// The bindings file also contains continuous movement, steering, and camera
// controls. They are intentionally excluded from dashboard action buttons.
const STEERING_CONTROL_PATTERNS = [
  /Axis/,
  /Raw$/,
  /Steer/,
  /Thrust/,
  /Throttle/,
  /DriveSpeed/,
  /ForwardButton$/,
  /BackwardButton$/,
  /LeftButton$/,
  /RightButton$/,
  /UpButton$/,
  /DownButton$/,
  /Pitch/,
  /Yaw/,
  /Roll/,
  /HeadLook/,
  /Headlook/i,
  /Camera/,
  /^Cam/,
  /^EnableCamera/,
  /^FixCamera/,
  /^FreeCam/,
  /^MoveFreeCam/,
  /^MovePlacementCam/,
  /^PhotoCamera/,
  /^PlacementCam/,
  /^PitchCamera/,
  /^PitchPlacementCamera/,
  /^QuitCamera/,
  /^RollCamera/,
  /^StoreCam/,
  /^StorePitchCamera/,
  /^StoreYawCamera/,
  /^ThrottleRangeFreeCam/,
  /^ToggleFreeCam/,
  /^ToggleReverseThrottleInputFreeCam/,
  /^VanityCamera/,
  /^YawCamera/,
  /^YawPlacementCamera/,
  /^CommanderCreator_Rotation/,
  /^SAAThirdPerson/,
  /^ExplorationFSSCamera/,
  /^ExplorationFSSRadioTuning/
]

const MISC_CONTROL_PATTERNS = [
  /^ToggleAdvanceMode$/,
  /^ToggleButtonUpInput$/,
  /^DisableRotationCorrectToggle$/,
  /^FocusCommsPanel$/,
  /^FocusLeftPanel$/,
  /^FocusRadarPanel$/,
  /^FocusRightPanel$/,
  /^HMDReset$/,
  /^OpenCodexGoToDiscovery$/,
  /^QuickCommsPanel$/,
  /^ToggleRotationLock$/,
  /^ChangeConstructionOption$/,
  /^DecreaseSpeedButtonMax$/,
  /^FStop/,
  /^GalaxyMapHome$/,
  /^IncreaseSpeedButtonMax$/,
  /^MicrophoneMute$/,
  /^MouseReset$/,
  /^OpenOrders$/,
  /^BlockMouseDecay$/,
  /^ForwardKey$/,
  /^BackwardKey$/,
  /^SetSpeed/,
  /PrimaryFire/,
  /SecondaryFire/,
  /^WeaponColour/,
  /^EngineColour/,
  /^ShowPGScoreSummaryInput$/,
  /^Pause$/,
  /^FriendsMenu$/,
  /^TriggerColonisationModule$/,
  /^UIFocus/,
  /^UI_(Up|Down|Left|Right|Select|Back|Toggle)$/,
  /^UseAlternateFlightValues/,
  /^CycleNextPanel$/,
  /^CyclePreviousPanel$/,
  /^CycleNextPage$/,
  /^CyclePreviousPage$/,
  /^GalnetAudio_/,
  /^Exploration/
]

function isDashboardControl (name, bindingNode) {
  if (!name || name === '$') return false
  if (!bindingNode || typeof bindingNode !== 'object') return false
  if (STEERING_CONTROL_PATTERNS.some(pattern => pattern.test(name))) return false
  return Boolean(bindingNode.Primary || bindingNode.Secondary)
}

function inferControlContext (name) {
  if (/Emote/.test(name)) return 'emote'
  if (/^MultiCrew|^Order|^TargetWingman|^WingNavLock/.test(name)) return 'multicrew'
  if (MISC_CONTROL_PATTERNS.some(pattern => pattern.test(name))) return 'misc'
  if (/Humanoid|Store|Settlement|CommanderCreator/.test(name)) return 'on-foot'
  if (/Buggy|Vehicle|_Buggy$/.test(name)) return 'srv'
  return 'ship'
}

function formatControlLabel (name) {
  return name
    .replace(/_Buggy$/, '')
    .replace(/^Humanoid/, '')
    .replace(/^Vehicle/, 'SRV ')
    .replace(/^Toggle/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\bButton\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function createDiscoveredControl (name) {
  const metadata = CONTROL_METADATA[name] || {}

  return {
    label: metadata.label || formatControlLabel(name),
    context: metadata.context || inferControlContext(name),
    eliteBinding: name,
    inputMode: metadata.inputMode || 'tap',
    stateFlag: metadata.stateFlag || null,
    requiresConfirmation: metadata.requiresConfirmation === true
  }
}

module.exports = {
  CONTROL_METADATA,
  createDiscoveredControl,
  isDashboardControl
}
