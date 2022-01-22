import { objectToHtml } from 'lib/format'

export default function LogInspectorPanel ({ logEntry }) {
  if (!logEntry) return null

  return (
    <div style={{ padding: '.5rem 1rem' }}>
      <h2 className='text-primary'>Log Entry</h2>
      <hr style={{ margin: '1rem 0' }} />
      <div
        className='fx-fade-in selectable--text text-no-shadow'
        data-fx-order='1' dangerouslySetInnerHTML={{
          __html: `${objectToHtml(logEntry)}`
        }}
      />
    </div>
  )
}
