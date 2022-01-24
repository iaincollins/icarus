import SystemMap from './system-map'

export default function NavigationSystemMapPanel ({ system, systemObject, setSystemObject, getSystem }) {
  if (!system) return null

  return (
    <div className={`navigation-panel__map ${systemObject ? 'navigation-panel__map--inspector' : ''}`}>
      {(!system.stars || system.stars.length < 2) &&
        <div
          className='text-primary text-blink-slow text-center text-center-vertical'
          style={{ zIndex: '30', pointerEvents: 'none' }}
        >
          <h2>No system information</h2>
        </div>}
      <div className='navigation-panel__map-background'>
        <div className='navigation-panel__map-foreground scrollable'>
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
                Stellar cartography<br />
                telemetry from EDSM
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
