import SystemMapStar from './system-map-star'
import CopyOnClick from 'components/copy-on-click'

const factionStates = {
  expansion: {
    description: 'Controlling faction expanding influence'
  },
  investment: {
    description: 'Ongoing investment, expansion anticipated'
  },
  war: {
    description: 'War, combat missions available'
  },
  civilWar: {
    description: 'Civil war, combat missions available'
  },
  elections: {
    description: 'Elections underway'
  },
  boom: {
    description: 'Economy booming'
  },
  bust: {
    description: 'Economy bust'
  },
  civilUnrest: {
    description: 'Civil Unrest, reduced security, support & bounty missions'
  },
  famine: {
    description: 'Famine, high demand for food, support missions'
  },
  outbreak: {
    description: 'Outbreak, high demand for medicines, support missions'
  },
  lockdown: {
    description: 'Lockdown, services restricted, support missions'
  },
  retreat: {
    description: 'Controlling faction retreating from system'
  },
  naturalDisaster: {
    description: 'Natural disaster, support missions available'
  },
  pirateAttack: {
    description: 'Pirate attack, support & bounty missions'
  },
}

export default function SystemMap ({ system, setSystemObject }) {
  if (!system) return null

  let factionStateDescription = system?.state?.replace(/([a-z])([A-Z])/g, '$1 $2')

  if (system.state) {
    Object.keys(factionStates).some(factionState => {
      if (system.state.replace(/ /g, '').toLowerCase() === factionState.toLowerCase()) {
        factionStateDescription = factionStates[factionState].description
        return true
      }
    })
  }

  return (
    <>
      <div className='system-map'>
        <div className='system-map__title'>
          <h1>
            <span className='fx-animated-text' data-fx-order='1'>
              <i className='icon icarus-terminal-system-orbits' />
              <CopyOnClick>{system.name}</CopyOnClick>
            </span>
          </h1>
          {system.detail && system.detail.bodies && system.detail.bodies.length > 0 &&
            <h3 className='text-primary'>
              <span className='fx-animated-text' data-fx-order='2'>
                {system.detail.bodies.length} {system.detail.bodies.length === 1 ? 'body found in system' : 'bodies found in system'}
              </span>
            </h3>}
          {system.state && system.state !== 'Unknown' && system.state !== 'None' && factionStateDescription && 
            <h3 className='text-info'>
              <span className='fx-animated-text' data-fx-order='3'>
                {factionStateDescription}
              </span>
            </h3>}
          {system.allegiance && system.allegiance !== 'Unknown' &&
            <h3 className='text-info text-muted'>
              <span className='fx-animated-text' data-fx-order='4'>
                {system.allegiance && system.allegiance !== 'Unknown' && system.allegiance.replace(/([a-z])([A-Z])/g, '$1 $2')}
                {system.government && system.government !== 'None' && system.government !== 'Unknown' && <><span className='seperator' />{system.government}</>}
                {(system.government && system.government !== 'None' && system.government !== 'Unknown' && system.government !== 'Anarchy' && system.security !== system.government) ? <><span className='seperator' />{system.security}</> : ''}
              </span>
            </h3>}
          {system.economy && system.economy?.primary !== 'Unknown' && system?.economy?.primary !== 'None' &&
            <h3 className='text-info text-muted'>
              <span className='fx-animated-text' data-fx-order='5'>
                {system.economy.primary}
                {system.economy.secondary && system.economy.secondary !== 'Unknown' && system.economy.secondary !== 'None' && ` & ${system.economy.secondary}`}
                {' '}Economy
              </span>
            </h3>}
          {system.faction && system.faction !== 'Unknown' &&
            <h3 className='text-info text-muted'>
              <span className='fx-animated-text' data-fx-order='6'>
                Authority: {system.faction}
              </span>
            </h3>}
        </div>
        {system?.stars?.map(star =>
          <SystemMapStar
            key={`system-map_${system.name}_${star.name}_${star.id}`}
            star={star}
            setSystemObject={setSystemObject}
          />
        )}
      </div>
    </>
  )
}
