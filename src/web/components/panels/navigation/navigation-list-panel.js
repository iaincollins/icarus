import { STARPORTS, SURFACE_PORTS, PLANETARY_BASES, MEGASHIPS } from '../../../../service/lib/consts'

export default function NavigationInspectorPanel ({ system, setSystemObject }) {
  if (!system) return null

  return (
    <div className='navigation-panel__list'>
      <div className='scrollable'>
        <table className='table--animated fx-fade-in'>
          <thead>
            <tr>
              <th>Description</th>
              <th className='text-right'>Distance</th>
            </tr>
          </thead>
          <tbody>
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
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NavigationTableBody ({ system, setSystemObject }) {
  let tableRows = []

  for (const star of system.stars) {
    tableRows.push(<NavigationTableRow key={`${star.name}_${star.id}`} systemObject={star} setSystemObject={setSystemObject} />)

    for (const systemObject of star._children) {
      tableRows = tableRows.concat(<NavigationTableRowChildren key={`${systemObject.name}_${systemObject.id}`} systemObject={systemObject} setSystemObject={setSystemObject} />)
    }
  }

  return tableRows
}

function NavigationTableRowChildren ({ systemObject, setSystemObject, depth = 1 }) {
  let tableRows = []

  tableRows.push(<NavigationTableRow key={`${systemObject.name}_${systemObject.id}`} systemObject={systemObject} depth={depth} setSystemObject={setSystemObject} />)

  if (systemObject._children) {
    for (const childSystemObject of systemObject._children) {
      tableRows = tableRows.concat(<NavigationTableRowChildren key={`${childSystemObject.name}_${childSystemObject.id}`} systemObject={childSystemObject} setSystemObject={setSystemObject} depth={depth + 1} />)
    }
  }

  if (systemObject._megaships) {
    for (const megaship of systemObject._megaships) {
      tableRows = tableRows.concat(<NavigationTableRowChildren key={`${megaship.name}_${megaship.id}`} systemObject={megaship} setSystemObject={setSystemObject} depth={depth + 1} />)
    }
  }

  if (systemObject._planetaryBases) {
    for (const planetaryBase of systemObject._planetaryBases) {
      tableRows = tableRows.concat(<NavigationTableRowChildren key={`${planetaryBase.name}_${planetaryBase.id}`} systemObject={planetaryBase} setSystemObject={setSystemObject} depth={depth + 1} />)
    }
  }
  return tableRows
}

function NavigationTableRow ({ systemObject, depth = 0, setSystemObject }) {
  if (!systemObject.type) {
    console.warn('Unknown type of system object', systemObject)
    return null
  }

  if (systemObject.type === 'Null') { return (<tr className='table-row--disabled'><td colSpan='2'><hr /></td></tr>) }

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

  if (isLandable) { iconClass += ' text-info' }

  return (
    <tr tabIndex='2' onFocus={() => setSystemObject(systemObject)}>
      <td>
        <div style={{ paddingLeft: `${(depth * 1.5) + 2}rem` }} className='text-no-wrap'>
          <i className={iconClass} />
          {systemObject.name}
        </div>
      </td>
      <td className='text-right text-no-transform'>{systemObject.distanceToArrival ? `${Math.round(systemObject.distanceToArrival)} Ls` : ''}</td>
    </tr>
  )
  // if (systemObject.type === 'Null') {
  //   return `<tr disabled="disabled"><td colspan="3" style="padding: 0;"><hr></td></tr>`
  // }

  // const isLandable = systemObject.isLandable || STARPORTS.concat(MEGASHIPS).includes(systemObject.type) || PLANETARY_BASES.includes(systemObject.type)
  // const isPlanetaryBase = PLANETARY_BASES.includes(systemObject.type)

  // return `
  //   <tr
  //     tabindex="2"
  //     onFocus="NavigationPanel.renderDetail(this, 'navigation-panel__inspector')"
  //     data-detail="${encodeURI(JSON.stringify(systemObject))}"
  //   >
  //   <td class="no-wrap">
  //     ${Icons.icon(systemObject.type, {
  //       height: '2rem',
  //       marginLeft: `${indent * 1.5}rem`,
  //       marginRight: '.75rem',
  //       marginTop: '0',
  //       float: 'left'
  //     }, (isLandable ? 'icon-secondary' : ''))}
  //     ${systemObject.name}
  //   </td>
  //   <td class="no-wrap" style="text-transform: none; text-align: right;">
  //     ${systemObject.distanceToArrival ? `${Math.round(systemObject.distanceToArrival)} Ls` : ''}
  //   </td>
  // </tr>
  // <!-- Render rows for any Ports / Outposts / Odyssey Settlements on the planet -->
  // ${false && systemObject._planetaryBases && systemObject._planetaryBases.length > 0
  //   ? Render.html(systemObject._planetaryBases.map(
  //       (childSystemObject, i) => NavigationPanel.renderTableRow(childSystemObject, indent + 1))
  //     )
  //   : ''}
  // `
}
