import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { toggleFullScreen } from 'lib/window'
import { eliteDateTime } from 'lib/format'

const NAV_BUTTONS = ['Cmdr', 'Ship', 'Nav', 'Trade', 'Log', 'Comms']
const ENABLED_NAV_BUTTONS = ['Log'] // Enabling options as they are ready

export default function Toolbar ({ activeNavButton, connected, active }) {
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

  const currentPageName = router.pathname.replace(/\//, '').toLowerCase()

  return (
    <>
      <hr className='small' />
      <h1 style={{ padding: '.5rem 0' }}> ICARUS Terminal</h1>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1rem' }}>
        <h3 className='text-primary' style={{ display: 'inline', position: 'relative', top: '-.5rem', left: '-.5rem' }}>{dateTime}</h3>
        <button disabled className='button-with-icon button-transparent' style={{ opacity: 1, marginRight: '.5rem' }}>
          <i className={signalClassName} style={{ transition: 'all .25s ease' }} />
        </button>
        <button onClick={toggleFullScreen} className='button-with-icon'>
          <i className='icarus-terminal-fullscreen' />
        </button>
      </div>
      <hr className='bold' />
      <div className='button-group'>
        {NAV_BUTTONS.map(buttonName =>
          <Link
            key={buttonName}
            href={!ENABLED_NAV_BUTTONS.includes(buttonName) ? `/${currentPageName}` : `/${buttonName.toLowerCase()}`}
            disabled={!ENABLED_NAV_BUTTONS.includes(buttonName)}
          ><a className={`button ${currentPageName === buttonName.toLowerCase() ? 'active' : ''} ${!ENABLED_NAV_BUTTONS.includes(buttonName) ? 'button-disabled' : ''}`}>{buttonName}</a>
          </Link>
        )}
      </div>
      <hr />
    </>
  )
}
