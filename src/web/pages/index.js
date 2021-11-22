import { useState, useEffect } from 'react'
import { toggleFullScreen } from 'lib/window'
import { useSocket, useEventListener } from 'components/socket'
import Loader from 'components/loader'
import Panel from 'components/panel'

function gameEventsToArray (gameEvents) {
  return Object.keys(gameEvents).map(event => {
    return {
      name: event,
      count: gameEvents[event]
    }
  }).sort((a, b) => a.count > b.count ? -1 : 0)
}

export default function IndexPage () {
  const { connected, sendEvent } = useSocket()
  const [gameEvents, setGameEvents] = useState()

  useEffect(async () => {
    const message = await sendEvent('gameState')
    setGameEvents(gameEventsToArray(message.eventTypesLoaded))
  }, [connected])

  useEffect(() => useEventListener('gameStateChange', (message) => {
    setGameEvents(gameEventsToArray(message.eventTypesLoaded))
  }), [])

  return (
    <>
      <Loader visible={!connected} />
      <Panel visible={connected}>
        <h2 style={{ padding: '1rem 0' }}>ICARUS Terminal</h2>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <button onClick={toggleFullScreen}>Toggle Fullscreen</button>
        </div>
        <div className='scrollable' style={{ position: 'absolute', top: '5rem', bottom: '1rem', left: '1rem', right: '1rem' }}>
          <table>
            <thead>
              <tr>
                <th>Event name</th>
                <th className='text-right'>Number of events</th>
              </tr>
            </thead>
            <tbody>
              {gameEvents && gameEvents.map(event =>
                <tr key={event.name}>
                  <td>{event.name}</td>
                  <td className='text-right'>{event.count}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
