// import { useEffect } from 'react'
import { useState } from 'react'
import SystemMap from 'components/panels/nav/system-map/system-map'
import CopyOnClick from 'components/copy-on-click'
import factionStates from '../../../../shared/faction-states'

export default function NavigationSystemMapPanel ({ system, systemObject, setSystemObject, getSystem, cmdrStatus, rescanSystem = () => {}, rescanInProgress = false }) {
  const [showSystemDetails, setShowSystemDetails] = useState(true)

  if (!system) return null

  let factionStateDescription = system?.state?.replace(/([a-z])([A-Z])/g, '$1 $2')

  if (system.state) {
    Object.keys(factionStates).some(factionState => {
      if (system.state.replace(/ /g, '').toLowerCase() === factionState.toLowerCase()) {
        factionStateDescription = factionStates[factionState].description
        return true
      }
      return false
    })
  }

  // /*
  // const onScroll = (event) => {
  //   document.getElementById('navigation-panel__map-background').style.setProperty('--background-position-y-offset-stars', '-'+(event.target.scrollTop / 20)+'px')
  //   document.getElementById('navigation-panel__map-background').style.setProperty('--background-position-y-offset-grid', '-'+(event.target.scrollTop / 10)+'px')
  // }

  // useEffect(() => {
  //   document.getElementById('navigation-panel__map-foreground').addEventListener('scroll', onScroll);
  // },[])
  // */

  // Check if any bodies are visible on map (i.e. any stars *or* any "additional objects")
  const visibleBodiesOnMap = (!system.stars || (system.stars.length === 1 && (system.stars?.[0]?._children?.length) === 0))

  if (visibleBodiesOnMap) {
    return (
      <div className={`navigation-panel__map ${systemObject ? 'navigation-panel__map--inspector' : ''}`}>
        <div className='text-center-both' style={{ zIndex: '30', pointerEvents: 'none' }}>
          <h2>
            <span className='text-primary text-blink-slow'>No system information</span><br />
            <span className='text-info text-muted' style={{ fontSize: '1.5rem' }}>Telemetry Unavailable</span>
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
          <div className='system-map__toolbar-background' />
          <div className='system-map__toolbar'>
            <LocationInformation system={system} cmdrStatus={cmdrStatus} rescanSystem={rescanSystem} rescanInProgress={rescanInProgress} />
            <div className='system-map__info fx-fade-in text-uppercase'>
              <span className='text-info'>
                <i className='icarus-terminal-system-orbits' style={{ fontSize: '1.5rem', float: 'left', position: 'relative', left: '-.15rem' }} />
                <CopyOnClick append=' system'>{system?.name}</CopyOnClick>
              </span>
              <div className='system-map__info--system-facilities'>
                <span className='text-primary text-muted'>Unknown System</span>
              </div>
            </div>
          </div>
          <div className='text-muted'>
            {system.position &&
              <div className='system-map__system-position text-info text-muted text-no-wrap fx-fade-in'>
                {system.position?.[0]}<br />{system.position?.[1]}<br />{system.position?.[2]}
              </div>}
          </div>

          <div className='fx-fade-in'>
            {!system?.scanPercentComplete && 
              <div className='system-map__system-telemetry--text text-info text-uppercase text-no-wrap' onClick={(e) => rescanSystem()}>
                <p style={{margin: '0 4rem .15rem 0'}} className={rescanInProgress ? 'text-blink-slow' : 'text-muted'}>
                  <i className='icarus-terminal-scan float-left' style={{fontSize: '2.5rem', marginRight: '.15rem'}}/>
                  NO SCAN<br/>DATA
              </p>
            </div>}
         </div>
        </div>
      </div>
    )
  }

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
        <div
          onClick={() => setShowSystemDetails(!showSystemDetails)}
          className={`system-map__system-information ${showSystemDetails ? 'system-map__system-information--open' : 'button'}`}>
          {showSystemDetails === true
            ? <div className='fx-fade-in'>
              <h3 className='text-primary text-muted' style={{ position: 'relative', top: '-.1rem', marginLeft: '1.5rem'}}>System Information</h3>
              <i className='icarus-terminal-chevron-down text-primary text-muted' style={{ position: 'absolute', top: '.5rem', right: '.65rem' }} />
              <hr className='small muted' style={{marginTop: '.3rem', marginRight: '-1.75rem', marginBottom: '.3rem'}}/>
              <PointsOfInterest system={system} />
              {system.economy && system.economy?.primary !== 'Unknown' && system?.economy?.primary !== 'None' &&
                <h3 className='text-primary'>

                  <i className='icon icarus-terminal-economy' style={{ fontSize: '1rem', position: 'relative', top: '0.05rem', marginRight: '.15rem' }} />{system.economy.primary}
                  {system.economy.secondary && system.economy.secondary !== 'Unknown' && system.economy.secondary !== 'None' && ` & ${system.economy.secondary}`}
                  {' '}Economy

                </h3>}
              {system?.population > 0 &&
                <h3 className='text-primary'>
                  <i className='icon icarus-terminal-engineer' style={{ fontSize: '1rem', position: 'relative', top: '0.05rem', marginRight: '.15rem' }} />Population {system.population.toLocaleString()}
                </h3>}
              {system.faction && system?.faction !== 'Unknown' &&
                <h3 className='text-primary'>
                  <i className='icon icarus-terminal-power' style={{ fontSize: '1rem', position: 'relative', top: '0.05rem', marginRight: '.15rem' }} />{system.faction}
                </h3>}
              {system.allegiance && system.allegiance !== 'Unknown' &&
                <h3 className='text-primary'>
                  <i className='icon icarus-terminal-shield' style={{ fontSize: '1rem', position: 'relative', top: '0.05rem', marginRight: '.15rem' }} />
                  {system.allegiance && system.allegiance !== 'Unknown' && system.allegiance.replace(/([a-z])([A-Z])/g, '$1 $2')}
                  {system.government && system.government !== 'None' && system.government !== 'Unknown' && <><span className='seperator' />{system.government}</>}
                  {(system.government && system.government !== 'None' && system.government !== 'Unknown' && system.government !== 'Anarchy' && system.security !== system.government) ? <><span className='seperator' />{system.security}</> : ''}

                </h3>}
              {system.state && system.state !== 'Unknown' && system.state !== 'None' && factionStateDescription &&
                <h3 className='text-info'>
                  <i className='icon icarus-terminal-warning' style={{ fontSize: '1rem', position: 'relative', top: '0.05rem', marginRight: '.15rem' }} />
                  {factionStateDescription}
                </h3>}
            </div>
            : <>
              <span style={{display: 'block', minHeight: '2.9rem'}}>
                {/* {system.detail && system.detail.bodies && system.detail.bodies.length > 0 && */}
                <i className='icon icarus-terminal-info' style={{ fontSize: '2rem', position: 'relative', top: '.4rem', textShadow: 'none' }} />
                <i className='icarus-terminal-chevron-up' style={{ position: 'relative', top: '.5rem', left: '-.25rem' }} />
              </span>
            </>}
        </div>

        <div className='fx-fade-in'>
          {system?.scanPercentComplete && system?.scanPercentComplete !== 100 &&
            <div className={`system-map__system-telemetry--progress text-uppercase text-secondary ${rescanInProgress ? 'text-blink-slow' : ''}`} onClick={(e) => rescanSystem()}>
              <i className='icarus-terminal-scan float-left' style={{fontSize: '2.5rem', marginLeft: '.25rem'}}/>
              <div style={{position: 'absolute', right: 0}}>
                EDSM {system?.scanPercentComplete}% <br />
                <progress value={system?.scanPercentComplete} max='100' className='progress--secondary progress--border' style={{margin: '.15rem 0 -.1rem 0', height: '1.25rem', width: '5.5rem'}}/>
              </div>
          </div>}
          {system?.scanPercentComplete === 100 &&
            <div className='system-map__system-telemetry--text text-primary text-uppercase text-no-wrap'  onClick={(e) => rescanSystem()}>
            <p style={{margin: '0 4rem .15rem 0'}} className={rescanInProgress ? 'text-blink-slow' : 'text-muted'}>
              <i className='icarus-terminal-scan float-left' style={{fontSize: '2.5rem', marginRight: '.15rem'}}/>
              SYSTEM<br/>SCANNED
          </p>
          </div>}
          {!system?.scanPercentComplete && 
            <div className='system-map__system-telemetry--text text-info text-uppercase text-no-wrap' onClick={(e) => rescanSystem()}>
              <p style={{margin: '0 4rem .15rem 0'}} className={rescanInProgress ? 'text-blink-slow' : 'text-muted'}>
                <i className='icarus-terminal-scan float-left' style={{fontSize: '2.5rem', marginRight: '.15rem'}}/>
                NO SCAN<br/>DATA
            </p>
          </div>}
          {system.position &&
            <div className='system-map__system-position text-info text-muted text-no-wrap'>
              {system.position?.[0]}, {system.position?.[1]}, {system.position?.[2]}
            </div>}
        </div>

        <div className='system-map__toolbar-background' />
        <div className='system-map__toolbar'>
          <LocationInformation system={system} cmdrStatus={cmdrStatus}/>
          <div className='system-map__info fx-fade-in text-uppercase'>
            <span className='text-info'>
              <i className='icarus-terminal-system-orbits' style={{ fontSize: '1.5rem', float: 'left', position: 'relative', left: '-.15rem' }} />
              <CopyOnClick append=' system'>{system.name}</CopyOnClick>
            </span>
            <span className='text-center-vertical' style={{pointerEvents: 'none'}}>
             {system.detail && system.detail.bodies && system.detail.bodies.length > 0 &&
                <h4 className='text-primary' style={{ marginLeft: '2.6rem', marginTop: '1.2rem'}}>
                  {system.detail.bodies.length} {system.detail.bodies.length === 1 ? 'body found in system' : 'bodies found in system'}
                </h4>}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PointsOfInterest({ system }) {
  const coriolisStarports = system?.spaceStations?.filter(station => station?.type === 'Coriolis Starport')?.length ?? 0
  const ocellusStarports = system?.spaceStations?.filter(station => station?.type === 'Ocellus Starport')?.length ?? 0
  const orbisStarports = system?.spaceStations?.filter(station => station?.type === 'Orbis Starport')?.length ?? 0
  const asteroidBases = system?.spaceStations?.filter(station => station?.type === 'Asteroid base')?.length ?? 0
  const outposts = system?.spaceStations?.filter(station => station?.type === 'Outpost')?.length ?? 0

  const inhabitedSystem = (system.spaceStations.length > 0 || system.planetaryPorts.length > 0 || system.megaships.length > 0 || system.settlements.length > 0)

  if (inhabitedSystem) {
    return (
      <div className='system-map__info--icons'>
        <div style={{ width: '100%' }}>
          {coriolisStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-coriolis-starport' /><span className='count'>{coriolisStarports}</span></span>}
          {ocellusStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-ocellus-starport' /><span className='count'>{ocellusStarports}</span></span>}
          {orbisStarports > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-orbis-starport' /><span className='count'>{orbisStarports}</span></span>}
          {asteroidBases > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-asteroid-base' /><span className='count'>{asteroidBases}</span></span>}
          {outposts > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-outpost' /><span className='count'>{outposts}</span></span>}
          {system.megaships.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-megaship' /><span className='count'>{system.megaships.length}</span></span>}
          {system.planetaryPorts.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-planetary-port' /><span className='count'>{system.planetaryPorts.length}</span></span>}
          {system.settlements.length > 0 && <span className='system-map__info-icon'><i className='icon icarus-terminal-settlement' /><span className='count'>{system.settlements.length}</span></span>}
        </div>
      </div>
    )
  }
  
  const biologicalSignals = system.bodies.reduce((total, body) => total + (body?.signals?.biological ?? 0), 0)

  const geologicalSignals = system.bodies.reduce((total, body) => {
    let geologicalSignals = body?.signals?.geological ?? 0

    // If no geological signals BUT the planet is landable *and* a body is known
    // to have volcanic activity then it must be the source of *at least* one
    // geological signal
    if (geologicalSignals === 0 && body.isLandable && body.volcanismType && body.volcanismType !== 'No volcanism') {
      geologicalSignals++
    }

    return total + geologicalSignals
  }, 0)

  const humanSignals = system.bodies.reduce((total, body) => total + (body?.signals?.human ?? 0), 0)
  const earthlikeWorlds = system.bodies.reduce((total, body) => body?.subType?.toLowerCase() === 'earth-like world' ? total + 1 : total, 0)
  const waterWorlds = system.bodies.reduce((total, body) => body?.subType?.toLowerCase() === 'water world' ? total + 1 : total, 0)
  const ammoniaWorlds = system.bodies.reduce((total, body) => body?.subType?.toLowerCase() === 'ammonia world' ? total + 1 : total, 0)
  const terraformableWorlds = system.bodies.reduce((total, body) => (body.terraformingState && body.terraformingState !== 'Not terraformable' && body.terraformingState !== 'Terraformed') ? total + 1 : total, 0)
  const highValueGasGiants = system.bodies.reduce((total, body) => body?.subType?.toLowerCase()?.includes('class ii gas giant') ? total + 1 : total, 0)
  const metalRichPlanets = system.bodies.reduce((total, body) => body?.subType?.toLowerCase() === 'metal rich' ? total + 1 : total, 0)

  const interestingFeatures = (biologicalSignals > 0 || geologicalSignals > 0 || humanSignals > 0 || earthlikeWorlds > 0 || waterWorlds > 0 || ammoniaWorlds > 0 || terraformableWorlds > 0 || highValueGasGiants > 0 || metalRichPlanets > 0)

  if (interestingFeatures) {
    return (
      <div className='system-map__info--icons'>
        <div style={{ width: '100%' }}>
          {humanSignals > 0 && <h3 className='text-primary'><span className='system-map__info-icon'><i className='icon icarus-terminal-poi' /><span className='count'>{humanSignals} {humanSignals === 1 ? 'Human Origin Signal' : 'Human Origin Signals'}</span></span></h3>}
          {biologicalSignals > 0 && <h3 className='text-primary'><span className='system-map__info-icon'><i className='icon icarus-terminal-plant' /><span className='count'>{biologicalSignals} {biologicalSignals === 1 ? 'Biological Signal' : 'Biological Signals'}</span></span></h3>}
          {geologicalSignals > 0 && <h3 className='text-primary'><span className='system-map__info-icon'><i className='icon icarus-terminal-planet-volcanic' /><span className='count'>{geologicalSignals} {geologicalSignals === 1 ? 'Geological Signal' : 'Geological Signals'}</span></span></h3>}
          {earthlikeWorlds > 0 && <h3 className='text-primary'><span className='system-map__info-icon'><i className='icon icarus-terminal-planet-earthlike' /><span className='count'>{earthlikeWorlds} {earthlikeWorlds === 1 ? 'Earth-like World' : 'Earth-like Worlds'}</span></span></h3>}
          {waterWorlds > 0 && <h3 className='text-primary'><span className='system-map__info-icon'><i className='icon icarus-terminal-planet-water-world' /><span className='count'>{waterWorlds} {waterWorlds === 1 ? 'Water World' : 'Water Worlds'}</span></span></h3>}
          {ammoniaWorlds > 0 && <h3 className='text-primary'><span className='system-map__info-icon'><i className='icon icarus-terminal-planet-ammonia-world' /><span className='count'>{ammoniaWorlds} {ammoniaWorlds === 1 ? 'Ammonia World' : 'Ammonia Worlds'}</span></span></h3>}
          {terraformableWorlds > 0 && <h3 className='text-primary'><span className='system-map__info-icon'><i className='icon icarus-terminal-planet-terraformable' /><span className='count'>{terraformableWorlds} {terraformableWorlds === 1 ? 'Terraformable Planet' : 'Terraformable Planets'}</span></span></h3>}
          {highValueGasGiants > 0 && <h3 className='text-primary'><span className='system-map__info-icon'><i className='icon icarus-terminal-planet-gas-giant' /><span className='count'>{highValueGasGiants} {highValueGasGiants === 1 ? 'Class II Gas Giant' : 'Class II Gas Giants'}</span></span></h3>}
          {metalRichPlanets > 0 && <h3 className='text-primary'><span className='system-map__info-icon'><i className='icon icarus-terminal-planet-high-metal-value' /><span className='count'>{metalRichPlanets} {metalRichPlanets === 1 ? 'Metal Rich Planet' : 'Metal Rich Planets'}</span></span></h3>}
       </div>
      </div>
    )
  }

  return (
    <h3 className='system-map__info--icons text-uppercase text-info text-muted'><span className='system-map__info-icon'><span className='count'>No notable signals</span></span></h3>
   )
}

function LocationInformation ({ system, cmdrStatus, rescanSystem, rescanInProgress }) {
  return (
    <div className='system-map__location fx-fade-in hidden-small'>
      {system?.distance > 0 &&
        <div className='text-center-vertical text-right'>
          <h3 className='text-primary text-no-wrap'>
            <div>
              {system.distance.toLocaleString(undefined, { maximumFractionDigits: 2 })} LY <span className='text-muted'>from</span>
            </div>
            <div className='text-muted'>current system</div>
          </h3>
        </div>}
      {system?.distance === 0 && system.isCurrentLocation === false &&
        <div className='text-primary text-muted text-center-vertical'>
          <h3>
            Unknown system
          </h3>
        </div>}
      {system.isCurrentLocation === true && cmdrStatus?.flags?.fsdJump === false &&
        <div className='text-info text-center-vertical'>
          <h3 style={{ width: '100%' }}>
            <i className='icon icarus-terminal-location-filled text-secondary' style={{ position: 'relative', top: '.2rem', left: '-.2rem', lineHeight: '1rem' }} />
            {(cmdrStatus?._location)
              ? cmdrStatus._location.map((loc, i) =>
                <span key={`location_${loc}_${i}`}>
                  {i > 0 && <>
                    <br/>
                    <i className='icon icarus-terminal-chevron-right text-muted' style={{ fontSize: '.8rem', margin: '0 .25rem' }} />
                  </>}
                  {loc}
                </span>
                )
              : 'Current location'}
          </h3>
        </div>}
    </div>
  )
}
