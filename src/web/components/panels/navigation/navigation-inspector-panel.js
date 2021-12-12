import { STARPORTS, SURFACE_PORTS, PLANETARY_BASES, MEGASHIPS } from '../../../../service/lib/consts'
import { kelvinToCelius, kelvinToFahrenheit } from 'lib/convert'

export default function NavigationInspectorPanel ({ systemObject, setSystemObjectByName }) {
  if (!systemObject) {
    return (
      <div className='navigation-panel__inspector fx-fade-in scrollable'>
        <div className='text-primary text-muted text-center-vertical'>
          Nothing selected
        </div>
      </div>
    )
  }

  const isLandable = systemObject.isLandable || STARPORTS.concat(MEGASHIPS).includes(systemObject.type) || PLANETARY_BASES.includes(systemObject.type)

  let systemObjectSubType = systemObject.subType || systemObject.type
  if (SURFACE_PORTS.includes(systemObject.type)) systemObjectSubType = 'Planetary Port'
  if (PLANETARY_BASES.includes(systemObject.type) && !SURFACE_PORTS.includes(systemObject.type)) systemObjectSubType = 'Settlement'
  if (systemObject.type === 'Star') systemObjectSubType = systemObject.subType
  if (systemObject.type === 'Planet') systemObjectSubType = systemObject.subType

  // TODO Move to icon class
  let iconClass = 'icon icarus-terminal-'
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

  return (
    <div className='navigation-panel__inspector fx-fade-in scrollable'>

      <div className='navigation-panel__inspector-heading'>
        <i className={iconClass} />
        <h2 className='text-info'>{systemObject.name}</h2>
        <h3 className='text-primary'>{systemObjectSubType}</h3>
      </div>
      <hr />
      {(systemObject.distanceToArrival && systemObject.distanceToArrival > 0) === true &&
        <div className='navigation-panel__inspector-section'>
          <h4 className='text-primary'>Distance to main star</h4>
          <p className='text-info'>{systemObject.distanceToArrival.toFixed(0)} Ls</p>
        </div>}

      {systemObject.type === 'Star' &&
        <div className='navigation-panel__inspector-section'>
          <h4 className='text-primary'>Statistics</h4>
          {systemObject.spectralClass && <p className='text-info'>Class {systemObject.spectralClass} Star </p>}
          <p className='text-info'>{systemObject.solarMasses.toFixed(2)} Solar masses</p>
          {systemObject.radius && <p className='text-info'>{systemObject.radius.toFixed(0)} Km</p>}
          <p className='text-info'>Temperature {systemObject.surfaceTemperature} K</p>
          {systemObject.isScoopable ? <p className='text-info'>Fuel star (scoopable)</p> : <p className='text-info text-muted'>Not scoopable</p>}
        </div>}

      {systemObject.type === 'Planet' &&
        <>
          <div className='navigation-panel__inspector-section'>
            <h4 className='text-primary'>Environment</h4>
            {isLandable ? <p className='text-info'>Landable</p> : <p className='text-muted'>Not Landable</p>}
            {systemObject.gravity ? <p className='text-info'>Gravity {systemObject.gravity.toFixed(1)}g</p> : null}
            {systemObject.surfaceTemperature &&
              <p className='text-info'>
                Temperature {systemObject.surfaceTemperature}K
                ({kelvinToCelius(systemObject.surfaceTemperature)}C/{kelvinToFahrenheit(systemObject.surfaceTemperature)}F)
              </p>}
            {systemObject.volcanismType !== 'No volcanism' ? <p className='text-info'>{systemObject.volcanismType}</p> : null}
            {systemObject.terraformingState && systemObject.terraformingState !== 'Not terraformable' && <p className='text-info'>{systemObject.terraformingState}</p>}
          </div>

          {systemObject._planetaryBases &&
            <div className='navigation-panel__inspector-section'>
              <h4 className='text-primary'>Facilities</h4>
              <div className='text-info'>
                {systemObject._planetaryBases.map(base => {
                  let iconClass = 'icon icarus-terminal-'
                  if (PLANETARY_BASES.includes(base.type)) {
                    if (SURFACE_PORTS.includes(base.type)) {
                      iconClass += 'planetary-port'
                    } else {
                      iconClass += 'settlement'
                    }
                  }
                  return (
                    <p key={`navigation-inspector_${systemObject.id}_${base.id}`} className='text-link text-no-wrap' onClick={() => setSystemObjectByName(base.name)}>
                      <i className={iconClass} />
                      <span className='text-link-text text-no-wrap'>{base.name}</span>
                    </p>
                  )
                })}
              </div>
            </div>}

          {systemObject.atmosphereComposition &&
            <div className='navigation-panel__inspector-section'>
              <h4 className='text-primary'>Atmosphere</h4>
              {systemObject.atmosphereType && systemObject.atmosphereType !== 'No atmosphere' ? <p className='text-info'>{systemObject.atmosphereType}</p> : null}
              {systemObject.surfacePressure ? <p className='text-info'>Pressure {systemObject.surfacePressure.toFixed(1)} atm</p> : null}
              <p className='text-info'>Composition:</p>
              <ul className='text-info'>
                {Object.entries(systemObject.atmosphereComposition).map(e => <li key={`navigation-inspector_${systemObject.id}_atmosphere_${e[0]}`}>{e[0]} ({e[1]} %)</li>)}
              </ul>
            </div>}

          {!systemObject.atmosphereComposition &&
            <div className='navigation-panel__inspector-section'>
              <h4 className='text-primary'>Atmosphere</h4>
              <p className='text-muted'>No atmosphere</p>
            </div>}

          {systemObject.solidComposition &&
            <div className='navigation-panel__inspector-section'>
              <h4 className='text-primary'>Surface Composition</h4>
              <ul className='text-info'>
                {Object.entries(systemObject.solidComposition).map(e => <li key={`navigation-inspector_${systemObject.id}_surface_${e[0]}`}>{e[0]} ({e[1]} %)</li>)}
              </ul>
            </div>}
        </>}

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
          <h4 className='text-primary'>Government</h4>
          <p className='text-info'>
            {systemObject.government}
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
      {systemObject._services && systemObject._services.length > 0 &&
        <div className='navigation-panel__inspector-section'>
          <h4 className='text-primary'>Port Services</h4>
          <ul className='text-info'>
            {systemObject._services.map(service => <li key={`navigation-inspector_${systemObject.id}_service_${service}`}>{service}</li>)}
          </ul>
        </div>}
      {systemObject.otherServices && systemObject.otherServices.length > 0 &&
        <div className='navigation-panel__inspector-section'>
          <h4 className='text-primary'>Other Services</h4>
          <ul className='text-info'>
            {systemObject.otherServices.map(service => <li key={`navigation-inspector_${systemObject.id}_other-service_${service}`}>{service}</li>)}
          </ul>
        </div>}
    </div>
  )
}
