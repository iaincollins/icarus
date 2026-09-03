import { secondsToStr } from 'lib/format'

export default function MisPanel ({ missionEntries, setSelectedMissionEntry }) {
  if (!missionEntries) return null

  return (
    <div style={{ paddingRight: '0.5rem' }}>
      <table className='table--animated table--interactive'>
        <thead>
          <tr>
            <th>Mission</th>
            <th className='text-right'>Expires</th>
          </tr>
        </thead>
        <tbody className='fx-fade-in'>
          {missionEntries && missionEntries.map(missionEntry =>
            <tr key={`${missionEntry.MissionID}`} tabIndex='2' onFocus={() => setSelectedMissionEntry(missionEntry)}>
              <td className={missionEntry.State}>
                {missionEntry.Name.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ').replace(/^\$/, '').replace(/;$/, '').trim()}
              </td>
              <td className='text-no-wrap text-right'>
                {secondsToStr(missionEntry.Expires)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
