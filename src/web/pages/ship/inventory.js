import { useState, useEffect } from 'react'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { ShipPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'
import CopyOnClick from 'components/copy-on-click'

export default function ShipInventoryPage () {
  const { connected, active, ready } = useSocket()
  const [inventory, setInventory] = useState()
  const [componentReady, setComponentReady] = useState(false)

  useEffect(async () => {
    if (!connected) return
    setInventory(await sendEvent('getInventory'))
    setComponentReady(true)
  }, [connected, ready])

  useEffect(() => eventListener('gameStateChange', async () => {
    setInventory(await sendEvent('getInventory'))
  }), [])

  useEffect(() => eventListener('newLogEntry', async () => {
    setInventory(await sendEvent('getInventory'))
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready} loader={!componentReady}>
      <Panel layout='full-width' scrollable navigation={ShipPanelNavItems('Inventory')}>
        <>
          <h2>Item Storage</h2>
          <h3 className='text-primary'>
            Ship Locker
          </h3>
          {inventory?.items &&
            <>
              <LockerItems heading='Consumables' max='100' items={inventory.items.filter(item => item.type === 'Consumable')} />
              <LockerItems heading='Goods' count={inventory.counts.goods} items={inventory.items.filter(item => item.type === 'Goods')} />
              <LockerItems heading='Assets' count={inventory.counts.components} items={inventory.items.filter(item => item.type === 'Component')} />
              <LockerItems heading='Data' count={inventory.counts.data} items={inventory.items.filter(item => item.type === 'Data')} />
            </>}
        </>
      </Panel>
    </Layout>
  )
}

function LockerItems ({ heading, items, count = false, max = false }) {
  return (
    <>
      <div className='section-heading'>
        <h4 className='section-heading__text' style={{ marginTop: '1rem' }}>
          {heading}
        </h4>
        {count !== false &&
          <h4 className='float-right text-primary' style={{ paddingTop: '.75rem' }}>
            <span className='float-left' style={{ display: 'inline-block', padding: '.25rem .5rem .25rem 0' }}>
              <span className={`${count > 0 ? '' : 'text-muted'}`}>{count}</span>
              <span className='text-muted'>/1000</span>
            </span>
            <progress
              style={{ marginTop: '.5rem', height: '1.2rem', display: 'inline-block', width: '8rem', float: 'left' }}
              value={count}
              max={1000}
              className='float-left'
            />
          </h4>}
      </div>

      <table className='table--animated fx-fade-in'>
        {items.length === 0 &&
          <tbody><tr><td colSpan={3} style={{ paddingTop: '1rem', paddingBottom: '1rem' }} className='text-center text-muted'>No {heading}</td></tr></tbody>}
        {items.length > 0 &&
          <>
            <thead>
              <tr>
                <th className='text-right' style={{ width: '3rem' }}>#</th>
                <th style={{ width: '25rem' }}>{heading.replace(/s$/, '')}</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={`inventory_${item.name}`}>
                  <td className='text-right' style={{ width: '3rem' }}>
                    <span className={`${item.count > 0 ? '' : 'text-muted'}`}>{item.count}</span>
                    {max !== false && <span className='text-muted'>/{max}</span>}
                  </td>
                  <td style={{ width: '25rem' }}>
                    <CopyOnClick>{item.name}</CopyOnClick>
                  </td>
                  <td>
                    {item.mission > 0 && <span className='text-secondary'> {item.mission} Mission Critical</span>}
                    {item.stolen > 0 && <span className='text-danger'> {item.stolen} Stolen</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </>}
      </table>
      <hr className='small' style={{ margin: '0 0 .5rem 0' }} />
    </>
  )
}
