import SystemMapStar from './system-map-star'

export default function SystemMap ({ system, setSystemObject }) {
  if (!system) return null

  return (
    <>
      <div className='system-map text-primary'>
        <h1>
          <span className='fx-animated-text' data-fx-order='1'>
            <i className='icon icarus-terminal-system-orbits' />
            {system.name}
          </span>
        </h1>
        <h2 className='text-secondary'>
          <span className='fx-animated-text' data-fx-order='1'>
            {system.allegiance || 'Unaligned'}
            {system.government === 'None' ? ' // No government' : ` // ${system.government}`}
            {(system.security !== system.government) ? ` // ${system.security}` : ''}
          </span>
        </h2>
        <h3 className='text-secondary'>
          {/* <span className="fx-animated-text" data-fx-order="2">${loadedSystemInfo === true ? `
          ${Render.numberOf(numberOfStars, 'star')},
          ${Render.numberOf(planets, 'planet')},
          ${Render.numberOf(starports, 'starport')},
          ${Render.numberOf(planetaryPorts, 'planetary port')},
          ${Render.numberOf(settlements, 'settlement')}
          <!--
          ${Render.numberOf(planetaryOutposts, 'outpost')},
          ${Render.numberOf(megaships, 'megaship')},
          ${Render.numberOf(system?.population, 'people', false)}
          -->
          ` : ''}
        </span> */}
          <span className='fx-animated-text' data-fx-order='3'>
            {system.faction && system.faction !== 'Unknown'
              ? `Controlled by ${system.faction}`
              : ''}
          </span>
        </h3>
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
