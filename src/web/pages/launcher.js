import { useState, useEffect } from 'react'
import { useSocket } from 'components/socket'
import Loader from 'components/loader'
import Panel from 'components/panel'
import packageJson from '../../../package.json'

export default function IndexPage () {
  const { connected, sendEvent } = useSocket()
  const [hostInfo, setHostInfo] = useState()
  const [loadedData, setLoadedData] = useState()

  // Display URL (IP address/port) to connect from a browser
  useEffect(async () => {
    setHostInfo(await sendEvent('hostInfo'))
  }, [])

  useEffect(async () => {
    setLoadedData(await sendEvent('loadData'))
  }, [])

  /*
  useEffect(() => {
    const eventHandler = (e) => setCurrentTime(e.detail.time)
    window.addEventListener('socket.heartbeat', eventHandler)
    return () => window.removeEventListener('socket.heartbeat', eventHandler)
  }, [])
  */

  return (
    <>
      <Loader visible={!connected} />
      <Panel visible={connected}>
        <h1>ICARUS</h1>
        <h3 className='text-primary'>Version {packageJson.version}</h3>
        <div style={{ position: 'absolute', top: '0.5rem', right: '1rem' }}>
          {(!loadedData) ? <p>Loading game data...</p> : ''}
          {loadedData && loadedData.logEntries &&
            <p>Loaded {loadedData.logEntries} log files</p>}
          {loadedData && loadedData.jsonFiles &&
            <ul>
              {loadedData.jsonFiles.map(file => <li key={file}>{file} loaded</li>)}
            </ul>
          }
        </div>
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}>
          <button onClick={() => window.app_newWindow()}>New Terminal</button>
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
