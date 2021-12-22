import { useState, useEffect } from 'react'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import Layout from 'components/layout'
import Panel from 'components/panel'
import ShipModules from 'components/ship/ship-modules'
import ShipModuleInspectorPanel from 'components/panels/ship/ship-module-inspector-panel'
import { ShipPanelNavItems } from 'lib/navigation-items'

const CORE_SHIP_SLOTS = [
  'PowerPlant',
  'FrameShiftDrive',
  'LifeSupport',
  'PowerDistributor',
  'Radar',
  'FuelTank',
  'MainEngines'
]

export default function ShipModulesPage () {
  const { connected, active, ready } = useSocket()
  const [ship, setShip] = useState()
  const [selectedModule, setSelectedModule] = useState()

  useEffect(async () => {
    if (!connected) return
    setShip(await sendEvent('getShip'))
  }, [connected, ready])

  useEffect(() => eventListener('gameStateChange', async () => {
    setShip(await sendEvent('getShip'))
  }), [])

  useEffect(() => eventListener('newLogEntry', async (newLogEntry) => {
    setShip(await sendEvent('getShip'))
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready} className='ship-panel'>
      {ship &&
        <Panel navigation={ShipPanelNavItems('Modules')} scrollable>
          <div className={`ship-panel__modules scrollable ${selectedModule ? 'ship-panel__modules--module-inspector' : ''}`}>
            <div className='ship-panel__title'>
              <h1 className='text-info'>{ship.name}</h1>
              <h2 className='text-primary'>IDENT {ship.ident}</h2>
              <h3 style={{ marginBottom: '.5rem' }} className='text-primary text-muted'>
                {ship?.type?.replaceAll('_', ' ')}
              </h3>
            </div>
            {ship.onBoard &&
              <div className='ship-panel__ship-pips text-uppercase'>
                <div className='ship-panel__ship-pip'>
                  <progress value={ship?.pips?.systems} max={8} />
                  <label className={ship?.pips?.systems > 0 ? 'text-primary' : 'text-primary text-blink'}>Systems</label>
                </div>
                <div className='ship-panel__ship-pip'>
                  <progress value={ship?.pips?.engines} max={8} />
                  <label className={ship?.pips?.engines > 0 ? 'text-primary' : 'text-primary text-blink'}>Engines</label>
                </div>
                <div className='ship-panel__ship-pip'>
                  <progress value={ship?.pips?.weapons} max={8} />
                  <label className={ship?.pips?.weapons > 0 ? 'text-primary' : 'text-primary text-blink'}>Weapons</label>
                </div>
              </div>}
            <table className='ship-panel__ship-stats'>
              <tbody className='text-info'>
                <tr>
                  <td>
                    <span className='text-muted'>Max jump range</span>
                    <span className='value'>{parseFloat(ship.maxJumpRange).toFixed(2)} Ly</span>
                  </td>
                  <td>
                    <span className='text-muted'>Fuel (curr/max)</span>
                    <span className='value'>{ship.onBoard ? parseFloat(ship.fuelLevel).toFixed(1) : '-'}/{parseFloat(ship.fuelCapacity).toFixed(1)} T</span>
                  </td>
                  <td>
                    <span className='text-muted'>Cargo (curr/max)</span>
                    <span className='value'>{ship.onBoard ? ship.cargo.count : '-'}/{ship.cargo.capacity} T</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className='text-muted'>Rebuy value</span>
                    <span className='value'>{ship.rebuy.toLocaleString()} CR</span>
                  </td>
                  <td>
                    <span className='text-muted'>Module value</span>
                    <span className='value'>{ship.moduleValue.toLocaleString()} CR</span>
                  </td>
                  <td>
                    <span className='text-muted'>Total power draw</span>
                    <span className='value'>{parseFloat(ship.modulePowerDraw).toFixed(2)} MW</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <hr />
            <ShipModules
              name='Hardpoints'
              modules={
                  Object.values(ship.modules)
                    .filter(module => ['huge', 'large', 'medium', 'small']
                    .includes(module?.size))
                }
              selectedModule={selectedModule}
              setSelectedModule={setSelectedModule}
            />
            <hr />
            <ShipModules
              name='Optional Internals'
              modules={
                Object.values(ship.modules)
                  .filter(module => {
                    if (!module.internal) return false
                    if (CORE_SHIP_SLOTS.includes(module.slot)) return false
                    if (module.slot === 'CodexScanner') return false // special case
                    return true
                  })
                }
              selectedModule={selectedModule}
              setSelectedModule={setSelectedModule}
            />
            <hr />
            <ShipModules
              name='Core Internals'
              modules={
                  Object.values(ship.modules)
                    .filter(module => {
                      if (!CORE_SHIP_SLOTS.includes(module.slot) && !ship.armour.includes(module.name)) return false
                      return true
                    })
                }
              selectedModule={selectedModule}
              setSelectedModule={setSelectedModule}
            />
            <hr />
            <div style={{ marginBottom: '1rem' }} className='ship-panel__modules--inline'>
              <ShipModules
                name='Utility Mounts'
                modules={
                  Object.values(ship.modules)
                  .filter(module => ['tiny']
                  .includes(module?.size))
                }
                selectedModule={selectedModule}
                setSelectedModule={setSelectedModule}
              />
            </div>
          </div>
        </Panel>}
      <Panel>
        <ShipModuleInspectorPanel module={selectedModule} setSelectedModule={setSelectedModule} />
      </Panel>
    </Layout>
  )
}
