import CopyOnClick from 'components/copy-on-click'
import { SPACE_STATIONS, SURFACE_PORTS, PLANETARY_BASES, MEGASHIPS } from '../../../../shared/consts'

export default function NavigationListPanel ({ system, systemObject, setSystemObject, showHelp }) {
  if (!system) return null

  // Check if any bodies are visible on map (i.e. any stars *or* any "additional objects")
  const visibleBodiesOnMap = (!system.stars || (system.stars.length === 1 && (system.stars?.[0]?._children?.length) === 0))

  return (
    <div className={`navigation-panel__list ${systemObject ? 'navigation-panel__list--inspector' : ''}`}>
      {visibleBodiesOnMap &&
        <div className='text-center-both' style={{ zIndex: '30', pointerEvents: 'none' }}>
          <h2>
            <span className='text-primary text-blink-slow'>No system information</span><br />
            <span className='text-info text-muted' style={{ fontSize: '1.5rem' }}>Telemetry Unavailable</span>
          </h2>
        </div>}
      <div className='scrollable'>
        <button
          className='button button--transparent button--icon circle' onClick={showHelp}
          tabIndex={3}
          style={{ position: 'absolute', top: '.25rem', right: '1.5rem', height: '2.25rem', width: '2.25rem', zIndex: 20 }}
        >
          <i style={{ fontSize: '1.8rem', lineHeight: '2.3rem' }} className='icon icarus-terminal-help' />
        </button>
        <table className='table--animated table--interactive'>
          <thead>
            <tr>
              <th style={{ paddingTop: '.4rem' }} className='text-info'>
                <i style={{ fontSize: '1.5rem', marginRight: '.25rem', position: 'relative', left: '.1rem', xtop: '-.1rem' }} className='float-left icarus-terminal-system-orbits' />
                <CopyOnClick append=' system'>{system.name}</CopyOnClick>
              </th>
              <th style={{ width: '1rem' }} className='hidden-small'>&nbsp;</th>
            </tr>
          </thead>
          <tbody className='fx-fade-in'>
            <NavigationTableBody system={system} setSystemObject={setSystemObject} />
            {/* {system.stars.map(star => <NavigationTableRow key={`${star.name}_${star.bodyId}`} systemObject={star}/>
            // <>
            // {NavigationTableRow(star)}
            // {star._children.map((systemObject, i) =>
            //   <>
            //     {NavigationTableRow(systemObject, star.type === 'Null' ? 0 : 1)}
            //     {(systemObject._children.map((childSystemObject, i) =>
            //       NavigationTableRow(childSystemObject, star.type === 'Null' ? 1 : 2))
            //     )}
            //   </>
            // )}
            // </>
          )} */}
            {(!system.detail || !system.detail.bodies || system.detail.bodies.length === 0) &&
              <tr>
                <td colSpan='2' className='text-muted text-center'>&nbsp;</td>
              </tr>}
          </tbody>
        </table>
        <hr className='small' style={{ marginTop: 0 }} />
      </div>
    </div>
  )
}

function NavigationTableBody ({ system, setSystemObject }) {
  let tableRows = []

  if (!system?.stars) return tableRows // Handle unknown systems

  for (const star of system.stars) {
    tableRows.push(<NavigationTableRow key={`${star.name}_${star.id}`} stars={system.stars} systemObject={star} setSystemObject={setSystemObject} />)

    for (const systemObject of star._children) {
      tableRows = tableRows.concat(<NavigationTableRowChildren key={`${systemObject.name}_${systemObject.id}`} stars={system.stars} systemObject={systemObject} setSystemObject={setSystemObject} />)
    }
  }

  return tableRows
}

function NavigationTableRowChildren ({ stars, systemObject, setSystemObject, depth = 1 }) {
  let tableRows = []

  tableRows.push(<NavigationTableRow key={`${systemObject.name}_${systemObject.id}`} stars={stars} systemObject={systemObject} depth={depth} setSystemObject={setSystemObject} />)

  // Includes Planets, Starports and Megaships in orbit
  if (systemObject._children) {
    for (const childSystemObject of systemObject._children) {
      tableRows = tableRows.concat(<NavigationTableRowChildren key={`${childSystemObject.name}_${childSystemObject.id}`} stars={stars} systemObject={childSystemObject} setSystemObject={setSystemObject} depth={depth + 1} />)
    }
  }

  if (systemObject._planetaryBases) {
    for (const planetaryBase of systemObject._planetaryBases) {
      tableRows = tableRows.concat(<NavigationTableRowChildren key={`${planetaryBase.name}_${planetaryBase.id}`} stars={stars} systemObject={planetaryBase} setSystemObject={setSystemObject} depth={depth + 1} />)
    }
  }
  return tableRows
}

