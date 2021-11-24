import { eliteDateTime } from 'lib/format'

export default function LogPanel (props) {
  const { logEntries } = props
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th className='text-right'>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {logEntries && logEntries.map(logEntry =>
          <tr key={`${logEntry._checksum}`}>
            <td>{logEntry.event}</td>
            <td className='text-right'>{eliteDateTime(logEntry.timestamp)}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
