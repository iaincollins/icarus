import { useState, useEffect } from 'react'
import { sendEvent, eventListener } from 'lib/socket'

export default function StatusPage () {
  const [cmdrStatus, setCmdrStatus] = useState()

  useEffect(async () => {
    setCmdrStatus(await sendEvent('getCmdrStatus'))
  }, [])

  useEffect(() => eventListener('gameStateChange', async (log) => {
    setCmdrStatus(await sendEvent('getCmdrStatus'))
  }), [])

  return (
    <>
      <div style={{ padding: '1rem' }}>
        <h1>Cmdr Status</h1>
        {cmdrStatus && Object.keys(cmdrStatus).map(key =>
          <>
            {key !== 'flags' &&
              <p className='text-primary'>
                {key}: <span className='text-info'>{cmdrStatus[key]}</span>
              </p>}
          </>
        )}
        {cmdrStatus && Object.keys(cmdrStatus.flags).map(flag =>
          <p className='text-primary'>
            {flag}:
            {cmdrStatus.flags[flag] === true && <span className='text-success'>true</span>}
            {cmdrStatus.flags[flag] === false && <span className='text-danger'>false</span>}
          </p>
        )}
      </div>
    </>
  )
}
