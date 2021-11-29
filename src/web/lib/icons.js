import iconJson from './icons.json'
import {
  PLANETARY_PORTS,
  PLANETARY_BASES
} from './consts'

class _Icons {
  static icon (name, style, classNames) {
    // As we don't have icons for all types of planetary bases yet,
    // use either a generic base icon or a planetary port icon
    if (PLANETARY_BASES.includes(name)) name = 'planetaryBase'
    if (PLANETARY_PORTS.includes(name)) name = 'planetaryPort'

    const svgSrc = `
      <svg
        class="${getClassNamesAsString('icon', classNames)}"
        ${style ? `style="${getStyleAsString(style)}"` : ''}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet">
        ${Icons[name].map(path => `<path d="${path}">`)}
      </svg>
    `

    return svgSrc
  }
}

const _IconsProxyHandler = {
  get: function (obj, name) {
    // handle tranforming names
    if (!iconJson[name]) {
      console.log('Missing asset:', name)
      return null
    }
    return iconJson[name]
  }
}

function toCamelCase (text) {
  text = text.replace(/[-_\s.]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
  return text.substr(0, 1).toLowerCase() + text.substr(1)
}

function getStyleAsString (style) {
  return Object
    .entries(style)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')
    .replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

function getClassNamesAsString () {
  let classNamesAsArray = []
  // Loop over each argument, convert to array if is a string, and combine them
  Object.values(arguments).forEach(arg => {
    const argAsArray = Array.isArray(arg) ? arg : (arg || '').split(' ')
    classNamesAsArray = classNamesAsArray.concat(argAsArray)
  })
  // Return only unique class names
  return [...new Set(classNamesAsArray)].join(' ')
}

const Icons = new Proxy(_Icons, _IconsProxyHandler)
