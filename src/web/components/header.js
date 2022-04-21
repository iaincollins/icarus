import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { socketOptions } from 'lib/socket'
import { isWindowFullScreen, isWindowPinned, toggleFullScreen, togglePinWindow } from 'lib/window'
import { eliteDateTime } from 'lib/format'
import { ColorPicker } from 'components/color-picker'
import notification from 'lib/notification'

const NAV_BUTTONS = [
  {
    name: 'Navigation',
    abbr: 'Nav',
    path: '/nav'
  },
  {
    name: 'Ship',
    abbr: 'Ship',
    path: '/ship'
  },
  {
    name: 'Engineering',
    abbr: 'Eng',
    path: '/eng'
  },
  {
    name: 'Log',
    abbr: 'Log',
    path: '/log'
  }
]

let IS_WINDOWS_APP = false

export default function Header ({ connected, active }) {
  const router = useRouter()
  const [dateTime, setDateTime] = useState(eliteDateTime())
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [notificationsVisible, setNotificationsVisible] = useState(socketOptions.notifications)
  const [colorPickerVisible, setColorPickerVisible] = useState(false)

  async function fullScreen () {
    const newFullScreenState = await toggleFullScreen()
    setIsFullScreen(newFullScreenState)
    if (newFullScreenState === true) setIsPinned(false)
    document.activeElement.blur()
  }

  async function pinWindow () {
    const newPinState = await togglePinWindow()
    setIsPinned(newPinState)
    document.activeElement.blur()
  }

  function toggleNotifications () {
    if (notificationsVisible) {
      notification('Notifications disabled')
    } else {
      notification('Notifications enabled')
    }
    socketOptions.notifications = !notificationsVisible
    setNotificationsVisible(!notificationsVisible)
    document.activeElement.blur()
  }

  useEffect(async () => {
    // icarusTerminal_* methods are not always accessible while the app is loading.
    // This handles that by calling them when the component is mounted.
    // It uses a global for isWindowsApp to reduce UI flicker.
    if (typeof window !== 'undefined' && typeof window.icarusTerminal_version === 'function') {
      IS_WINDOWS_APP = true
    }
    setIsFullScreen(await isWindowFullScreen())
    setIsPinned(await isWindowPinned())
  }, [])

  useEffect(() => {
    const dateTimeInterval = setInterval(async () => {
      setDateTime(eliteDateTime())
    }, 1000)
    return () => clearInterval(dateTimeInterval)
  }, [])

  let signalClassName = 'icon icarus-terminal-signal '
  if (!connected) {
    signalClassName += 'text-primary text-muted'
  } else if (active) {
    signalClassName += 'text-secondary'
  } else {
    signalClassName += 'text-primary text-muted'
  }

  const currentPath = `/${router.pathname.split('/')[1].toLowerCase()}`

  return (
    <header>
      <hr className='small' />
      <h1 className='text-info' style={{ padding: '.6rem 0 .25rem 3.75rem' }}>
        <i className='icon icarus-terminal-logo' style={{ position: 'absolute', fontSize: '3rem', left: 0 }} />ICARUS <span className='hidden-small'>Terminal</span>
      </h1>
      <div style={{ position: 'absolute', top: '1rem', right: '.5rem' }}>
        <p
          className='text-primary text-right text-uppercase text-muted'
          style={{ display: 'inline-block', margin: 0, padding: 0, marginRight: '.5rem', fontSize: '1.25rem', lineHeight: '1.25rem' }}
        >
          {dateTime.time}
          <br />
          {dateTime.date}
        </p>

        <button disabled className='button--icon button--transparent' style={{ marginRight: '.5rem', opacity: 1, transition: 'all 1s ease-out' }}>
          <i className={signalClassName} style={{ transition: 'all .25s ease', fontSize: '2rem' }} />
        </button>

        {IS_WINDOWS_APP &&
          <button tabIndex='1' onClick={pinWindow} className={`button--icon ${isPinned ? 'button--transparent' : ''}`} style={{ marginRight: '.5rem' }} disabled={isFullScreen}>
            <i className='icon icarus-terminal-pin-window' style={{ fontSize: '2rem' }} />
          </button>}

        <button tabIndex='1' onClick={toggleNotifications} className='button--icon' style={{ marginRight: '.5rem' }}>
          <i className={`icon ${notificationsVisible ? 'icarus-terminal-notifications' : 'icarus-terminal-notifications-disabled text-muted'}`} style={{ fontSize: '2rem' }} />
        </button>

        <button
          tabIndex='1' className='button--icon' style={{ marginRight: '.5rem' }}
          onClick={() => { setColorPickerVisible(!colorPickerVisible); document.activeElement.blur() }}
        >
          <i className='icon icarus-terminal-color-picker' style={{ fontSize: '2rem' }} />
        </button>
        <button tabIndex='1' onClick={fullScreen} className='button--icon'>
          <i className='icon icarus-terminal-fullscreen' style={{ fontSize: '2rem' }} />
        </button>
      </div>
      <hr />
      <div className='button-group'>
        {NAV_BUTTONS.filter(button => button).map(button =>
          <button
            key={button.name}
            tabIndex='1'
            disabled={button.path === currentPath}
            className={button.path === currentPath ? 'button--active' : ''}
            onClick={() => router.push(button.path)}
            style={{ fontSize: '1.5rem' }}
          >
            <span className='visible-small'>{button.abbr}</span>
            <span className='hidden-small'>{button.name}</span>
          </button>
        )}
      </div>
      <hr className='bold' />
      <ColorPicker visible={colorPickerVisible} toggleVisible={() => setColorPickerVisible(!colorPickerVisible)} />
    </header>
  )
}
