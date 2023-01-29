import { sendEvent } from 'lib/socket'

export default function TestPage () {
  return (
    <div style={{padding: '1rem'}}>
      <h1>Test Page</h1>
      <hr/>
      <h2>Simulate Events</h2>
      <p>
        Send a test event to all connected clients.
      </p>
      <input id='debug_event_name' defaultValue='Test' style={{textTransform: 'none'}}/>
      <p>
        <button onClick={() => {
          sendEvent('testMessage', { name: document.getElementById('debug_event_name').value })
        }}>Send Event</button>
      </p>
      <h2>Simulate Log Entry</h2>
      <p>
        Simulate an event triggered after an in-game log entry is fired.
      </p>
      <input id='debug_log_entry_name' defaultValue='Scan' style={{textTransform: 'none'}}/>
      <p>
        <button onClick={() => {
          sendEvent('testMessage', { 
            name: 'newLogEntry',
            message: { 
              event: document.getElementById('debug_log_entry_name').value }
            }
          )
        }}>Simulate Log Entry</button>
      </p>
    </div>
  )
}
