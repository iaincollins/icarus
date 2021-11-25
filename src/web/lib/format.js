function formatBytes (bytes) {
  if (bytes >= 1073741824) {
    bytes = (bytes / 1073741824).toFixed(2) + ' GB'
  } else if (bytes >= 1048576) {
    bytes = (bytes / 1048576).toFixed(2) + ' MB'
  } else if (bytes >= 1024) {
    bytes = (bytes / 1024).toFixed(2) + ' KB'
  } else if (bytes > 1) {
    bytes = bytes + ' BYTES'
  } else if (bytes === 1) {
    bytes = bytes + ' BYTES'
  } else {
    bytes = '0 BYTES'
  }
  return bytes
}

function eliteDateTime (timestamp = Date.now()) {
  const date = new Date(timestamp)
  date.setFullYear(date.getFullYear() + 1286) // We are living in the future
  return date.toUTCString()
    .replace(' GMT', '') // Time in the Elite universe is always in UTC
    .replace(/(.*), /, '') // Strip day of week
    .replace(/:[0-9]{2}$/, '') // Strip seconds
    .replace(/^0/, '') // Strip leading zeros from day of month
}

function objectToHtml (obj, depth = 0, type = null) {
  const tag = 'div'
  let str = ''

  if (depth === 0) str = `<${tag} class="text-formatted-object">`

  for (const propertyName in obj) {
    if (propertyName.startsWith('_')) continue // Skip internal properties
    str += `<div class="text-formatted-object-property" data-depth="${depth}" style="margin-left: ${depth}rem">`
    const propertyLabel = `<label>${(type === 'array') ? 'Item ' : ''}${propertyName.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ').trim()}${(type === 'array') ? ':' : ''}</label>`
    switch (typeof obj[propertyName]) {
      case 'string':
      case 'number':
      case 'boolean':
        str += propertyLabel + ' <span class="text-formatted-object-value">' + obj[propertyName] + '</span>'
        break
      case 'object':
      default:
        if (Array.isArray(obj[propertyName])) {
          if (obj[propertyName].length > 0) {
            str += propertyLabel + objectToHtml(obj[propertyName], depth + 1, 'array')
          } else {
            str += propertyLabel + ' <span class="text-formatted-object-value">NONE</span>'
          }
        } else {
          str += propertyLabel + objectToHtml(obj[propertyName], depth + 1)
        }
        break
    }
    str += '</div>'
  }

  if (depth === 0) str += `</${tag}>`

  return str
}

module.exports = {
  formatBytes,
  eliteDateTime,
  objectToHtml
}
