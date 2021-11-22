import { useState, useEffect } from 'react'
import { useSocket } from 'components/socket'
import Loader from 'components/loader'
import Panel from 'components/panel'
import packageJson from '../../../package.json'

export default function IndexPage () {
  const { connected, sendEvent } = useSocket()
  const [hostInfo, setHostInfo] = useState()
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [logEntriesLoaded, setLogEntriesLoaded] = useState()
  const [filesLoaded, setFilesLoaded] = useState()

  // Display URL (IP address/port) to connect from a browser
  useEffect(async () => {
    setHostInfo(await sendEvent('hostInfo'))
  }, [])

  useEffect(async () => {
    setLoadingComplete(false)
    setFilesLoaded(null)
    setLogEntriesLoaded(null)
    const loadData = await sendEvent('loadData')
    setFilesLoaded(loadData.filesLoaded)
    setLogEntriesLoaded(loadData.logEntriesLoaded)
    setLoadingComplete(true)
  }, [])

  useEffect(() => {
    const eventHandler = (e) => {
      setFilesLoaded(e.detail.filesLoaded)
      setLogEntriesLoaded(e.detail.logEntriesLoaded)
    }
    window.addEventListener('socket.loading', eventHandler)
    return () => window.removeEventListener('socket.loading', eventHandler)
  }, [])

  return (
    <>
      <Loader visible={!connected} />
      <Panel visible={connected}>
        <h1>ICARUS</h1>
        <h3 className='text-primary'>Version {packageJson.version}</h3>
        <div
          className='scrollable' style={{
            position: 'absolute',
            top: '0.5rem',
            right: '1rem',
            bottom: '5rem',
            width: '19rem',
            background: 'var(--panel-background-color)',
            fontSize: '1.15rem',
            padding: '0 .5rem'
          }}
        >
          {!filesLoaded &&
            <p>Loading game data...</p>}
          {filesLoaded ? <p>Loaded {filesLoaded.length} files</p> : ''}
          {logEntriesLoaded ? <p>Loaded {logEntriesLoaded} log entries</p> : ''}
          {loadingComplete && <p>Loading complete.</p>}
        </div>
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}>
          <button disabled={!loadingComplete} onClick={() => window.app_newWindow()}>New Terminal</button>
        </div>
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
          <p className='text-muted'>Connect remotely:</p>
          <ul>
            {hostInfo && hostInfo.urls.map((url, i) => {
              return (i === 0) ? <li key={url} className='selectable'>{url}</li> : null
            })}
          </ul>
        </div>
      </Panel>
    </>
  )
}
