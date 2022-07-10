
const factionStates = {
  expansion: {
    description: 'Faction expanding influence'
  },
  investment: {
    description: 'Increased investment, expansion anticipated'
  },
  war: {
    description: 'War, combat missions available'
  },
  civilWar: {
    description: 'Civil war, combat missions available'
  },
  civilLiberty: {
    description: 'Civil liberty, increased stability & security'
  },
  civilUnrest: {
    description: 'Civil unrest, support & bounty missions'
  },
  election: {
    description: 'Election in progress'
  },
  elections: {
    description: 'Election in progress'
  },
  boom: {
    description: 'Economy is booming'
  },
  bust: {
    description: 'Economy is bust'
  },
  famine: {
    description: 'Famine, demand for food, support missions'
  },
  drought: {
    description: 'Drought, demand for water & emergency supplies'
  },
  blight: {
    description: 'Blight, demand for Agronomic Treatment'
  },
  outbreak: {
    description: 'Outbreak, demand for medicines, support missions'
  },
  lockdown: {
    description: 'Lockdown, services restricted, support missions'
  },
  retreat: {
    description: 'Faction retreating from system'
  },
  infrastructureFailure: {
    description: 'Failing infrastructure, demenad for food & machinery'
  },
  naturalDisaster: {
    description: 'Natural disaster, support missions available'
  },
  pirateAttack: {
    description: 'Pirate attack, support & bounty missions'
  },
  terroristAttack: {
    description: 'Terrorist attack, demand for weapons, bounty missions'
  },
  terrorism: {
    description: 'Terrorist attack, demand for weapons, bounty missions'
  }
}

module.exports = factionStates
