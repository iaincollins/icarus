import { useState, useEffect } from 'react'
import { toggleFullScreen } from 'lib/window'
import { eliteDateTime } from 'lib/format'

export default function Toolbar ({ connected, active }) {
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
        <button disabled>Cmdr</button>
        <button disabled>Ship</button>
        <button disabled>Nav</button>
        <button disabled>Trade</button>
        <button className='active'>Log</button>
        <button disabled>Comms</button>
      </div>
      <hr />
    </>
  )
}
