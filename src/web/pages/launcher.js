import { useState, useEffect } from 'react'
import { formatBytes } from 'lib/format'
import { useSocket, useEventListener } from 'components/socket'
import Loader from 'components/loader'
import Panel from 'components/panel'
import packageJson from '../../../package.json'

const defaultloadingStats = {
  loadingComplete: false,
  loadingInProgress: false,
  numberOfFiles: 0,
  numberOfLogLines: 0,
  numberOfEventsImported: 0,
  logSizeInBytes: 0,
  loadingTime: 0,
}

export default function IndexPage () {
  const { connected, sendEvent } = useSocket()
  const [hostInfo, setHostInfo] = useState()
  const [loadingProgress, setLoadingProgress] = useState(defaultloadingStats)

  // Display URL (IP address/port) to connect from a browser
  useEffect(async () => setHostInfo(await sendEvent('hostInfo')), [])

  useEffect(async () => {
    const message = await sendEvent('loadingStats')
    setLoadingProgress(message)
  }, [connected])

  useEffect(() => useEventListener('loadingProgress', (message) => {
    setLoadingProgress(message)
  }), [])

  return (
    <>
      <Loader visible={!connected} />
      <Panel visible={connected}>
        <h1>ICARUS</h1>
        <h3 className='text-primary'>Version {packageJson.version}</h3>
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
          <p className='text-muted'>Connect remotely:</p>
          <ul>
            {hostInfo && hostInfo.urls.map((url, i) => {
              return (i === 0) ? <li key={url} className='selectable'>{url}</li> : null
            })}
          </ul>
        </div>
        <div
          className='scrollable text-right' style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            bottom: '5rem',
            width: '19rem',
            background: 'var(--panel-background-color)',
            fontSize: '1.15rem',
            padding: '0 .5rem'
          }}
        >
          <div className={loadingProgress.loadingComplete ? 'text-muted' : ''}>
            {loadingProgress.loadingComplete === false ? <p>LOADING...</p> : <p>LOADED</p>}
            <p>{loadingProgress.numberOfFiles.toLocaleString()} FILES</p>
            <p>{loadingProgress.numberOfLogLines.toLocaleString()} LOG ENTRIES</p>
            <p>{formatBytes(loadingProgress.logSizeInBytes)}</p>
            <p>{loadingProgress.numberOfEventsImported.toLocaleString()} EVENTS IMPORTED</p>
            <p>TIME ELAPSED: {parseInt(loadingProgress.loadingTime / 1000)} SECONDS</p>
            <div style={{position: 'absolute', bottom: '.5rem', left: '.5rem', right: '.5rem'}}>
              {loadingProgress.loadingComplete === false && <progress value={loadingProgress.numberOfEventsImported} max={loadingProgress.numberOfLogLines}></progress>}
            </div>
          </div>
          {loadingProgress.loadingComplete === true ? <p>READY</p> : ''}
        </div>
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}>
          <button onClick={() => window.app_newWindow()}>New Terminal</button>
        </div>
      </Panel>
    </>
  )
}
