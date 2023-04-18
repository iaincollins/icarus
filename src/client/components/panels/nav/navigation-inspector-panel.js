import { SPACE_STATIONS, SURFACE_PORTS, PLANETARY_BASES, MEGASHIPS, SOL_RADIUS_IN_KM } from '../../../../shared/consts'
import { kelvinToCelius, kelvinToFahrenheit } from 'lib/convert'
import CopyOnClick from 'components/copy-on-click'

export default function NavigationInspectorPanel ({ systemObject, setSystemObjectByName }) {
  if (!systemObject) return <div className='navigation-panel__inspector navigation-panel__inspector--hidden' />

  const isLandable = systemObject.isLandable || SPACE_STATIONS.concat(MEGASHIPS).includes(systemObject.type) || PLANETARY_BASES.includes(systemObject.type)

  let systemObjectSubType = systemObject.subType || systemObject.type
  if (SURFACE_PORTS.includes(systemObject.type)) systemObjectSubType = 'Planetary Port'
  if (PLANETARY_BASES.includes(systemObject.type) && !SURFACE_PORTS.includes(systemObject.type)) systemObjectSubType = 'Settlement'
  if (systemObject.type === 'Star') systemObjectSubType = systemObject.subType
  if (systemObject.type === 'Planet') systemObjectSubType = systemObject.subType

  // TODO Move to icon class
  let iconClass = 'text-info icon icarus-terminal-'
  switch (systemObject.type.toLowerCase()) {
    case 'star':
      iconClass += 'star'
      break
    case 'outpost':
      iconClass += 'outpost'
      break
    case 'asteroid base':
      iconClass += 'asteroid-base'
      break
    case 'coriolis starport':
      iconClass += 'coriolis-starport'
      break
    case 'ocellus starport':
      iconClass += 'ocellus-starport'
      break
    case 'orbis starport':
      iconClass += 'orbis-starport'
      break
    case 'planet':
      iconClass += 'planet'
      break
    case 'mega ship':
      iconClass += 'megaship'
      break
    case 'planetary port':
      iconClass += 'planetary-port'
      break
    case 'settlement':
      iconClass += 'settlement'
      break
    default:
      if (systemObjectSubType === 'Planetary Port') iconClass += 'planetary-port'
      if (systemObjectSubType === 'Settlement') iconClass += 'settlement'
  }

  let inspectorTitle = systemObjectSubType
  if (['Planet', 'Star'].includes(systemObject.type)) inspectorTitle = systemObject.type
  if (SPACE_STATIONS.includes(systemObject.type)) inspectorTitle = 'Starport'
  if (SPACE_STATIONS.includes(systemObject.type) && systemObjectSubType === 'Outpost') inspectorTitle = 'Orbital Outpost'

  const surfacePorts = []
  const settlements = []
  systemObject?._planetaryBases?.forEach(base =>
    SURFACE_PORTS.includes(base.type) ? surfacePorts.push(base) : settlements.push(base)
  )

  // Show exploration only if there is intersting data to show
  let showExploration = false
  if (systemObject.hasOwnProperty('mapped')) showExploration = true
  if (isLandable) showExploration = true
  if (systemObject.volcanismType !== 'No volcanism') showExploration = true
  if (systemObject?.signals?.biological > 0) showExploration = true
  if (systemObject.terraformingState && systemObject.terraformingState !== 'Not terraformable' && systemObject.terraformingState !== 'Terraformed') showExploration = true

  return (
    <div className='inspector navigation-panel__inspector fx-fade-in'>
      <div className='inspector__title' onClick={() => { setSystemObjectByName(null) }}>
        <button className='inspector__close-button'>
          <i className='icon icarus-terminal-chevron-right' />
        </button>
        <h3>{inspectorTitle}</h3>
      </div>
      <div className='inspector__contents scrollable'>
        <div className='navigation-panel__inspector-heading'>
          <i className={iconClass} />
          <h2 className='text-info'><CopyOnClick>{systemObject.name}</CopyOnClick></h2>
          <h3 className='text-primary'>{systemObjectSubType}</h3>
        </div>
        <hr />
        {(systemObject.distanceToArrival && systemObject.distanceToArrival > 0) === true &&
          <div className='navigation-panel__inspector-section'>
            <h4 className='text-primary'>Distance from arrival</h4>
            <p className='text-info'>{systemObject.distanceToArrival.toLocaleString(undefined, { maximumFractionDigits: 0 })} Ls</p>
          </div>}

          {systemObject.type == 'Planet' && showExploration == true &&
            <div className='navigation-panel__inspector-section'>
              <h4 className='text-primary'>Exploration</h4>

              {systemObject.hasOwnProperty('mapped') && <>
                {systemObject.mapped === true
                  ? <p className='text-info text-muted'><i className='icarus-terminal-scan' style={{position: 'relative', top: '.3rem', fontSize: '1.5rem'}}/> Surface scanned</p>
                  : <p className='text-info'><i className='icarus-terminal-scan' style={{position: 'relative', top: '.3rem', fontSize: '1.5rem'}}/> Surface scan required</p>}
              </>}
              {isLandable ? <p className='text-info'><i className='icarus-terminal-planet-lander' style={{position: 'relative', top: '.3rem', fontSize: '1.5rem'}}/> Landable surface</p> : null}

              {systemObject.terraformingState && systemObject.terraformingState !== 'Not terraformable' && systemObject.terraformingState !== 'Terraformed' && 
                <p className='text-info'><i className='icarus-terminal-planet-terraformable' style={{position: 'relative', top: '.2rem', fontSize: '1.5rem'}}/> Terraformable</p>}

              {systemObject.volcanismType !== 'No volcanism' ? <p className='text-info text-no-wrap'><i className='icarus-terminal-planet-volcanic' style={{position: 'relative', top: '.2rem', fontSize: '1.5rem'}}/> {systemObject.volcanismType}</p> : null}

              {systemObject?.signals?.biological > 0 && !systemObject?.biologicalGenuses && <>
                {systemObject?.signals?.biological === 1 &&
                  <p className='text-info'><i className='icarus-terminal-plant' style={{position: 'relative', top: '.2rem', fontSize: '1.5rem'}}/> {systemObject?.signals?.biological} Biological Signal</p>
                }
                {systemObject?.signals?.biological > 1 &&
                  <p className='text-info'><i className='icarus-terminal-plant' style={{position: 'relative', top: '.2rem', fontSize: '1.5rem'}}/> {systemObject?.signals?.biological} Biological Signals</p>
                }
              </>}

              {systemObject.biologicalGenuses && <>
                {systemObject.biologicalGenuses.map(genus => 
                  <p key={`navigation-inspector_${systemObject.id}_bio-signal_${genus}`} className='text-info'><i className='icarus-terminal-plant' style={{position: 'relative', top: '.2rem', fontSize: '1.5rem'}}/> {genus}</p>
                )}
              </>}

              {/* {systemObject?.discovery?.commander && <p className='text-info'><span className='text-primary'>EDSM Credit</span><br/>Cmdr {systemObject.discovery.commander}</p>} */}
          </div>
        }

        {systemObject.type === 'Star' &&
          <div className='navigation-panel__inspector-section'>
            <h4 className='text-primary'>Stellar Properties</h4>
            {systemObject.isScoopable ? <p className='text-info'>Main Sequence (Fuel Star)</p> : <p className='text-info text-muted'>Not Scoopable</p>}
            {systemObject.spectralClass && <p className='text-info'>Class {systemObject.spectralClass} Star </p>}
            <p className='text-info'>Luminosity {systemObject.luminosity}</p>
            {systemObject.solarRadius && <p className='text-info'>Radius {(systemObject.solarRadius * SOL_RADIUS_IN_KM).toLocaleString(undefined, { maximumFractionDigits: 0 })} Km</p>}
            <p className='text-info'>Solar Masses {systemObject.solarMasses.toFixed(2)}</p>
            <p className='text-info'>Temperature {systemObject.surfaceTemperature} K</p>
          </div>}

        {systemObject.type === 'Planet' &&
          <>
            <div className='navigation-panel__inspector-section'>
              <h4 className='text-primary'>Environment</h4>
              {systemObject.gravity ?
              <p className='text-info'>Gravity {Math.max(0.01, Number(systemObject.gravity.toFixed(2)))}g
               {systemObject.gravity < .5 && ' (Low)'}
               {systemObject.gravity > 1.5 && ' (High)'}
              </p> : null}
              {systemObject.radius && <p className='text-info'>Radius {systemObject.radius.toLocaleString(undefined, { maximumFractionDigits: 0 })} Km</p>}
              {systemObject.surfaceTemperature &&
                <p className='text-info'>
                  Temperature {systemObject.surfaceTemperature}K
                  ({kelvinToCelius(systemObject.surfaceTemperature)}C/{kelvinToFahrenheit(systemObject.surfaceTemperature)}F)
                </p>}
            </div>

            {surfacePorts.length > 0 &&
              <div className='navigation-panel__inspector-section'>
                <h4 className='text-primary'>Ports</h4>
                <div className='text-info'>
                  {surfacePorts.map(base => (
                    <p key={`navigation-inspector_${systemObject.id}_${base.id}`} className='text-link text-no-wrap' onClick={() => setSystemObjectByName(base.name)}>
                      <i className='icon icarus-terminal-planetary-port' />
                      <span className='text-link-text text-no-wrap'>{base.name}</span>
                    </p>
                  ))}
                </div>
              </div>}

            {settlements.length > 0 &&
              <div className='navigation-panel__inspector-section'>
                <h4 className='text-primary'>Settlements</h4>
                <div className='text-info'>
                  {settlements.map(base => (
                    <p key={`navigation-inspector_${systemObject.id}_${base.id}`} className='text-link text-no-wrap' onClick={() => setSystemObjectByName(base.name)}>
                      <i className='icon icarus-terminal-settlement' />
                      <span className='text-link-text text-no-wrap'>{base.name}</span>
                    </p>
                  ))}
                </div>
              </div>}

            {systemObject.atmosphereComposition &&
              <div className='navigation-panel__inspector-section'>
                <h4 className='text-primary'>Atmosphere</h4>
                {systemObject.atmosphereType && systemObject.atmosphereType !== 'No atmosphere' ? <p className='text-info'>{systemObject.atmosphereType}</p> : null}
                {systemObject.surfacePressure ? <p className='text-info'>Pressure {parseFloat(systemObject.surfacePressure.toFixed(3))} atm</p> : null}
                <ul className='text-info'>
                  {Object.entries(systemObject.atmosphereComposition).map(e => <li key={`navigation-inspector_${systemObject.id}_atmosphere_${e[0]}`}>{e[0]} ({e[1]}%)</li>)}
                </ul>
              </div>}

            {!systemObject.atmosphereComposition &&
              <div className='navigation-panel__inspector-section'>
                <h4 className='text-primary'>Atmosphere</h4>

                <p className='text-muted'>No Atmosphere</p>
              </div>}
              {systemObject.solidComposition &&
              <div className='navigation-panel__inspector-section'>
                <h4 className='text-primary'>Material Composition</h4>
                <ul className='text-info'>
                  {Object.entries(systemObject.solidComposition).map(e => e[1] > 0 ? <li key={`navigation-inspector_${systemObject.id}_surface_${e[0]}`}>{e[0]} ({e[1]}%)</li> : '')}
                </ul>
              </div>}

          </>}

        {systemObject.materials &&
          <div className='navigation-panel__inspector-section'>
            <h4 className='text-primary'>Chemicals &amp; Minerals</h4>
            <ul className='text-info'>
              {Object.entries(systemObject.materials).map(e => <li key={`navigation-inspector_${systemObject.id}_material_${e[0]}}`}>{e[0]} ({e[1]}%)</li>)}
            </ul>
          </div>}

        {systemObject.rings &&
          <div className='navigation-panel__inspector-section'>
            <h4 className='text-primary'>Rings</h4>
            {systemObject.reserveLevel && <p className='text-info'>{systemObject.reserveLevel} Reserves</p>}
            <ul className='text-info'>
              {systemObject.rings.map((ring, i) => <li key={`navigation-inspector_${systemObject.id}_rings_${i}}`}>{ring.name} ({ring.type})</li>)}
            </ul>
          </div>}

        {(systemObjectSubType === 'Settlement' || systemObjectSubType === 'Planetary Port') && systemObject.body &&
          <div className='navigation-panel__inspector-section navigation-panel__inspector-section--location'>
            <h4 className='text-primary'>Location</h4>
            <p className='text-info text-link text-no-wrap' onClick={() => setSystemObjectByName(systemObject.body.name)}>
              <i className='icon icarus-terminal-planet' /> <span className='text-link-text text-no-wrap'>{systemObject.body.name}</span>
            </p>
          </div>}

        {systemObject.government &&
          <div className='navigation-panel__inspector-section'>
            <h4 className='text-primary'>Faction</h4>

            {systemObject?.controllingFaction?.name &&
              <p className='text-info text-uppercase'>
                <CopyOnClick>{systemObject.controllingFaction.name}</CopyOnClick>
              </p>}
            <p className='text-info'>
              {systemObject?.allegiance ?? ''} {systemObject.government}
            </p>
          </div>}

        {systemObject.economy &&
          <div className='navigation-panel__inspector-section'>
            <h4 className='text-primary'>Economy</h4>
            <p className='text-info'>
              {systemObject.economy}
            </p>
            {systemObject.secondEconomy && systemObject.secondEconomy !== systemObject.economy &&
              <p className='text-info'>
                {systemObject.secondEconomy}
              </p>}
          </div>}

        {systemObject._shipServices && systemObject._shipServices.length > 0 &&
          <div className='navigation-panel__inspector-section'>
            <h4 className='text-primary'>Ship Services</h4>
            <ul className='text-info'>
              {systemObject._shipServices.map((service, i) => <li key={`navigation-inspector_${systemObject.id}_service_${service}_${i}`}>{service}</li>)}
            </ul>
          </div>}

        {systemObject._otherServices && systemObject._otherServices.length > 0 &&
          <div className='navigation-panel__inspector-section'>
            <h4 className='text-primary'>Other Services</h4>
            <ul className='text-info'>
              {systemObject._otherServices.map((service, i) => <li key={`navigation-inspector_${systemObject.id}_other-service_${service}_${i}`}>{service}</li>)}
            </ul>
          </div>}

        {Object.prototype.hasOwnProperty.call(systemObject, 'rotationalPeriod') &&
          <div className='navigation-panel__inspector-section'>
            <h4 className='text-primary'>Orbital properties</h4>
            {systemObject?.rotationalPeriod !== null && <p className='text-info'>
              <span className='text-primary'>Rotational Period</span>
              <br />{systemObject.rotationalPeriod}
              {systemObject?.rotationalPeriodTidallyLocked && <><br />Tidally Locked</>}
            </p>}
            {systemObject?.orbitalEccentricity !== null && <p className='text-info'><span className='text-primary'>Orbital Eccentricity</span><br />{systemObject.orbitalEccentricity}</p>}
            {systemObject?.orbitalInclination !== null && <p className='text-info'><span className='text-primary'>Orbital Inclination</span><br />{systemObject.orbitalInclination}</p>}
            {systemObject?.orbitalPeriod !== null && <p className='text-info'><span className='text-primary'>Orbital Period</span><br />{systemObject.orbitalPeriod}</p>}
            {systemObject?.axialTilt !== null && <p className='text-info'><span className='text-primary'>Axial Tilt</span><br />{systemObject.axialTilt}</p>}
            {systemObject?.semiMajorAxis !== null && <p className='text-info'><span className='text-primary'>Semi-Major Axis</span><br />{systemObject.semiMajorAxis}</p>}
            {systemObject?.argOfPeriapsis !== null && <p className='text-info'><span className='text-primary'>Argument of Periapsis</span><br />{systemObject.argOfPeriapsis}</p>}
          </div>}
      </div>
    </div>
  )
}
