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
          {system.address && system.address !== 'Unknown' && system.position &&
            <>
              <span className='text-secondary text-muted text-uppercase float-left text-left'>
                {system.position?.[0]}<br />
                {system.position?.[1]}<br />
                {system.position?.[2]}
              </span>
              <span className='text-uppercase float-right'>
                <br />
                <span className='text-primary'>Current System</span><br />
                <span className='text-secondary text-muted'>Address {system.address}</span>
              </span>
            </>}
          {system.address && system.address === 'Unknown' &&
            <>
              <span className='text-secondary text-muted text-uppercase float-left text-left'>
                <br />
                Telemetry from EDSM
              </span>
              <span className='text-secondary text-muted text-uppercase'>
                Remote system
              </span>
              <br />
              <span onClick={() => getSystem()} style={{ pointerEvents: 'all' }} className='text-link text-uppercase'>
                <span className='text-link-text'>Display current system</span>
              </span>
            </>}
        </div>
      </div>
    </div>
  )
}
