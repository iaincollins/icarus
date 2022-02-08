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
          <h2 style={{ marginTop: '2em' }}>No system information</h2>
        </div>}
      <div id='navigation-panel__map-background' className='navigation-panel__map-background'>
        <div id='navigation-panel__map-foreground' className='navigation-panel__map-foreground scrollable'>
          <SystemMap system={system} setSystemObject={setSystemObject} />
        </div>
        <div className='system-map__info fx-fade-in'>
          <table>
            {(system.spaceStations.length > 0 || system.planetaryPorts.length > 0 || system.megaships.length > 0 || system.settlements.length > 0) &&
              <tr>
                <td colSpan={2} className='system-map__info-contents text-left'>
                  <h3>
                    {coriolisStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-coriolis-starport' />{coriolisStarports}</span>}
                    {ocellusStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-ocellus-starport' />{ocellusStarports}</span>}
                    {orbisStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-orbis-starport' />{orbisStarports}</span>}
                    {asteroidBases > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-asteroid-base' />{asteroidBases}</span>}
                    {outposts > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-outpost' />{outposts}</span>}
                    {system.megaships.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-megaship' />{system.megaships.length}</span>}
                    {system.planetaryPorts.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-planetary-port' />{system.planetaryPorts.length}</span>}
                    {system.settlements.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-settlement' />{system.settlements.length}</span>}
                  </h3>
                </td>
              </tr>}

            {system.address && system.address !== 'Unknown' && system.position &&
              <tr>
                <td className='system-map__info-contents text-left'>
                  <span className='text-secondary text-muted text-uppercase '>
                    POS {system.position?.[0]}, {system.position?.[1]}, {system.position?.[2]}
                  </span>
                </td>
                <td className='system-map__info-contents'>
                  <span className='text-secondary text-muted text-uppercase'>
                    <span>ID {system.address}</span>
                  </span>
                </td>
              </tr>}
          </table>

          {system.address && system.address === 'Unknown' &&
            <table>
              <tr>
                <td className='system-map__info-contents text-left' style={{ overflow: 'visible', paddingLeft: '1.75rem' }} >
                  <span onClick={() => getSystem()} style={{ pointerEvents: 'all' }} className='text-link text-uppercase'>
                    <i style={{ position: 'absolute', top: '.25rem', left: '.25rem', lineHeight: '1rem' }} className='icon icarus-terminal-chevron-left' />
                    <span className='text-link-text'>Current system</span>
                  </span>
                </td>
                <td className='system-map__info-contents text-right'>
                  <span className='text-secondary text-muted text-uppercase'>
                    EDSM Telemetry 
                  </span>
                </td>
              </tr>
            </table>}
        </div>
      </div>
    </div>
  )
}
