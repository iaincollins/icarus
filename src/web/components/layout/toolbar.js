import { useState, useEffect } from 'react'
import { toggleFullScreen } from 'lib/window'
import { eliteDateTime } from 'lib/format'

export default function Toolbar ({ connected }) {
  const [dateTime, setDateTime] = useState(0)

  useEffect(() => {
    eliteDateTime()
    const timeout = setTimeout(() => {
      setDateTime(eliteDateTime())
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <>
      <hr className='small' />
      <h2 style={{ padding: '.5rem 0' }}> ICARUS Terminal</h2>
      <div style={{ position: 'absolute', top: '1.6rem', right: '1rem' }}>
        <h3 className='text-primary' style={{ display: 'inline', position: 'relative', top: '-.5rem', left: '-.5rem' }}>{dateTime}</h3>
        <button disabled className='button-with-icon button-transparent' style={{ opacity: 1, marginRight: '.5rem' }}>
          <i className={`icarus-terminal-signal ${connected ? 'text-primary' : 'text-danger text-blink'}`} />
        </button>
        <button onClick={toggleFullScreen} className='button-with-icon'>
          <i className='icarus-terminal-fullscreen' />
        </button>
      </div>
      <hr className='bold' />
    </>
  )
}
