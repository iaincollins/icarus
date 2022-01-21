import SystemMapStar from './system-map-star'

export default function SystemMap ({ system, setSystemObject }) {
  if (!system) return null

  return (
    <>
      <div className='system-map text-info'>
        <h1>
          <span className='fx-animated-text' data-fx-order='1'>
            <i className='icon icarus-terminal-system-orbits' />
            {system.name}
          </span>
        </h1>
        {system && system.government && system.government !== 'Unknown' && !(system.government === 'None' && system?.security === 'Anarchy') &&
          <h2 className='text-primary'>
            <span className='fx-animated-text' data-fx-order='1'>
              {system.allegiance && system.allegiance !== 'Unknown' && system.allegiance}
              {system.government && system.government !== 'None' && system.government !== 'Unknown' && ` // ${system.government}`}
              {(system.government && system.government !== 'None' && system.government !== 'Unknown' && system.security !== system.government) ? ` // ${system.security}` : ''}
            </span>
          </h2>}
        {/*
        <h3 className='text-primary'>
          <span className='fx-animated-text' data-fx-order='3'>
            {system.planetaryPorts.length > 0 && <>Starports: {system.starports.length} </>}
            {system.planetaryPorts.length > 0 && <>Planetary Ports: {system.planetaryPorts.length} </>}
            {system.planetaryPorts.length > 0 && <>Megaships: {system.megaships.length} </>}
            {system.population && <>Population: {system.population} </>}
          </span>
        </h3>
        */}
        {system.faction && system.faction !== 'Unknown' &&
          <h3 className='text-primary'>
            <span className='fx-animated-text' data-fx-order='3'>
              Controlled by {system.faction}
            </span>
          </h3>}
      </div>
      {system.stars.map(star =>
        <SystemMapStar
          key={`system-map_${system.name}_${star.name}_${star.id}`}
          star={star}
          setSystemObject={setSystemObject}
        />
      )}
    </>
  )
}
