import { useState, useEffect } from 'react'
import Toolbar from 'components/layout/toolbar'
import Loader from 'components/loader'
import MainLayout from 'components/layout/main-layout'
import PanelLayout from 'components/layout/panel-layout'
import LogPanel from 'components/panels/log-panel'
import LogEntryPanel from 'components/panels/log-entry-panel'
import { useSocket, useEventListener } from 'lib/socket'

let loadNewLogEntries

export default function IndexPage () {
  const { connected, sendEvent } = useSocket()
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
      <Toolbar connected={connected} />
      <Loader visible={!connected || logEntries.length === 0} />
      <MainLayout visible={connected && logEntries.length > 0}>
        <PanelLayout layout='left-half'>
          <LogPanel logEntries={logEntries} setSelectedLogEntry={setSelectedLogEntry} />
        </PanelLayout>
        <PanelLayout layout='right-half'>
          <LogEntryPanel logEntry={selectedLogEntry} />
        </PanelLayout>
      </MainLayout>
    </>
  )
}
