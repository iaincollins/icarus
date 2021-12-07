import { STARPORTS, SURFACE_PORTS, PLANETARY_BASES, MEGASHIPS } from '../../../../service/lib/consts'

export default function NavigationInspectorPanel ({ systemObject }) {
  if (!systemObject) return null

  const isLandable = systemObject.isLandable || STARPORTS.concat(MEGASHIPS).includes(systemObject.type) || PLANETARY_BASES.includes(systemObject.type)

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
    default:
      if (PLANETARY_BASES.includes(systemObject.type)) {
        if (SURFACE_PORTS.includes(systemObject.type)) {
          iconClass += 'planetary-port'
        } else {
          iconClass += 'settlement'
        }
      }
  }

  let type = systemObject.type
  if (systemObject.type === 'Odyssey Settlement') type = 'Settlement'
  if (systemObject.type === 'Star') type = systemObject.subType
  if (systemObject.type === 'Planet') type = systemObject.subType

  return (
    <div className='navigation-panel__inspector'>
      <div className='navigation-panel__inspector-heading fx-fade-in'>
        <i className={iconClass} />
        <h2 className='text-info'>{systemObject.name}</h2>
        <h3 className='text-primary'>{type}</h3>
      </div>
      <hr />
      {systemObject.type === 'Planet' &&
        <>
          <div className='navigation-panel__inspector-section'>
            <h4 className='text-primary'>Environment</h4>
            {isLandable ? <p className='text-info'>Landable</p> : <p className='text-muted'>Not Landable</p>}
            {systemObject.gravity ? <p className='text-info'>Gravity {systemObject.gravity.toFixed(1)}g</p> : null}
            {systemObject.surfaceTemperature ? <p className='text-info'>Temperature {systemObject.surfaceTemperature} Kelvin</p> : null}
            {systemObject.volcanismType !== 'No volcanism' ? <p className='text-info'>{systemObject.volcanismType}</p> : null}
          </div>

          {systemObject._planetaryBases &&
            <div className='navigation-panel__inspector-section'>
              <h4 className='text-primary'>Facilities</h4>
              <ul className='text-info'>
                {systemObject._planetaryBases.map(base => <li key={`navigation-inspector_${systemObject.id}_${base.id}`}>{base.name}</li>)}
              </ul>
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
          {systemObject.secondEconomy &&
            <p className='text-info'>
              {systemObject.secondEconomy}
            </p>}
        </div>}
      {systemObject._services &&
        <div className='navigation-panel__inspector-section'>
          <h4 className='text-primary'>Port Services</h4>
          <ul className='text-info'>
            {systemObject._services.map(service => <li key={`navigation-inspector_${systemObject.id}_service_${service}`}>{service}</li>)}
          </ul>
        </div>}
      {systemObject.otherServices &&
        <div className='navigation-panel__inspector-section'>
          <h4 className='text-primary'>Other Services</h4>
          <ul className='text-info'>
            {systemObject.otherServices.map(service => <li key={`navigation-inspector_${systemObject.id}_other-service_${service}`}>{service}</li>)}
          </ul>
        </div>}
    </div>
  )
}
