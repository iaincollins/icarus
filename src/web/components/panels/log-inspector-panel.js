import { objectToHtml } from 'lib/format'

export default function LogInspectorPanel ({ logEntry }) {
  return (
    <div style={{ padding: '.5rem 1rem' }}>
      <h2 className='text-primary'>Log Entry</h2>
      <hr style={{ margin: '1rem 0' }} />
      <div
        className='selectable' dangerouslySetInnerHTML={{
          __html: `${objectToHtml(logEntry)}`
        }}
      />
    </div>
  )
}
