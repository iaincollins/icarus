import { SURFACE_PORTS, PLANETARY_BASES } from '../../../../service/lib/consts'

export default function NavigationInspectorPanel ({ systemObject }) {
  if (!systemObject) return null

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
