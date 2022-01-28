import SystemMapStar from './system-map-star'
import CopyOnClick from 'components/copy-on-click'

export default function SystemMap ({ system, setSystemObject }) {
  if (!system) return null

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
          {system.detail && system.detail.bodies && 
            <h3 className='text-primary'>
              <span className='fx-animated-text' data-fx-order='2'>
              {system.detail.bodies.length} {system.detail.bodies.length === 1 ? 'body found in system' : 'bodies found in system'}
              </span>
            </h3>}
          {(system.starports.length > 0 || system.planetaryPorts.length > system.megaships.length > 0) &&
            <h3 className='text-primary'>
              <span className='fx-animated-text' data-fx-order='3'>
                {system.starports.length > 0 && <>{system.starports.length} {system.starports.length === 1 ? 'Starport' : 'Starports'}</>}
                {system.starports.length > 0 && (system.planetaryPorts.length > 0 || system.megaships.length > 0) && <span className='system-map__seperator' />}
                {system.planetaryPorts.length > 0 && <>{system.planetaryPorts.length} {system.planetaryPorts.length === 1 ? 'Planetary Port' : 'Planetary Ports'}</>}
                {(system.starports.length > 0 || system.planetaryPorts.length > 0) && system.megaships.length > 0 && <span className='system-map__seperator' />}
                {system.megaships.length > 0 && <>{system.megaships.length} {system.megaships.length === 1 ? 'Megaship' : 'Megaships'}</>}
              </span>
            </h3>}
          {system && system.government && system.government !== 'Unknown' && !(system.government === 'None' && system?.security === 'Anarchy') &&
            <h3 className='text-primary'>
              <span className='fx-animated-text' data-fx-order='4'>
                {system.allegiance && system.allegiance !== 'Unknown' && system.allegiance}
                {' '}
                {system.government && system.government !== 'None' && system.government !== 'Unknown' && system.government}
                {(system.government && system.government !== 'None' && system.government !== 'Unknown' && system.security !== system.government) ? <><span className='system-map__seperator' />{system.security}</> : ''} 
              </span>
            </h3>}
          {system.faction && system.faction !== 'Unknown' &&
            <h3 className='text-primary'>
              <span className='fx-animated-text' data-fx-order='5'>
                {system.faction}
              </span>
            </h3>}
          {(system.stars.length > 1 && system.address && system.address === 'Unknown') && <h3 className='text-info text-muted'><span className='fx-animated-text' data-fx-order='4'>Visit system for more information</span></h3>}
        </div>
        {system.stars.map(star =>
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
