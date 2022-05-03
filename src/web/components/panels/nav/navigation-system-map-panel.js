// import { useEffect } from 'react'
import SystemMap from 'components/panels/nav/system-map/system-map'

export default function NavigationSystemMapPanel ({ system, systemObject, setSystemObject, getSystem, cmdrStatus }) {
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
          className='text-center text-center-vertical'
          style={{ zIndex: '30', pointerEvents: 'none' }}
        >
          <h2>
            <span className='text-primary text-blink-slow'>No system information</span><br/>
            <span className='text-info text-muted' style={{fontSize: '1.5rem'}}>EDSM Telemetry Unavailable</span>
          </h2>
        </div>
        <div id='navigation-panel__map-background' className='navigation-panel__map-background'>
          <div className='navigation-panel__map-frame'>
            <div className='navigation-panel__map-frame-border navigation-panel__map-frame-border-top-left' />
            <div className='navigation-panel__map-frame-border navigation-panel__map-frame-border-top-right' />
            <div className='navigation-panel__map-frame-border navigation-panel__map-frame-border-bottom-left' />
            <div className='navigation-panel__map-frame-border navigation-panel__map-frame-border-bottom-right' />
          </div>
          <div id='navigation-panel__map-foreground' className='navigation-panel__map-foreground scrollable'>
            <SystemMap system={system} setSystemObject={setSystemObject} />
          </div>
          <div className='text-muted'>
            <div className='system-map__system-telemetry text-danger text-muted text-uppercase text-no-wrap fx-fade-in'>
              No Telemetry
            </div>
            {system.position &&
              <div className='system-map__system-position text-info text-muted text-no-wrap fx-fade-in'>
                {system.position?.[0]}<br />{system.position?.[1]}<br />{system.position?.[2]}
              </div>}
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
        <div className='navigation-panel__map-frame'>
          <div className='navigation-panel__map-frame-border navigation-panel__map-frame-border-top-left' />
          <div className='navigation-panel__map-frame-border navigation-panel__map-frame-border-top-right' />
          <div className='navigation-panel__map-frame-border navigation-panel__map-frame-border-bottom-left' />
          <div className='navigation-panel__map-frame-border navigation-panel__map-frame-border-bottom-right' />
        </div>
        <div id='navigation-panel__map-foreground' className='navigation-panel__map-foreground scrollable'>
          <SystemMap system={system} setSystemObject={setSystemObject} />
        </div>
        <div className='text-muted'>
          <div className='system-map__system-telemetry text-info text-muted text-uppercase text-no-wrap fx-fade-in'>
            EDSM Telemetry
          </div>
          {system.position &&
            <div className='system-map__system-position text-info text-muted text-no-wrap fx-fade-in'>
              {system.position?.[0]}<br />{system.position?.[1]}<br />{system.position?.[2]}
            </div>}
        </div>
        <div className='system-map__location fx-fade-in'>
          {system?.distance > 0 &&
            <h3 className='text-secondary'>
              {system.distance.toLocaleString(undefined, { maximumFractionDigits: 2 })} LY
              <span className='text-muted'> from current location</span>
            </h3>}
          {system?.distance === 0 && system.isCurrentLocation === false &&
            <h3 className='text-secondary text-muted'>
              Unknown system
            </h3>}
          {system.isCurrentLocation === true && cmdrStatus?.flags?.fsdJump === false &&
            <h3 className='text-secondary'>
              <i className='icon text-secondary icarus-terminal-location-filled' style={{ position: 'relative', top: '.2rem', left: '-.2rem', lineHeight: '1rem' }} />
              {(cmdrStatus?._location)
                ? cmdrStatus._location.map((loc, i) =>
                  <span className='text-muted' key={`location_${loc}_${i}`}>
                    {i > 0 && <i className='icon icarus-terminal-chevron-right text-muted' style={{ fontSize: '.8rem', margin: '0 .25rem' }} />}
                    {loc}
                  </span>
                  )
                : 'Current location'}
            </h3>}
          {system.isCurrentLocation === true && cmdrStatus?.flags?.fsdJump === true &&
            <h3 className='text-blink-slow text-primary' style={{ background: 'transparent' }}>Frame Shift Drive Active</h3>}
        </div>
        <div className='system-map__info fx-fade-in'>
          <div className='system-map__info-contents'>
            {((system.spaceStations.length > 0 || system.planetaryPorts.length > 0 || system.megaships.length > 0 || system.settlements.length > 0))
              ? <h3>
                {coriolisStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-coriolis-starport' /><span className='count'>{coriolisStarports}</span></span>}
                {ocellusStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-ocellus-starport' /><span className='count'>{ocellusStarports}</span></span>}
                {orbisStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-orbis-starport' /><span className='count'>{orbisStarports}</span></span>}
                {asteroidBases > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-asteroid-base' /><span className='count'>{asteroidBases}</span></span>}
                {outposts > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-outpost' /><span className='count'>{outposts}</span></span>}
                {system.megaships.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-megaship' /><span className='count'>{system.megaships.length}</span></span>}
                {system.planetaryPorts.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-planetary-port' /><span className='count'>{system.planetaryPorts.length}</span></span>}
                {system.settlements.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-settlement' /><span className='count'>{system.settlements.length}</span></span>}
                </h3>
              : <h3 className='text-secondary text-muted'>No known stations or settlements</h3>}
          </div>
        </div>
      </div>
    </div>
  )
}
