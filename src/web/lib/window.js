function toggleFullScreen () {
  if (typeof window.app_toggleFullScreen === 'function') { return window.app_toggleFullScreen() }

  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

function closeWindow () {
  if (typeof window.app_quit === 'function') { return window.app_quit() }

  window.close()
}

module.exports = {
  toggleFullScreen,
  closeWindow
}
