import { objectToHtml } from 'lib/format'

export default function LogPanel ({ logEntry }) {
  return (
    <div style={{ paddingLeft: '1rem' }}>
      <h2 className='text-primary'>Log Entry</h2>
      <div
        className='selectable' dangerouslySetInnerHTML={{
          __html: `${objectToHtml(logEntry)}`
        }}
      />
    </div>
  )
}
