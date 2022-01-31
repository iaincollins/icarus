import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { isWindowFullScreen, isWindowPinned, toggleFullScreen, togglePinWindow } from 'lib/window'
import { eliteDateTime } from 'lib/format'
import { ColorPicker } from 'components/color-picker'

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

export default function Header ({ connected, active }) {
  const router = useRouter()
  const [dateTime, setDateTime] = useState(eliteDateTime())
  const [isWindowsApp, setIsWindowsApp] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
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

  useEffect(async () => {
    // icarusTerminal_* methods are not always accessible while the app is loading.
    // This handles that by calling them when the component is mounted then the
    // component tracks the state in it's local state. If the window is
    // reloaded this ensures the window state is still tracked properly.
    if (typeof window === 'undefined') return setIsWindowsApp(false)
    setIsWindowsApp(typeof window !== 'undefined' && typeof window.icarusTerminal_version === 'function')
    setIsFullScreen(await isWindowFullScreen())
    setIsPinned(await isWindowPinned())
  }, [])

  useEffect(() => {
    const dateTimeInterval = setInterval(async () => {
      setDateTime(eliteDateTime())
    }, 1000)
    return () => clearInterval(dateTimeInterval)
  }, [])

  let signalClassName = 'icarus-terminal-signal '
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
      <h1 className='text-info' style={{ padding: '.5rem 0' }}>ICARUS <span className='hidden-small'>Terminal</span></h1>
      <div style={{ position: 'absolute', top: '1rem', right: '.5rem' }}>
        <h3 className='text-primary' style={{ display: 'inline', position: 'relative', top: '-.5rem', left: '-.5rem' }}>{dateTime}</h3>
        <button disabled className='button--icon button--transparent' style={{ marginRight: '.5rem', opacity: 1, transition: 'all 1s ease-out' }}>
          <i className={signalClassName} style={{ transition: 'all .25s ease', fontSize: '2rem' }} />
        </button>
        {isWindowsApp &&
          <button tabIndex='1' onClick={pinWindow} className={`button--icon ${isPinned ? 'button--transparent' : ''}`} style={{ marginRight: '.5rem' }} disabled={isFullScreen}>
            <i className='icon icarus-terminal-pin-window' style={{ fontSize: '2rem' }} />
          </button>}

        <button
          tabIndex='1' className='button--icon'
          style={{ marginRight: '.5rem' }}
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
