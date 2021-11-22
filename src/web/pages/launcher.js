import { useState, useEffect } from 'react'
import { useSocket, useEventListener } from 'components/socket'
import Loader from 'components/loader'
import Panel from 'components/panel'
import packageJson from '../../../package.json'

const defaultGameState = {
  loadingInProgress: false,
  numberOfFiles: 0,
  numberOfLogEntries: 0
}

export default function IndexPage () {
  const { connected, sendEvent } = useSocket()
  const [hostInfo, setHostInfo] = useState()
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [gameState, setGameState] = useState(defaultGameState)

  // Display URL (IP address/port) to connect from a browser
  useEffect(async () => {
    setHostInfo(await sendEvent('hostInfo'))
  }, [])

  useEffect(async () => {
    const message = await sendEvent('gameState')
    setGameState(message)
    setLoadingComplete(!message.loadingInProgress)
  }, [connected])

  useEffect(() => useEventListener('gameStateChange', (message) => {
    setGameState(message)
    setLoadingComplete(!message.loadingInProgress)
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
          <div className={loadingComplete ? 'text-muted' : ''}>
            {gameState.numberOfFiles > 0 ? <p>{gameState.numberOfFiles.toLocaleString()} files</p> : ''}
            {gameState.numberOfLogEntries > 0 ? <p>{gameState.numberOfLogEntries.toLocaleString()} log entries</p> : ''}
          </div>
          {loadingComplete ? <p>READY CMDR</p> : <p>Loading...</p>}
        </div>
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}>
          <button onClick={() => window.app_newWindow()}>New Terminal</button>
        </div>
      </Panel>
    </>
  )
}
