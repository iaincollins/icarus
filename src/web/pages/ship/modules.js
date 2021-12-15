import { useState, useEffect } from 'react'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
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
    setShip(await sendEvent('getShip'))
  }, [connected, ready])

  useEffect(() => eventListener('gameStateChange', async () => {
    setShip(await sendEvent('getShip'))
  }), [])

  useEffect(() => eventListener('newLogEntry', async (newLogEntry) => {
    setShip(await sendEvent('getShip'))
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' navigation={ShipPanelNavItems('Modules')} scrollable>
        {ship &&
          <div className='ship-panel'>
            <h1 className='text-info'>{ship.name}</h1>
            <h2 className='text-info text-muted'>{ship.ident}</h2>
            <h2 style={{ marginBottom: '1rem' }} className='text-primary'>
              {ship.type.replaceAll('_', ' ')}
            </h2>
            {!ship.onBoard && <div className='ship-panel__ship-pips text-muted text-uppercase'>Not onboard</div>}
            {ship.onBoard &&
              <div className='ship-panel__ship-pips'>
                <div className='ship-panel__ship-pip'>
                  <label className={ship?.pips?.systems > 0 ? 'text-primary' : 'text-primary text-blink'}>SYS</label>
                  <progress value={ship.pips.systems} max={8} />
                </div>
                <div className='ship-panel__ship-pip'>
                  <label className={ship?.pips?.engines > 0 ? 'text-primary' : 'text-primary text-blink'}>ENG</label>
                  <progress value={ship.pips.engines} max={8} />
                </div>
                <div className='ship-panel__ship-pip'>
                  <label className={ship?.pips?.weapons > 0 ? 'text-primary' : 'text-primary text-blink'}>WEP</label>
                  <progress value={ship.pips.weapons} max={8} />
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
              .replace(/multidronecontrol_universal/, 'Universal Limpet Controller') // e.g. int_multidronecontrol_universal_size7_class5
              .replace(/int_/, '').replace(/_size(.*?)$/g, ' ').replace(/_/g, ' ') // Fallback for other unsupported modules
            return (
              <tr key={`${name}_${module.name}_${module.slot}`}>
                <td className='ship-panel__module'>
                  <div
                    style={{
                      height: '100%',
                      width: '5.5rem',
                      margin: '0 .5rem 0 -.5rem',
                      float: 'left'
                    }} className='text-center'
                  >
                    {module.size && module.size !== 'tiny' &&
                      <div
                        style={{
                          width: '5.5rem',
                          paddingBottom: '.5rem'
                        }} className='ship-panel__module-icon'
                      >
                        <div style={{
                          fontSize: '3.5rem'
                        }}
                        >
                          {module.class && <>{module.class}{module.rating}</>}
                          {!module.class && <>?</>}
                        </div>
                        {module.size}
                      </div>}
                    {(!module.size || module.size === 'tiny') &&
                      <div
                        style={{
                          width: '5.5rem',
                          paddingTop: '.75rem',
                          paddingBottom: '1.25rem'
                        }} className='ship-panel__module-icon'
                      >
                        <div style={{
                          fontSize: '3.5rem'
                        }}
                        >
                          {module.class && <>{module.class}{module.rating}</>}
                          {!module.class && <>?</>}
                        </div>
                      </div>}
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
                          className='icon icarus-terminal-engineering'
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
