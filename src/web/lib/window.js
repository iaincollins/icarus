/* global Element */
function toggleFullScreen () {
  if (typeof window.app_toggleFullScreen === 'function') { return window.app_toggleFullScreen() }

  if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen()
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen()
    }
  }
}

function newWindow () {
  if (typeof window.app_newWindow === 'function') { return window.app_newWindow() }

  window.open(`//${window.location.host}`)
}

function closeWindow () {
  if (typeof window.app_quit === 'function') { return window.app_quit() }

  window.close()
}

module.exports = {
  toggleFullScreen,
  newWindow,
  closeWindow
}
