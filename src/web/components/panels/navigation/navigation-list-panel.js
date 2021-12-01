export default function NavigationInspectorPanel ({ system, setSystemObject }) {
  if (!system) return null

  return (
    <div className="navigation-panel__list">
      <div className="scrollable">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th className="text-right">Distance</th>
            </tr>
          </thead>
          <tbody>
            <NavigationTableBody system={system} setSystemObject={setSystemObject}/>
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

function NavigationTableBody({system, setSystemObject}) {
  let tableRows = []
  
  system.stars.map(star => {
    tableRows.push(<NavigationTableRow key={`${star.name}_${star.id}`} systemObject={star} setSystemObject={setSystemObject}/>)

    star._children.map((systemObject, i) => {
      tableRows.push(<NavigationTableRow key={`${systemObject.name}_${systemObject.id}`} systemObject={systemObject} indent={1} setSystemObject={setSystemObject}/>)

      if (systemObject._planetaryBases) {
        systemObject._planetaryBases.map(planetaryBase => {
          tableRows.push(<NavigationTableRow key={`${planetaryBase.name}_${planetaryBase.id}`} systemObject={planetaryBase} indent={2} setSystemObject={setSystemObject}/>)
        })
      }
    })
  })

    // ${false && systemObject._planetaryBases && systemObject._planetaryBases.length > 0
  //   ? Render.html(systemObject._planetaryBases.map(
  //       (childSystemObject, i) => NavigationPanel.renderTableRow(childSystemObject, indent + 1))
  //     )
  //   : ''}

  return tableRows
}

function NavigationTableRow({systemObject, indent = 0, setSystemObject}) {
  if (systemObject.type === 'Null')
   return (<tr className="table-row--disabled"><td colSpan="2"><hr/></td></tr>)

   // const isLandable = systemObject.isLandable || STARPORTS.concat(MEGASHIPS).includes(systemObject.type) || PLANETARY_BASES.includes(systemObject.type)
   // const isPlanetaryBase = PLANETARY_BASES.includes(systemObject.type)

   let iconClass = "icon icarus-terminal-"
   switch (systemObject.type.toLowerCase()) {
    case "star":
      iconClass += "star"
      break;
     case "planet":
      iconClass += "planet"
      break;
    case "odyssey settlement":
      iconClass += "planetary-port"
      break;
    default:
   }

   return (
    <tr tabIndex="2" onClick={() => setSystemObject(systemObject)}>
      <td className={`${systemObject.isLandable ? 'text-secondary' : 'text-primary'}`}>
        <i 
         style={{marginLeft: `${indent * 1.5}rem`}}
         className={iconClass}
        />
        {systemObject.name}
      </td>
      <td className="text-right">{systemObject.distanceToArrival ? `${Math.round(systemObject.distanceToArrival)} Ls` : ''}</td>
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
  //     onFocus="NavigationPanel.renderDetail(this, 'navigation-panel__detail')"
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