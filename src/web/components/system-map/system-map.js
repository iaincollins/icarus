import SystemMapStar from './system-map-star'

export default function SystemMap ({ system, setSystemObject }) {
  if (!system) return null

  return (
    <>
      {(!system.stars || system.stars.length < 2) &&
        <div className='text-danger text-blink text-center-vertical'>
          <h3>No information about this system</h3>
        </div>}
      <div className='system-map text-info'>
        <h1>
          <span className='fx-animated-text' data-fx-order='1'>
            <i className='icon icarus-terminal-system-orbits' />
            {system.name}
          </span>
        </h1>
        <h2 className='text-primary'>
          <span className='fx-animated-text' data-fx-order='1'>
            {system.allegiance || 'Unaligned'}
            {system.government === 'None' ? ' // No government' : ` // ${system.government}`}
            {(system.security !== system.government) ? ` // ${system.security}` : ''}
          </span>
        </h2>
        {/*
        <h3 className='text-primary'>
          <span className='fx-animated-text' data-fx-order='3'>
            {system.planetaryPorts.length > 0 && <>Starports: {system.starports.length} </>}
            {system.planetaryPorts.length > 0 && <>Planetary ports: {system.planetaryPorts.length} </>}
            {system.planetaryPorts.length > 0 && <>Megaships ports: {system.megaships.length} </>}
            {system.population && <>Popuation: {system.population} </>}
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
