// import { useEffect } from 'react'
import SystemMap from './system-map'

export default function NavigationSystemMapPanel ({ system, systemObject, setSystemObject, getSystem }) {
  if (!system) return null

  /*
  const onScroll = (event) => {
    document.getElementById('navigation-panel__map-background').style.setProperty('--background-position-y-offset-stars', '-'+(event.target.scrollTop / 20)+'px')
    document.getElementById('navigation-panel__map-background').style.setProperty('--background-position-y-offset-grid', '-'+(event.target.scrollTop / 10)+'px')
  }

  useEffect(() => {
    document.getElementById('navigation-panel__map-foreground').addEventListener('scroll', onScroll);
  },[])
  */

  const coriolisStarports = system?.spaceStations?.filter(station => station?.type === 'Coriolis Starport').length
  const ocellusStarports = system?.spaceStations?.filter(station => station?.type === 'Ocellus Starport').length
  const orbisStarports = system?.spaceStations?.filter(station => station?.type === 'Orbis Starport').length
  const asteroidBases = system?.spaceStations?.filter(station => station?.type === 'Asteroid base').length
  const outposts = system?.spaceStations?.filter(station => station?.type === 'Outpost').length

  return (
    <div className={`navigation-panel__map ${systemObject ? 'navigation-panel__map--inspector' : ''}`}>
      {(!system.stars || system.stars.length < 2) &&
        <div
          className='text-primary text-blink-slow text-center text-center-vertical'
          style={{ zIndex: '30', pointerEvents: 'none' }}
        >
          <h2>No system information</h2>
        </div>}
      <div id='navigation-panel__map-background' className='navigation-panel__map-background'>
        <div id='navigation-panel__map-foreground' className='navigation-panel__map-foreground scrollable'>
          <SystemMap system={system} setSystemObject={setSystemObject} />
        </div>
        {system.position &&
          <div className='system-map__location text-secondary text-muted text-no-wrap fx-fade-in'>
            {system.position?.[0]}<br />{system.position?.[1]}<br />{system.position?.[2]}
          </div>}
        <div className='system-map__info fx-fade-in'>
          <div className='system-map__info-contents'>
            {system?.distance > 0 &&
              <h3 className='text-secondary text-muted' style={{ marginBottom: '.5rem' }}>
                {system.distance.toLocaleString(undefined, { maximumFractionDigits: 2 })} LY from current system
              </h3>}
            {system?.distance === 0 &&
              <h3 className='text-primary' style={{ marginBottom: '.5rem' }}>
                Current system
              </h3>}
            {(system.spaceStations.length > 0 || system.planetaryPorts.length > 0 || system.megaships.length > 0 || system.settlements.length > 0) &&
              <h3>
                {coriolisStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-coriolis-starport' />{coriolisStarports}</span>}
                {ocellusStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-ocellus-starport' />{ocellusStarports}</span>}
                {orbisStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-orbis-starport' />{orbisStarports}</span>}
                {asteroidBases > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-asteroid-base' />{asteroidBases}</span>}
                {outposts > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-outpost' />{outposts}</span>}
                {system.megaships.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-megaship' />{system.megaships.length}</span>}
                {system.planetaryPorts.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-planetary-port' />{system.planetaryPorts.length}</span>}
                {system.settlements.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-settlement' />{system.settlements.length}</span>}
              </h3>}
          </div>
        </div>
      </div>
    </div>
  )
}
