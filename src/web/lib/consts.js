const MEGASHIPS = [
  'Mega ship',
  'Fleet Carrier',
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
const PLANETARY_PORTS = ['Planetary Port']

// Bases in Horizons
const PLANETARY_OUTPOSTS = [
  'Military Outpost',
  'Scientific Outpost',
  'Commercial Outpot',
  'Mining Outpost',
  'Industrial Outpost',
  'Civilian Outpost',
  'Planetary Settlement',
  'Planetary Outpost'
]

// Bases in Odyssey
const SETTLEMENTS = ['Odyssey Settlement']

// All types of ground facility
const PLANETARY_BASES = PLANETARY_PORTS.concat(PLANETARY_OUTPOSTS).concat(SETTLEMENTS)

export default {
  MEGASHIPS,
  STARPORTS,
  PLANETARY_PORTS,
  PLANETARY_OUTPOSTS,
  SETTLEMENTS,
  PLANETARY_BASES
}
