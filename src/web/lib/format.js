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

module.exports = {
  formatBytes
}
