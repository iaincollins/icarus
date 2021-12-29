import { useState } from 'react'
import { useSocket } from 'lib/socket'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { ShipPanelNavItems } from 'lib/navigation-items'

export default function ShipCargoPage () {
  const { connected, active, ready } = useSocket()
  const [ cargo, setCargo ] = useState([])
  const [ materials, setMaterials ] = useState([])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' navigation={ShipPanelNavItems('Cargo')}>
        <h1 className='text-info'>Inventory</h1>
        <hr style={{margin: '1rem 0'}}/>
        <h2 className='text-primary'>Cargo</h2>
        {cargo.length === 0 && <p className='text-muted text-uppercase'>No cargo</p>}
        {cargo.length > 1 &&
          <table className='table--animated'>
            <thead>
              <tr>
                <td style={{width: '4rem'}} className='text-right'>Amount</td>
                <td>Item</td>
              </tr>
            </thead>
            <tbody>
              {cargo.map(item => 
                <tr>
                  <td style={{width: '4rem'}} className='text-right'>{item.count}</td>
                  <td>{item.name}</td>
                </tr>
              )}
            </tbody>
          </table>
        }
        <hr style={{margin: '1rem 0'}}/>
        <h2 className='text-primary'>Materials</h2>
        {materials.length === 0 && <p className='text-muted text-uppercase'>No materials</p>}
        {materials.length > 1 &&
          <table className='table--animated'>
            <thead>
              <tr>
                <td style={{width: '4rem'}} className='text-right'>Amount</td>
                <td>Item</td>
              </tr>
            </thead>
            <tbody>
              {materials.map(item => 
                <tr>
                  <td style={{width: '4rem'}} className='text-right'>{item.count}</td>
                  <td>{item.name}</td>
                </tr>
              )}
            </tbody>
          </table>
        }
      </Panel>
    </Layout>
  )
}
