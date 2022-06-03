import { useState, useEffect, Fragment } from 'react'
import { sendEvent, eventListener } from 'lib/socket'

export default function StatusPage () {
  const [cmdrStatus, setCmdrStatus] = useState()

  useEffect(async () => {
    setCmdrStatus(await sendEvent('getCmdrStatus'))
  }, [])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Location', 'FSDJump'].includes(log.event)) {
      setCmdrStatus(await sendEvent('getCmdrStatus'))
    }
  }))

  useEffect(() => eventListener('gameStateChange', async (log) => {
    setCmdrStatus(await sendEvent('getCmdrStatus'))
  }), [])

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Cmdr Status</h1>
      <p>
        balance: {cmdrStatus?.balance && `${cmdrStatus.balance?.toLocaleString()} CR`}
      </p>
      <p>
        location: {cmdrStatus?._location && cmdrStatus._location.map((loc, i) => {
        return (
          <Fragment key={`location_${loc}_${i}`}>
            {i > 0 && <span className='seperator' />}
            {loc}
          </Fragment>
        )
      })}
      </p>
      <hr />
      {cmdrStatus && Object.keys(cmdrStatus).map(key =>
        <Fragment key={key}>
          {key !== 'flags' &&
            <p className='text-primary'>
              {key}: <span className='text-info'>{JSON.stringify(cmdrStatus[key])}</span>
            </p>}
        </Fragment>
      )}
      {cmdrStatus && Object.keys(cmdrStatus.flags).map(flag =>
        <p key={flag} className='text-primary'>
          {flag}:
          {cmdrStatus.flags[flag] === true && <span className='text-success'>true</span>}
          {cmdrStatus.flags[flag] === false && <span className='text-danger'>false</span>}
        </p>
      )}
    </div>
  )
}
