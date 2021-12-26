function isWindowsApp () { return (typeof window !== 'undefined' && typeof window.icarusTerminal_version === 'function') }
function isWindowFullScreen () { if (isWindowsApp()) { return window.icarusTerminal_isFullScreen() } }
function isWindowPinned () { if (isWindowsApp()) { return window.icarusTerminal_isPinned() } }

function appVersion () {
  if (isWindowsApp()) { return window.icarusTerminal_version() }
  return null
}

function newWindow () {
  if (isWindowsApp()) { return window.icarusTerminal_newWindow() }

  window.open(`//${window.location.host}`)
}

function closeWindow () {
  if (isWindowsApp()) { return window.icarusTerminal_quit() }

  window.close()
}

async function checkForUpdate () {
  if (isWindowsApp()) { 
    try {
      return JSON.parse(await window.icarusTerminal_checkForUpdate())
    } catch {}
    return null
  }
}

function installUpdate () {
  if (isWindowsApp()) { return window.icarusTerminal_installUpdate() }
}

async function toggleFullScreen () {
  if (isWindowsApp()) { return await window.icarusTerminal_toggleFullScreen() }

  if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.webkitCurrentFullScreenElement) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen()
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen()
    }
    return true
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
    return false
  }
}

async function togglePinWindow () {
  if (isWindowsApp()) { return await window.icarusTerminal_togglePinWindow() }
}

module.exports = {
  isWindowsApp,
  isWindowFullScreen,
  isWindowPinned,
  appVersion,
  newWindow,
  closeWindow,
  toggleFullScreen,
  togglePinWindow,
  checkForUpdate,
  installUpdate
}
