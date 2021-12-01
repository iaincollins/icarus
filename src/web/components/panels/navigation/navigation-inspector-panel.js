export default function NavigationInspectorPanel ({ systemObject }) {
  if (!systemObject) return null

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
    case 'planetary port':
    case 'odyssey settlement':
      iconClass += 'planetary-port'
      break
    default:
  }

  return (
    <div className='navigation-panel__inspector'>
      <div className='navigation-panel__inspector-heading fx-fade-in'>
        <i className={iconClass} />
        <h3 className='text-info'>{systemObject.name}</h3>
        <h4 className='text-primary'>{systemObject.type}</h4>
      </div>
      <hr />
    </div>
  )
}
