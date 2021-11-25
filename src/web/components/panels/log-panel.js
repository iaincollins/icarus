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
            <td>{logEntry.event}</td>
            <td className='text-right'>{eliteDateTime(logEntry.timestamp)}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
