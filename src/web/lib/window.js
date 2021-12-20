let _isFullScreen = false
let _isPinned = false

function isWindowsApp () { return (typeof window !== 'undefined' && typeof window.app_version === 'function') }
function isFullScreen () { return _isFullScreen }
function isPinned () { return _isPinned }

function appVersion () {
  if (isWindowsApp()) { return window.app_version() }
  return null
}

function newWindow () {
  if (isWindowsApp()) { return window.app_newWindow() }

  window.open(`//${window.location.host}`)
}

function closeWindow () {
  if (isWindowsApp()) { return window.app_quit() }

  window.close()
}

async function toggleFullScreen () {
  if (isWindowsApp()) {
    _isFullScreen = await window.app_toggleFullScreen()
  } else {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.webkitCurrentFullScreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen()
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen()
      }
      _isFullScreen = true
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
      _isFullScreen = false
    }
    document.activeElement.blur() // Reset element focus after switching
  }

  if (_isFullScreen) _isPinned = false // If fullcreen toggled, unpin
  return _isFullScreen
}

async function togglePinWindow () {
  if (isWindowsApp()) { _isPinned = await window.app_togglePinWindow() }
  return _isPinned
}

module.exports = {
  isWindowsApp,
  isFullScreen,
  isPinned,
  appVersion,
  newWindow,
  closeWindow,
  toggleFullScreen,
  togglePinWindow
}
