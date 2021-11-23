import { useState, useEffect } from 'react'
import { useSocket, useEventListener } from 'components/socket'

function gameEventsToArray (gameEvents) {
  return Object.keys(gameEvents).map(event => {
    return {
      name: event,
      count: gameEvents[event]
    }
  }).sort((a, b) => a.count > b.count ? -1 : 0)
}

export default function Panels_EventTypes () {
  const { connected, sendEvent } = useSocket()
  const [gameEvents, setGameEvents] = useState()

  // Handle game state change on load
  useEffect(async () => {
    const message = await sendEvent('gameState')
    setGameEvents(gameEventsToArray(message.eventTypesLoaded))
  }, [connected])

  // Handle game state changes events from server
  useEffect(() => useEventListener('gameStateChange', (message) => {
    setGameEvents(gameEventsToArray(message.eventTypesLoaded))
  }), [])

  return (
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
  )
}
