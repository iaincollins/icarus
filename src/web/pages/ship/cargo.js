import { useState, useEffect } from 'react'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { ShipPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'

export default function ShipCargoPage () {
  const { connected, active, ready } = useSocket()
  const [ship, setShip] = useState()
  const [cargo, setCargo] = useState(null)

  useEffect(async () => {
    if (!connected) return
    const newShip = await sendEvent('getShip')
    setShip(newShip)
    setCargo(newShip?.cargo?.inventory ?? [])
  }, [connected, ready])

  useEffect(() => eventListener('gameStateChange', async () => {
    const newShip = await sendEvent('getShip')
    setShip(newShip)
    setCargo(newShip?.cargo?.inventory ?? [])
  }), [])

  useEffect(() => eventListener('newLogEntry', async () => {
    const newShip = await sendEvent('getShip')
    setShip(newShip)
    setCargo(newShip?.cargo?.inventory ?? [])
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' scrollable navigation={ShipPanelNavItems('Cargo')}>
        {ship &&
          <>
            <h2 className='text-info'>Cargo Manifest</h2>
            <h3 className='text-primary'>
              {ship.ident}
              <span className='text-primary text-muted'> {ship.type}</span>
            </h3>
            {ship && ship.onBoard && <p className='text-info text-muted text-uppercase'>
              Ship manifest is updated on boarding.
            </p>}
            <hr style={{ margin: '1rem 0 0 0' }} />
            {ship && cargo && cargo.length === 0 && <p className='text-info text-uppercase'>Cargo hold is empty.</p>}
            {cargo && cargo.length > 0 &&
              <table className='table--animated fx-fade-in'>
                <thead>
                  <tr>
                    <th style={{ width: '4rem' }} className='text-right'>#</th>
                    <th>Cargo</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {cargo.map((item, i) =>
                    <tr key={`${ship.name}_cargo_${i}_${item.name}`}>
                      <td style={{ width: '4rem' }} className='text-right'>{item.count}</td>
                      <td>{item.name}</td>
                      <td>
                        {item.mission !== false && <span className='text-secondary'>Mission critical </span>}
                        {item.stolen !== false && <span className='text-danger'>Stolen </span>}
                        <span className='text-muted'>{item.description}</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>}
          </>}
      </Panel>
    </Layout>
  )
}
