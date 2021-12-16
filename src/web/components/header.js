import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { toggleFullScreen } from 'lib/window'
import { eliteDateTime } from 'lib/format'

const NAV_BUTTONS = [
  {
    name: 'Cmdr',
    path: '/cmdr',
    enabled: false
  },
  {
    name: 'Ship',
    path: '/ship',
    enabled: true
  },
  {
    name: 'Nav',
    path: '/nav',
    enabled: true
  },
  {
    name: 'Trade',
    path: '/trade',
    enabled: false
  },
  {
    name: 'Log',
    path: '/log',
    enabled: true
  },
  {
    name: 'Comms',
    path: '/comms',
    enabled: false
  }
]

export default function Header ({ connected, active }) {
  const router = useRouter()
  const [dateTime, setDateTime] = useState(eliteDateTime())

  useEffect(() => {
    const dateTimeInterval = setInterval(() => {
      setDateTime(eliteDateTime())
    }, 1000)
    return () => clearInterval(dateTimeInterval)
  }, [])

  let signalClassName = 'icarus-terminal-signal'
  if (!connected) {
    signalClassName += ' text-muted text-blink'
  } else if (active) {
    signalClassName += ' text-secondary'
  }

  const currentPath = `/${router.pathname.split('/')[1].toLowerCase()}`

  return (
    <header>
      <hr className='small' />
      <h1 style={{ padding: '.5rem 0' }}> ICARUS Terminal</h1>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1rem' }}>
        <h3 className='text-primary' style={{ display: 'inline', position: 'relative', top: '-.5rem', left: '-.5rem' }}>{dateTime}</h3>
        <button disabled className='button--icon button--transparent' style={{ opacity: 1, marginRight: '.5rem' }}>
          <i className={signalClassName} style={{ transition: 'all .25s ease', fontSize: '2rem' }} />
        </button>
        <button tabIndex='1' onClick={toggleFullScreen} className='button--icon'>
          <i className='icon icarus-terminal-fullscreen' style={{ fontSize: '2rem' }} />
        </button>
      </div>
      <hr className='bold' />
      <div className='button-group'>
        {NAV_BUTTONS.filter(button => button).map(button =>
          <button
            key={button.name}
            tabIndex='1'
            disabled={!button.enabled || button.path === currentPath}
            className={button.path === currentPath ? 'button--active' : ''}
            onClick={() => router.push(!button.enabled ? currentPath : button.path)}
          >{button.name}
          </button>
        )}
      </div>
      <hr />
    </header>
  )
}
