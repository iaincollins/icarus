import { useState, useEffect } from 'react'
import { formatBytes, eliteDateTime } from 'lib/format'
import { newWindow, checkForUpdate, installUpdate } from 'lib/window'
import { useSocket, eventListener, sendEvent } from 'lib/socket'
import Loader from 'components/loader'
import packageJson from '../../../package.json'

const defaultloadingStats = {
  loadingComplete: false,
  loadingInProgress: false,
  numberOfFiles: 0,
  numberOfLogLines: 0,
  numberOfEventsImported: 0,
  logSizeInBytes: 0,
  loadingTime: 0
}

export default function IndexPage () {
  const { connected } = useSocket()
  const [hostInfo, setHostInfo] = useState()
  const [update, setUpdate] = useState()
  const [downloadingUpdate, setDownloadingUpdate] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(defaultloadingStats)

  // Display URL (IP address/port) to connect from a browser
  useEffect(async () => setHostInfo(await sendEvent('hostInfo')), [])

  useEffect(async () => {
    const message = await sendEvent('getLoadingStatus')
    setLoadingProgress(message)
    setTimeout(async () => {
      const update = await checkForUpdate()
      setUpdate(update)
    }, 3000)
  }, [connected])

  useEffect(() => eventListener('loadingProgress', (message) => {
    setLoadingProgress(message)
  }), [])

  return (
    <>
      <Loader visible={!connected} />
      <style dangerouslySetInnerHTML={{
        __html: '.notification { visibility: hidden; }'
      }}/>
      <div style={{ padding: '.5rem 1rem', opacity: connected ? 1 : 0, zoom: '1.2', fontWeight: 'bold' }}>
        <h1 className='text-info'>ICARUS</h1>
        <span className='launcher-title'>
          <h3 className='text-primary'>ICARUS Terminal</h3>
          <h5 className='text-primary text-muted'>Version {packageJson.version}</h5>
        </span>
        {update && update.isUpgrade &&
          <div className='fx-fade-in'>
            <a
              target='_blank'
              className='text-link'
              href='https://github.com/iaincollins/icarus/releases'
              style={{ margin: '2rem 0 1rem 0', display: 'block', fontWeight: 'normal', fontSize: '1.1rem' }} rel='noreferrer'
            >
              <span className='text-link-text'>New version {update?.productVersion} available</span>
            </a>
            {!downloadingUpdate &&
              <button
                onClick={() => {
                  setDownloadingUpdate(true)
                  installUpdate()
                }}
              ><i className='icon icarus-terminal-download' /> Install Update
              </button>}
            {downloadingUpdate && <p>Downloading update...</p>}
          </div>}
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
          <p className='text-muted'>Connect from a browser on</p>
          {hostInfo?.urls?.[0] &&
            <p>
              <a className='text-info' href={hostInfo.urls[0]} target='_blank' rel='noreferrer'>
                {hostInfo.urls[0]}
              </a>
            </p>}
        </div>
        <div
          className='scrollable text-right text-uppercase' style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            bottom: '5rem',
            width: '19rem',
            background: 'var(--color-background-panel-translucent)',
            fontSize: '1.15rem',
            padding: '0 .5rem'
          }}
        >
          <div className={loadingProgress.loadingComplete ? 'text-muted' : ''}>
            {loadingProgress.loadingComplete === false ? <p>Loading...</p> : <p>Loaded</p>}
            <p>{loadingProgress.numberOfFiles.toLocaleString()} log files</p>
            <p>{formatBytes(loadingProgress.logSizeInBytes)} of data</p>
            <p>{loadingProgress.numberOfLogLines.toLocaleString()} recent log entries</p>
            <p>{loadingProgress.numberOfEventsImported.toLocaleString()} events imported</p>
            {loadingProgress.loadingComplete === true ? <p>Last activity {eliteDateTime(loadingProgress.lastActivity)}</p> : ''}
            {/* <p>Load time: {parseInt(loadingProgress.loadingTime / 1000)} seconds</p> */}
            <div style={{ position: 'absolute', bottom: '.5rem', left: '.5rem', right: '.5rem' }}>
              {loadingProgress.loadingComplete === false && <progress value={loadingProgress.numberOfEventsImported} max={loadingProgress.numberOfLogLines} />}
            </div>
          </div>
          {loadingProgress.loadingComplete === true ? <p>Ready <span className='text-blink-slow'>_</span></p> : <p className='text-blink-slow'>_</p>}
        </div>
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}>
          <button style={{ width: '20rem' }} onClick={newWindow}>New Terminal</button>
        </div>
      </div>
    </>
  )
}
