import { useState, useEffect } from 'react'
import Layout from 'components/layout'
import Panels from 'components/panels'
import LogPanel from 'components/panels/log-panel'
import LogInspectorPanel from 'components/panels/log-inspector-panel'
import { useSocket, useEventListener } from 'lib/socket'

let loadNewLogEntries

export default function IndexPage () {
  const { connected, active, sendEvent } = useSocket()
  const [logEntries, setLogEntries] = useState([])
  const [selectedLogEntry, setSelectedLogEntry] = useState()

  useEffect(async () => {
    const newLogEntries = await sendEvent('getLogEntries')
    if (Array.isArray(newLogEntries) && newLogEntries.length > 0) {
      setLogEntries(newLogEntries)
      // Only select a log entry if one isn't selected already
      setSelectedLogEntry(prevState => prevState || newLogEntries[0])
    }
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
    <>
      <Layout connected={connected} active={active}>
        <Panels layout='left-half' scrollable>
          <LogPanel logEntries={logEntries} setSelectedLogEntry={setSelectedLogEntry} />
        </Panels>
        <Panels layout='right-half' scrollable>
          <LogInspectorPanel logEntry={selectedLogEntry} />
        </Panels>
      </Layout>
    </>
  )
}
