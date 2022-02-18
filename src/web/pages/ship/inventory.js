import { useState, useEffect } from 'react'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { ShipPanelNavItems } from 'lib/navigation-items'
import { eliteDateTime } from 'lib/format'
import Layout from 'components/layout'
import Panel from 'components/panel'
import CopyOnClick from 'components/copy-on-click'

export default function ShipInventoryPage () {
  const { connected, active, ready } = useSocket()
  const [shipLocker, setShipLocker] = useState()
  const [componentReady, setComponentReady] = useState(false)

  useEffect(async () => {
    if (!connected) return
    setShipLocker(await sendEvent('getShipLocker'))
    setComponentReady(true)
  }, [connected, ready])

  useEffect(() => eventListener('gameStateChange', async () => {
    setShipLocker(await sendEvent('getShipLocker'))
  }), [])

  useEffect(() => eventListener('newLogEntry', async () => {
    setShipLocker(await sendEvent('getShipLocker'))
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready} loader={!componentReady}>
      <Panel layout='full-width' scrollable navigation={ShipPanelNavItems('Inventory')}>
          <>
            <h2>Inventory</h2>
            <h3 className='text-primary'>
              Ship Locker
            </h3>
            <hr style={{ margin: '.5rem 0 0 0' }} />
            {shipLocker &&
              <>
                <LockerItems heading='Consumables' items={shipLocker.Consumables}/>
                <LockerItems heading='Goods' items={shipLocker.Items}/>
                <LockerItems heading='Components' items={shipLocker.Components}/>
                <LockerItems heading='Data' items={shipLocker.Data}/>
              </>}
          </>
      </Panel>
    </Layout>
  )
}

function LockerItems({heading, items}) {
  return (
    <>
      <div className='tabs'>
        <h4 className='tab' style={{ marginTop: '1rem' }}>
          {heading}
        </h4>
      </div>
      <table className='table--animated fx-fade-in'>
        <thead style={{ xdisplay: 'none' }}>
          <tr>
            <th className='text-right' style={{ width: '3rem' }}>#</th>
            <th>{heading.replace(/s$/, '')}</th>
          </tr>
        </thead>
        <tbody>
          {items.sort((a, b) => (a?.Name_Localised ?? a.Name).localeCompare(b?.Name_Localised ?? b.Name)).map(item => (
            <tr>
              <td className='text-right' style={{ width: '3rem' }}>{item?.Count ?? 0}</td>
              <td>
                {item?.Name_Localised ?? item.Name}
                {item.MissionID && <span className='float-right text-secondary'> Mission Critical</span>}
                {item.OwnerID > 0 && <span className='float-right text-danger'> Stolen</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}