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

  for (const prop in obj) {
    let propertyName = prop
    let propertyValue = obj[propertyName]

    if (propertyName.startsWith('_')) continue // Skip internal properties

    // Use only localised versions of property names (if exists)
    if (!propertyName.endsWith('_Localised') && obj[`${propertyName}_Localised`]) continue
    if (propertyName.endsWith('_Localised')) propertyName = propertyName.replace(/_Localised$/, '')

    if (propertyName === 'timestamp') {
      propertyName = 'Time'
      propertyValue = eliteDateTime(propertyValue)
    }

    let propertyLabel
    if (type === 'array') {
      if (typeof propertyValue === 'object') {
        propertyLabel = `<label style="display: block; height: 0; position: relative; top: .5rem; left: -.5rem;">■</label>`
      } else {
        propertyLabel = `<label> ■</label>`
      }
    } else {
      propertyLabel = `<label>${propertyName.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ').trim()}</label>`
    }

    str += `<div class="text-formatted-object-property" data-depth="${depth}" style="padding-left: ${(depth)}rem;">`

    switch (typeof propertyValue) {
      case 'string':
        str += propertyLabel + ' <span class="text-formatted-object-value">' + propertyValue.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ').replace(/^\$/, '').replace(/;$/, '').trim() + '</span>'
        break
      case 'number':
      case 'boolean':
        str += propertyLabel + ' <span class="text-formatted-object-value">' + propertyValue + '</span>'
        break
      case 'object':
      default:
        if (Array.isArray(propertyValue)) {
          if (propertyValue.length > 0) {
            str += propertyLabel + objectToHtml(propertyValue, depth + 1, 'array')
          } else {
            str += propertyLabel + ' <span class="text-formatted-object-value">NONE</span>'
          }
        } else {
          str += propertyLabel + objectToHtml(propertyValue, depth > 1 ? depth - 1 : depth)
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
