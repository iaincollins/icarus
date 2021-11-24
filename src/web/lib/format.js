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

function eliteDateTime (timestamp) {
  const date = new Date(timestamp)
  date.setFullYear(date.getFullYear() + 1286) // We are living in the future
  return date.toUTCString()
    .replace(' GMT', '') // Time in the Elite universe is always in UTC
    .replace(/(.*), /, '') // Strip day of week
    .replace(/:[0-9]{2}$/, '') // Strip seconds
    .replace(/^0/, '') // Strip leading zeros from day of month
}

module.exports = {
  formatBytes,
  eliteDateTime
}
