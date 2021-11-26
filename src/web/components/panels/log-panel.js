import { eliteDateTime } from 'lib/format'

export default function LogPanel ({ logEntries, setSelectedLogEntry }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Event</th>
          <th className='text-right'>Time</th>
        </tr>
      </thead>
      <tbody>
        {logEntries && logEntries.map(logEntry =>
          <tr key={`${logEntry._checksum}`} tabIndex='2' onFocus={() => setSelectedLogEntry(logEntry)}>
            <td>{logEntry.event.replace(/([a-z])([A-Z])/g, '$1 $2')}</td>
            <td className='text-right text-no-wrap'>{eliteDateTime(logEntry.timestamp)}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
