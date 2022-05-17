import iconJson from '../public/fonts/icarus-terminal/icarus-terminal.json'
import { SURFACE_PORTS, PLANETARY_BASES } from '../../shared/consts'
class _Icons {

}

const _IconsProxyHandler = {
  get: function (obj, name) {
    let iconName = name.toLowerCase().replaceAll(' ', '-')

    if (!iconJson[iconName]) {
      if (PLANETARY_BASES.includes(name)) iconName = 'settlement'
      if (SURFACE_PORTS.includes(name)) iconName = 'planetary-port'
      if (name === 'Mega ship') iconName = 'megaship'
    }

    if (iconJson[iconName]) {
      return iconJson[iconName].map((path, i) => <path key={`icon-${iconName}-${i}`} d={path} />)
    } else {
      console.log('Unsupported icon:', name)
      return null
    }
  }
}

const Icons = new Proxy(_Icons, _IconsProxyHandler)

export default Icons