function NavigationTableRow ({ stars, systemObject, depth = 0, setSystemObject }) {
  if (!systemObject.type) {
    console.warn('Unknown type of system object', systemObject)
    return null
  }

  if (systemObject.type === 'Null') {
    if (systemObject._children.length > 0 && stars.length > 1) {
      return (<tr className='table-row--disabled'><td colSpan='2'><hr /></td></tr>)
    } else {
      return null
    }
  }

  const isLandable = systemObject.isLandable || SPACE_STATIONS.concat(MEGASHIPS).includes(systemObject.type) || PLANETARY_BASES.includes(systemObject.type)
  const isAtmospheric = systemObject.atmosphereComposition && !systemObject?.subType?.toLowerCase()?.includes('gas giant')

  // TODO Move to icon class
  let iconClass = 'icon system-object-icon icarus-terminal-'
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
      if (isLandable) {
        if (isAtmospheric) {
          iconClass += 'planet-atmosphere-landable'
        } else {
          iconClass += 'planet-landable'
        }
      } else {
        if (isAtmospheric) {
          iconClass += 'planet-atmosphere'
        } else {
          iconClass += 'planet'
        }
      }
      break
    case 'mega ship':
      iconClass += 'megaship'
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

  if (isLandable) { iconClass += ' text-secondary' }

  return (
    <tr data-system-object-name={systemObject.name} tabIndex='2' onFocus={() => setSystemObject(systemObject)}>
      <td>
        <div style={{ paddingLeft: `${(depth * 0.8) + 2}rem`, paddingRight: '.75rem' }} className='text-no-wrap'>
          <i className={iconClass} />
          {systemObject.label
            ? <>
                <span className='visible-medium'>{systemObject.label}</span>
                <span className='hidden-medium'>{systemObject.name}</span>
              </>
            : systemObject.name}
          <span className={systemObject.isLandable ? 'text-secondary' : ''}>
            {(systemObject.atmosphereComposition && !systemObject?.subType?.toLowerCase()?.includes('gas giant')) && <i className='float-right icon icarus-terminal-planet-atmosphere' />}
            {systemObject.volcanismType && systemObject.volcanismType !== 'No volcanism' && <i className='float-right icon icarus-terminal-planet-volcanic' />}
            {systemObject.terraformingState && systemObject.terraformingState !== 'Not terraformable' && systemObject.terraformingState !== 'Terraformed' && <i className='float-right icon icarus-terminal-planet-terraformable' />}
            {systemObject?.subType?.toLowerCase() === 'earth-like world' && <i className='float-right icon icarus-terminal-planet-earthlike' />}
            {systemObject?.subType?.toLowerCase() === 'ammonia world' && <i className='float-right icon icarus-terminal-planet-ammonia-world' />}
            {(systemObject?.subType?.toLowerCase()?.includes('water world') || systemObject?.subType?.toLowerCase()?.includes('water giant')) && <i className='float-right icon icarus-terminal-planet-water-world' />}
            {(systemObject?.subType?.toLowerCase() === 'high metal content world' || systemObject?.subType?.toLowerCase() === 'metal rich') && <i className='float-right icon icarus-terminal-planet-high-metal-content' />}
            {systemObject?.subType?.toLowerCase()?.includes('gas giant') && <i className='float-right icon icarus-terminal-planet-gas-giant' />}
            {systemObject?.subType?.toLowerCase()?.includes('water-based life') && <i className='float-right icon icarus-terminal-planet-water-based-life' />}
            {systemObject?.subType?.toLowerCase()?.includes('ammonia-based life') && <i className='float-right icon icarus-terminal-planet-ammonia-based-life' />}
            {systemObject?.subType?.toLowerCase()?.includes('with life') && <i className='float-right icon icarus-terminal-planet-life' />}
            {systemObject?.signals?.biological > 0 && <i className='float-right icon icarus-terminal-plant' />}
            {systemObject.rings && <i className='float-right icon icarus-terminal-planet-ringed' />}
            {(systemObject?.subType?.toLowerCase() === 'earth-like world'
              || systemObject?.subType?.toLowerCase() === 'water world'
              || systemObject?.subType?.toLowerCase() === 'ammonia world'
              || (systemObject.terraformingState && systemObject.terraformingState !== 'Not terraformable' && systemObject.terraformingState !== 'Terraformed')
              || systemObject?.subType?.toLowerCase()?.includes('class ii gas giant')
              || systemObject?.subType?.toLowerCase() === 'metal rich'
            )
              && <i className='float-right text-success icon icarus-terminal-credits' />}
          </span>
        </div>
      </td>
      <td
        className='hidden-small text-right text-no-transform text-no-wrap'
      >{systemObject.distanceToArrival ? `${systemObject.distanceToArrival.toLocaleString(undefined, { maximumFractionDigits: 0 })} Ls` : ''}
      </td>
    </tr>
  )
}
