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
          {system && system.government && system.government !== 'Unknown' && !(system.government === 'None' && system?.security === 'Anarchy') &&
            <h3 className='text-primary'>
              <span className='fx-animated-text' data-fx-order='3'>
                {system.allegiance && system.allegiance !== 'Unknown' && system.allegiance}
                {system.government && system.government !== 'None' && system.government !== 'Unknown' && <><span className='system-map__seperator' />{system.government}</>}
                {(system.government && system.government !== 'None' && system.government !== 'Unknown' && system.security !== system.government) ? <><span className='system-map__seperator' />{system.security}</> : ''}
              </span>
            </h3>}
          <h3 className='text-primary'>
            <span className='fx-animated-text' data-fx-order='3'>
              {system.detail && system.detail.bodies && <>{system.detail.bodies.length} {system.detail.bodies.length === 1 ? 'Stellar Body' : 'Stellar Bodies'}</>}
              {system.starports.length > 0 && <><span className='system-map__seperator' />{system.starports.length} {system.starports.length === 1 ? 'Starport' : 'Starports'}</>}
              {system.planetaryPorts.length > 0 && <><span className='system-map__seperator' />{system.planetaryPorts.length} {system.planetaryPorts.length === 1 ? 'Planetary Port' : 'Planetary Ports'}</>}
              {system.megaships.length > 0 && <><span className='system-map__seperator' />{system.megaships.length} {system.megaships.length === 1 ? 'Megaship' : 'Megaships'}</>}
            </span>
          </h3>
          {system.faction && system.faction !== 'Unknown' &&
            <h3 className='text-primary'>
              <span className='fx-animated-text' data-fx-order='3'>
                <span className='text-muted'>Authority</span> {system.faction}
              </span>
            </h3>}
          {system.stars.length > 1 && system.address && system.address === 'Unknown' && <h3 className='text-info text-muted'><span className='fx-animated-text' data-fx-order='3'>Visit system for more information</span></h3>}
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
