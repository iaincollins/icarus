import { useState, useEffect } from 'react'
import { formatBytes, eliteDateTime } from 'lib/format'
import { newWindow, checkForUpdate, installUpdate, openReleaseNotes, openTerminalInBrowser } from 'lib/window'
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
    if (message?.loadingComplete === true) {
      document.getElementById('loadingProgressBar').style.opacity = 0
    }

    setTimeout(async () => {
      const update = await checkForUpdate()
      setUpdate(update)
    }, 3000)
  }, [connected])

  useEffect(() => eventListener('loadingProgress', (message) => {
    setLoadingProgress(message)
    if (message?.loadingComplete === true) {
      setTimeout(() => { document.getElementById('loadingProgressBar').style.opacity = 0 }, 500)
    }
  }), [])

  return (
    <>
      <Loader visible={!connected} />
      <style dangerouslySetInnerHTML={{
        __html: '.notification { visibility: hidden; }'
      }}
      />
      <div style={{ padding: '.5rem 1rem', opacity: connected ? 1 : 0, zoom: '1.2', fontWeight: 'bold' }}>
        <h1 className='text-info'>ICARUS</h1>
        <span className='launcher-title'>
          <h3 className='text-primary'>ICARUS Terminal</h3>
          <h4 className='text-primary text-muted'>Version {packageJson.version}</h4>
        </span>
        {update && update.isUpgrade &&
          <div className='fx-fade-in'>
            <div>
              <h4 style={{ marginTop: '1.5rem', fontSize: '1.2rem' }} className='text-info'>New Version Available</h4>
              <span
                target='_blank'
                className='text-link'
                onClick={() => openReleaseNotes()}
                style={{ margin: '0 0 1rem 0', display: 'inline-block', fontWeight: 'normal', fontSize: '1.1rem' }} rel='noreferrer'
              >
                <span className='text-link-text'>Version {update?.productVersion} release notes</span>
              </span>
            </div>
            {!downloadingUpdate &&
              <button
                onClick={() => {
                  setDownloadingUpdate(true)
                  installUpdate()
                }}
              ><i className='icon icarus-terminal-download' /> Install Update
              </button>}
            {downloadingUpdate && <p className='text-uppercase text-secondary text-blink-slow'>Downloading update</p>}
          </div>}
        <div style={{ position: 'absolute', bottom: '.5rem', left: '1rem' }}>
          <p className='text-muted'>Connect from a browser on</p>
          {hostInfo?.urls?.[0] &&
            <p>
              <span className='text-info' onClick={() => openTerminalInBrowser()}>
                {hostInfo.urls[0]}
              </span>
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
            {/* <p>Scanned {loadingProgress.numberOfFiles.toLocaleString()} log files</p> */}
            <p>Imported {formatBytes(loadingProgress.logSizeInBytes)} of data</p>
            <p>{loadingProgress.numberOfLogLines.toLocaleString()} recent log entries</p>
            {/* <p>{loadingProgress.numberOfEventsImported.toLocaleString()} events imported</p> */}
            {loadingProgress.loadingComplete === true && <p>Completed in {(loadingProgress.loadingTime / 1000).toFixed(2)} seconds</p>}
            {loadingProgress.loadingComplete === true && loadingProgress.numberOfLogLines > 0 && <p>Last activity {eliteDateTime(loadingProgress.lastActivity).dateTime}</p>}
            {loadingProgress.loadingComplete === true && loadingProgress.numberOfLogLines === 0 && <p>No recent activity found</p>}
          </div>
          {loadingProgress.loadingComplete === true
            ? <p>Ready <span className='text-blink-slow'>_</span></p>
            : <p>Loading <span className='text-blink-slow'>_</span></p>}
          <div style={{ position: 'absolute', bottom: '.5rem', left: '.5rem', right: '.5rem' }}>
            <progress id='loadingProgressBar' value={loadingProgress.numberOfEventsImported} max={loadingProgress.numberOfLogLines} />
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}>
          <button style={{ width: '20rem' }} onClick={newWindow}>New Terminal</button>
        </div>
      </div>
    </>
  )
}
