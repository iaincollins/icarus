import { useState, useEffect } from 'react'
import { useSocket, sendEvent } from 'lib/socket'
import Layout from 'components/layout'
import Panel from 'components/panel'
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

  useEffect(async () => {
    if (!connected) return
    setShip(await sendEvent('getShipModules'))
  }, [connected, ready])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' navigation={ShipPanelNavItems('Modules')} scrollable>
        {ship &&
          <div className='ship-panel'>
            <h1 style={{ marginBottom: '.5rem' }} className='text-info'>{ship.name}</h1>
            <h3 style={{ marginBottom: '1rem' }} className='text-primary'>
              {ship.type.replaceAll('_', ' ')} // ID {ship.ident}
            </h3>
            <table className='ship-panel__ship-stats'>
              <tbody>
                <tr>
                  <td className='text-info'>
                    <span className='text-muted'>Max jump range</span>
                    <span className='value'>{parseFloat(ship.maxJumpRange).toFixed(2)}LY</span>
                  </td>
                  <td className='text-info'>
                    <span className='text-muted'>Fuel (curr/max)</span>
                    <span className='value'>{parseFloat(ship.fuelLevel).toFixed(2)}/{parseFloat(ship.fuelCapacity).toFixed(2)}</span>
                  </td>
                  <td className='text-info'>
                    <span className='text-muted'>Total power draw</span>
                    <span className='value'>{parseFloat(ship.modulePowerDraw).toFixed(2)} MW</span>
                  </td>
                </tr>
                <tr>
                  <td className='text-info'>
                    <span className='text-muted'>Rebuy value</span>
                    <span className='value'>{ship.rebuy.toLocaleString()} CR</span>
                  </td>
                  <td className='text-info'>
                    <span className='text-muted'>Module value</span>
                    <span className='value'>{ship.moduleValue.toLocaleString()} CR</span>
                  </td>
                  <td className='text-info'>
                    <span className='text-muted'>Cargo (curr/max)</span>
                    <span className='value'>{ship.cargo.count}/{ship.cargo.capacity} T</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <hr />
            <Modules name='Hardpoints' hardpoint modules={Object.values(ship.modules).filter(module => ['huge', 'large', 'medium', 'small'].includes(module?.size))} />
            <hr />
            <Modules
              name='Optional Internals' optional modules={
              Object.values(ship.modules)
                .filter(module => {
                  if (!module.internal) return false
                  if (CORE_SHIP_SLOTS.includes(module.slot)) return false
                  if (module.slot === 'CodexScanner') return false // special case
                  return true
                })
            }
            />
            <hr />
            <Modules
              name='Core Internals' modules={
                Object.values(ship.modules)
                  .filter(module => {
                    if (!CORE_SHIP_SLOTS.includes(module.slot) && !ship.armour.includes(module.name)) return false
                    return true
                  })
            } filter={['tiny']}
            />
            <hr />
            <div style={{ marginBottom: '1rem' }} className='ship-panel__modules--inline'>
              <Modules name='Utility Mounts' modules={Object.values(ship.modules).filter(module => ['tiny'].includes(module?.size))} />
            </div>
          </div>}
      </Panel>
    </Layout>
  )
}

const Modules = ({ name, modules, hardpoint, optional }) => {
  const mountText = hardpoint ? 'Mount' : ''

  return (
    <>
      <h2 style={{ margin: '1rem 0' }} className='text-info text-muted'>{name}</h2>
      <table className='table--flex-inline'>
        <tbody>
          {modules.map(module => {
            const moduleMountText = optional
              ? module.slot.replace('_', '')
                  .replace(/([0-9]+)/g, ' $1 ')
                  .replace(/^Slot ([0-9]+) Size ([0-9]+)/g, '') // "(Max size: $2)")
                  .replace(/Military 0([0-9])/, '(Military slot $1)')
                  .replace(/([a-z])([A-Z])/g, '$1 $2')
                  .trim() || mountText
              : mountText

            const moduleName = module.name
              .replace(/ Package$/, '') // Hull / Armour modules
              .replace(/multidronecontrol_universal/, 'Universal Drone Controller') // e.g. int_multidronecontrol_universal_size7_class5
              .replace(/int_/, '').replace(/_size(.*?)$/g, ' ').replace(/_/g, ' ') // Other unsupported modules

            return (
              <tr key={`${name}_${module.name}_${module.slot}`}>
                <td className='ship-panel__module'>
                  <div
                    style={{
                      height: '100%',
                      width: '5.5rem',
                      display: 'inline-block',
                      float: 'left',
                      margin: '0 .5rem 0 .5rem',
                      background: 'var(--dark-primary-color)'
                    }} className='text-center'
                  >
                    <div style={{ fontSize: '3.5rem' }}>
                      {module.class && <>{module.class}{module.rating}</>}
                      {!module.class && <></>}
                    </div>
                    {module.size && module.size !== 'tiny' && module.size}
                  </div>
                  <h3 className='disabled--fx-animated-text' data-module-name={module.name} data-fx-order='3'>
                    {moduleName}
                  </h3>
                  <p className='text-no-wrap text-muted disabled--fx-animated-text' data-fx-order='4'>
                    {module.mount} {moduleMountText}
                  </p>
                  {module?.power > 0 &&
                    <p className='text-no-wrap'>
                      <span className='text-muted'>Power</span> {parseFloat(module.power).toFixed(2)} MW
                    </p>}
                  {module.ammoInClip &&
                    <p className='text-no-wrap'>
                      <span className='text-muted'>Ammo</span> {module.ammoInClip + module.ammoInHopper}
                    </p>}
                  {module.engineering &&
                    <div className='ship-panel__engineering disabled--fx-animated-text' data-fx-order='4'>
                      {[...Array(module.engineering)].map((j, i) =>
                        <i
                          key={`${name}_${module.name}_${module.slot}_engineering_${i}`}
                          style={{ display: 'inline-block', marginRight: '.25rem' }}
                          className='text-info icon icarus-terminal-engineering'
                        />
                      )}
                    </div>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
