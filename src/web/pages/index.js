import { useState, useEffect } from 'react'
import { toggleFullScreen } from 'lib/window'
import Loader from 'components/loader'
import Panel from 'components/panel'
import LogPanel from 'components/panels/log-panel'
import { useSocket, useEventListener } from 'components/socket'

let loadNewLogEntries

export default function IndexPage () {
  const { connected, sendEvent } = useSocket()
  const [logEntries, setLogEntries] = useState([])

  useEffect(async () => {
    const newLogEntries = await sendEvent('getLogEntries')
    if (Array.isArray(newLogEntries) && newLogEntries.length > 0) {
      setLogEntries(newLogEntries)
    }
  }, [connected])

  useEffect(() => useEventListener('newLogEntry', async (newLogEntry) => {
    setLogEntries(prevState => [newLogEntry, ...prevState])
  }), [])

  useEffect(() => useEventListener('loadingProgress', async (message) => {
    // We don't want to stress the service too much while it is loading so
    // limit the number of requests we make (while still updating the UI)
    if (!loadNewLogEntries) {
      loadNewLogEntries = setTimeout(async () => {
        const newLogEntries = await sendEvent('getLogEntries')
        if (Array.isArray(newLogEntries) && newLogEntries.length > 0) {
          setLogEntries(newLogEntries)
        }
        loadNewLogEntries = null
      }, 1000)
    }
  }), [])

  return (
    <>
      <Loader visible={!connected || logEntries.length === 0} />
      <Panel visible={connected && logEntries.length > 0}>
        <h2 style={{ padding: '1rem 0' }}>ICARUS Terminal</h2>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <button onClick={toggleFullScreen}>Toggle Fullscreen</button>
        </div>
        <div className='scrollable' style={{ position: 'absolute', top: '5rem', bottom: '1rem', left: '1rem', right: '1rem' }}>
          <LogPanel logEntries={logEntries} />
        </div>
      </Panel>
    </>
  )
}
