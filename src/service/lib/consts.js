const MEGASHIPS = [
  'Mega ship',
  // 'Fleet Carrier', // Ignore fleet carriers for now
  'Installation',
  'Capital Ship Dock',
  'Carrier Construction Dock'
]

const STARPORTS = [
  'Outpost',
  'Orbis Starport',
  'Ocellus Starport',
  'Coriolis Starport',
  'Asteroid base'
]

// Ports with services like shipyards
const SURFACE_PORTS = [
  'Planetary Port',
  'Planetary Outpost',
  'Workshop'
]

// Bases in Horizons
const PLANETARY_OUTPOSTS = [
  'Military Outpost',
  'Scientific Outpost',
  'Commercial Outpot',
  'Mining Outpost',
  'Industrial Outpost',
  'Civilian Outpost',
  'Planetary Settlement'
]

// Bases in Odyssey
const SETTLEMENTS = ['Odyssey Settlement']

// All types of ground facility
const PLANETARY_BASES = SURFACE_PORTS.concat(PLANETARY_OUTPOSTS).concat(SETTLEMENTS)

module.exports = {
  MEGASHIPS,
  STARPORTS,
  SURFACE_PORTS,
  PLANETARY_OUTPOSTS,
  SETTLEMENTS,
  PLANETARY_BASES
}
