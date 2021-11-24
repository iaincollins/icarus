import { useState, useEffect } from 'react'
import { useSocket, useEventListener } from 'components/socket'

let loadNewJournalEntries

export default function JournalPanel () {
  const {connected, sendEvent} = useSocket()
  const [journalEntries, setJournalEntries] = useState([])

  useEffect(async () => {
    const newJournalEntries = await sendEvent('getJournal')
    if (newJournalEntries.length > 0) {
      setJournalEntries(newJournalEntries)
    }
  }, [connected])

  useEffect(() => useEventListener('newJournalEntry', async (newJournalEntry) => {
    setLastTimestamp(newJournalEntry.timestamp)
    setJournalEntries(journalEntries.concat[newJournalEntry])
  }), [])

  useEffect(() => useEventListener('loadingProgress', async (message) => {
    // We don't want to stress the service too much while it is loading so
    // limit the number of requests we make (while still updating the UI)
    if (!loadNewJournalEntries) {
      loadNewJournalEntries = setTimeout(async () => {
        const newJournalEntries = await sendEvent('getJournal')
        if (newJournalEntries.length > 0) {
          setJournalEntries(newJournalEntries)
        }
        loadNewJournalEntries = null
      }, 1000)
    }
  }), [])

  return (
    <>
      {journalEntries.length > 0 &&
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th className='text-right'>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {journalEntries && journalEntries.map(logEntry =>
              <tr key={`${logEntry._checksum}`}>
                <td>{logEntry.event}</td>
                <td className='text-right'>{timestampToEliteDateTime(logEntry.timestamp)}</td>
              </tr>
            )}
          </tbody>
        </table>
      }
    </>
  )
}

function timestampToEliteDateTime (timestamp) {
  const date = new Date(timestamp)
  date.setFullYear(date.getFullYear() + 1286) // We are living in the future
  return date.toUTCString()
    .replace(' GMT', '') // Time in the Elite universe is always in UTC
    .replace(/(.*),/, '') // Strip day of week
    .replace(/:[0-9]{2}$/, '') // Strip seconds
}
