import { useState, useEffect } from 'react'
import Layout from 'components/layout'
import Panel from 'components/panel'
import LogPanel from 'components/panels/log-panel'
import LogInspectorPanel from 'components/panels/log-inspector-panel'
import { useSocket, useEventListener } from 'lib/socket'

let loadNewLogEntries

export default function LogPage () {
  const { connected, active, sendEvent } = useSocket()
  const [ready, setReady] = useState(false)
  const [logEntries, setLogEntries] = useState([])
  const [selectedLogEntry, setSelectedLogEntry] = useState()

  useEffect(async () => {
    const newLogEntries = await sendEvent('getLogEntries')
    if (Array.isArray(newLogEntries) && newLogEntries.length > 0) {
      setLogEntries(newLogEntries)
      // Only select a log entry if one isn't selected already
      setSelectedLogEntry(prevState => prevState || newLogEntries[0])
    }
    setReady(true)
  }, [connected])

  useEffect(() => useEventListener('newLogEntry', async (newLogEntry) => {
    setLogEntries(prevState => [newLogEntry, ...prevState])
    // Only select a log entry if one isn't selected already
    setSelectedLogEntry(prevState => prevState || newLogEntry)
  }), [])

  useEffect(() => useEventListener('loadingProgress', async (message) => {
    // We don't want to stress the service too much while it is loading so
    // limit the number of requests we make (while still updating the UI)
    if (!loadNewLogEntries) {
      loadNewLogEntries = setTimeout(async () => {
        const newLogEntries = await sendEvent('getLogEntries')
        if (Array.isArray(newLogEntries) && newLogEntries.length > 0) {
          setLogEntries(newLogEntries)
          // Only select a log entry if one isn't selected already
          setSelectedLogEntry(prevState => prevState || newLogEntries[0])
        }
        loadNewLogEntries = null
      }, 1000)
    }
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='left-half' scrollable>
        <LogPanel logEntries={logEntries} setSelectedLogEntry={setSelectedLogEntry} />
        {ready && logEntries.length === 0 && <p style={{ margin: '2rem 0' }} className='text-center text-muted'>No recent log entries found</p>}
      </Panel>
      <Panel layout='right-half' scrollable>
        <LogInspectorPanel logEntry={selectedLogEntry} />
      </Panel>
    </Layout>
  )
}
