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

  if (!system.stars || system.stars.length < 2) {
    return (
      <div className={`navigation-panel__map ${systemObject ? 'navigation-panel__map--inspector' : ''}`}>
        <div
          className='text-primary text-blink-slow text-center text-center-vertical'
          style={{ zIndex: '30', pointerEvents: 'none' }}
        >
          <h2>No system information</h2>
        </div>
        <div id='navigation-panel__map-background' className='navigation-panel__map-background'>
          <div id='navigation-panel__map-foreground' className='navigation-panel__map-foreground scrollable'>
            <SystemMap system={system} setSystemObject={setSystemObject} />
          </div>
        </div>
      </div>
    )
  }

  const coriolisStarports = system?.spaceStations?.filter(station => station?.type === 'Coriolis Starport')?.length ?? 0
  const ocellusStarports = system?.spaceStations?.filter(station => station?.type === 'Ocellus Starport')?.length ?? 0
  const orbisStarports = system?.spaceStations?.filter(station => station?.type === 'Orbis Starport')?.length ?? 0
  const asteroidBases = system?.spaceStations?.filter(station => station?.type === 'Asteroid base')?.length ?? 0
  const outposts = system?.spaceStations?.filter(station => station?.type === 'Outpost')?.length ?? 0

  return (
    <div className={`navigation-panel__map ${systemObject ? 'navigation-panel__map--inspector' : ''}`}>
      <div id='navigation-panel__map-background' className='navigation-panel__map-background'>
        <div id='navigation-panel__map-foreground' className='navigation-panel__map-foreground scrollable'>
          <SystemMap system={system} setSystemObject={setSystemObject} />
        </div>
        {system.position &&
          <div className='system-map__location text-info text-muted text-no-wrap fx-fade-in'>
            {system.position?.[0]}<br />{system.position?.[1]}<br />{system.position?.[2]}
          </div>}
        <div className='system-map__info fx-fade-in'>
          <div className='system-map__info-contents'>
            {system?.distance > 0 &&
              <h3 className='text-secondary'>
                {system.distance.toLocaleString(undefined, { maximumFractionDigits: 2 })} LY
                <span className='text-muted'> from current location</span>
              </h3>}
            {system?.distance === 0 && system.isCurrentLocation === false &&
              <h3 className='text-secondary text-muted'>
                Unknown system
              </h3>}
            {system.isCurrentLocation === true &&
              <h3 className='text-secondary'>
                Current location
              </h3>}
            {((system.spaceStations.length > 0 || system.planetaryPorts.length > 0 || system.megaships.length > 0 || system.settlements.length > 0))
              ? <h3 style={{ marginTop: '.25rem' }}>
                  {coriolisStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-coriolis-starport' /><span className='count'>{coriolisStarports}</span></span>}
                  {ocellusStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-ocellus-starport' /><span className='count'>{ocellusStarports}</span></span>}
                  {orbisStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-orbis-starport' /><span className='count'>{orbisStarports}</span></span>}
                  {asteroidBases > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-asteroid-base' /><span className='count'>{asteroidBases}</span></span>}
                  {outposts > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-outpost' /><span className='count'>{outposts}</span></span>}
                  {system.megaships.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-megaship' /><span className='count'>{system.megaships.length}</span></span>}
                  {system.planetaryPorts.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-planetary-port' /><span className='count'>{system.planetaryPorts.length}</span></span>}
                  {system.settlements.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-settlement' /><span className='count'>{system.settlements.length}</span></span>}
                </h3>
              : <h3 style={{ marginTop: '.25rem' }} className='text-secondary text-muted'>No known stations or settlements</h3>
          }
          </div>
        </div>
      </div>
    </div>
  )
}
