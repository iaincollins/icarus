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

  useEffect(() => {
    document.addEventListener('click', onClickHandler)
    return () => document.removeEventListener('click', onClickHandler)
    function onClickHandler (event) {
      if (!document?.activeElement?.getAttribute('data-module-slot')) {
        if (!event?.target?.getAttribute('data-module-slot')) {
          // If click on that isn't a module, clear selected module
          setSelectedModule(null)
        }
      }
    }
  }, [])

  return (
    <Layout connected={connected} active={active} ready={ready} className='ship-panel'>
      {ship &&
        <Panel
          navigation={ShipPanelNavItems('Modules')}
          scrollable
        >
          <div className={`ship-panel__modules scrollable ${selectedModule ? 'ship-panel__modules--module-inspector' : ''}`}>
            <h1 className='text-info' style={{ marginRight: '13rem' }}>{ship.name}</h1>
            <h2 className='text-info text-muted'>IDENT {ship.ident}</h2>
            <h2 style={{ marginBottom: '.5rem' }} className='text-primary'>
              {ship.type.replaceAll('_', ' ')}
            </h2>
            {ship.onBoard &&
              <div className='ship-panel__ship-pips text-uppercase'>
                <div className='ship-panel__ship-pip'>
                  <progress value={ship.pips.systems} max={8} />
                  <label className={ship?.pips?.systems > 0 ? 'text-primary' : 'text-primary text-blink'}>Systems</label>
                </div>
                <div className='ship-panel__ship-pip'>
                  <progress value={ship.pips.engines} max={8} />
                  <label className={ship?.pips?.engines > 0 ? 'text-primary' : 'text-primary text-blink'}>Engines</label>
                </div>
                <div className='ship-panel__ship-pip'>
                  <progress value={ship.pips.weapons} max={8} />
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
            <Modules
              name='Hardpoints'
              hardpoint
              modules={
                  Object.values(ship.modules).filter(module => ['huge', 'large', 'medium', 'small'].includes(module?.size))
                }
              selectedModule={selectedModule}
              setSelectedModule={setSelectedModule}
            />
            <hr />
            <Modules
              name='Optional Internals'
              optional
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
            <Modules
              name='Core Internals'
              modules={
                  Object.values(ship.modules)
                    .filter(module => {
                      if (!CORE_SHIP_SLOTS.includes(module.slot) && !ship.armour.includes(module.name)) return false
                      return true
                    })
                }
              filter={['tiny']}
              selectedModule={selectedModule}
              setSelectedModule={setSelectedModule}
            />
            <hr />
            <div style={{ marginBottom: '1rem' }} className='ship-panel__modules--inline'>
              <Modules
                name='Utility Mounts'
                modules={Object.values(ship.modules).filter(module => ['tiny'].includes(module?.size))}
                selectedModule={selectedModule}
                setSelectedModule={setSelectedModule}
              />
            </div>
          </div>
        </Panel>}
      <Panel scrollable>
        <div
          className={`ship-panel__module-inspector scrollable ${!selectedModule ? 'ship-panel__module-inspector--hidden' : ''}`}
          data-module-slot={selectedModule?.slot}
          onClick={(e) => e.preventDefault()}
        >
          {selectedModule && <Module module={selectedModule} />}
        </div>
      </Panel>
    </Layout>
  )
}

const Module = ({ module }) => {
  // const mountText = ['Turreted', 'Fixed', 'Gimbled'].includes(module.mount) ? `${module.mount} Mount` : ''
  const size = ['Turreted', 'Fixed', 'Gimbled'].includes(module.mount) && module.size !== 'tiny' ? module.size : ''
  const slotName = module.slot.replace('_', ' ')
    .replace(/([0-9]+)/g, ' $1 ')
    .replace(/^Slot ([0-9]+) Size ([0-9]+)/g, '') // "(Max size: $2)")
    .replace(/ 0/g, ' ') // Leading zeros in numbers
    .replace(/Military 0([0-9])/, 'Military slot $1')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()

  const moduleName = module.name
    .replace(/ Package$/, '') // Hull / Armour modules
    .replace(/multidronecontrol_universal/, 'Universal Limpet Controller') // e.g. int_multidronecontrol_universal_size7_class5
    .replace(/int_/, '').replace(/_size(.*?)$/g, ' ').replace(/_/g, ' ') // Fallback for other unsupported modules

  return (
    <>
      <button className='button--icon button__close-button'>
        <i className='icon icarus-terminal-chevron-down' />
      </button>
      <h2 className='text-info' data-module-name={module.name} data-fx-order='3'>
        {size} {module.mount} {moduleName}
      </h2>
      <h3 className='text-no-wrap'>
        {module.class}{module.rating} <span className='text-muted'>Class Rating</span>
      </h3>
      <div className='ship-panel__module-info text-uppercase'>
        <div className='text-primary' style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          <p className='text-no-wrap '>
            <span className='text-muted'>Slot</span> {slotName}
          </p>
          {module?.power > 0 &&
            <p className='text-no-wrap'>
              <span className='text-muted'>Power</span> {parseFloat(module.power).toFixed(2)} MW
            </p>}
          {module.ammoInHopper &&
            <p className='text-no-wrap'>
              <span className='text-muted'>Ammo in Hopper</span> {module.ammoInHopper}
            </p>}
          {module.ammoInClip &&
            <p className='text-no-wrap'>
              <span className='text-muted'>Ammo in Clip</span> {module.ammoInClip}
            </p>}
          {module.engineering &&
            <>
              <p className='text-secondary'>
                {module.engineering.BlueprintName.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim()} <span className='text-muted'>modification</span>
                {module.engineering.ExperimentalEffect_Localised &&
                  <>
                    <br />
                    <span className='text-muted'>with </span> <span className='text-secondary'>{module.engineering.ExperimentalEffect_Localised.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim()}</span> <span className='text-muted'>experimental effect</span>
                  </>}
                <br /><span className='text-muted'>by</span> {module.engineering.Engineer}
              </p>
              <div className='text-secondary' style={{ fontSize: '2rem' }}>
                {[...Array(module.engineeringLevel)].map((j, i) =>
                  <i
                    key={`${module.name}_${module.slot}_engineering_${i}`}
                    className='icon icarus-terminal-engineering'
                  />
                )}
              </div>
            </>}
        </div>
      </div>
      <div className='ship-panel__module-engineering text-uppercase' style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        {module.engineering &&
          <>
            <p>
              Modified
            </p>
            <ul>
              {module.engineering.Modifiers.map((modifier) =>
                <li
                  key={`${module.name}_${module.slot}_engineering_modifier_${modifier.Label}`}
                  className='text-secondary'
                >
                  {modifier.Label.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim()}
                  <span style={{ marginLeft: '1rem' }}>
                    {(modifier.LessIsGood === 0 && modifier.Value > modifier.OriginalValue) && <><span className='text-success'>+{(modifier.Value - modifier.OriginalValue).toFixed(2).replace(/\.00$/, '')}</span></>}
                    {(modifier.LessIsGood === 0 && modifier.Value < modifier.OriginalValue) && <><span className='text-danger'>-{(modifier.OriginalValue - modifier.Value).toFixed(2).replace(/\.00$/, '')}</span></>}
                    {(modifier.LessIsGood === 1 && modifier.Value < modifier.OriginalValue) && <><span className='text-success'>-{(modifier.OriginalValue - modifier.Value).toFixed(2).replace(/\.00$/, '')}</span></>}
                    {(modifier.LessIsGood === 1 && modifier.Value > modifier.OriginalValue) && <><span className='text-danger'>+{(modifier.Value - modifier.OriginalValue).toFixed(2).replace(/\.00$/, '')}</span></>}
                  </span>
                </li>

              )}
            </ul>
          </>}
      </div>
    </>
  )
}

const Modules = ({ name, modules, hardpoint, optional, selectedModule, setSelectedModule = () => {} }) => {
  const mountText = hardpoint ? 'Mount' : ''

  return (
    <>
      <h2 style={{ margin: '1rem 0' }} className='text-info text-muted'>{name}</h2>
      <table className='table--flex-inline table--interactive'>
        <tbody>
          {modules.map(module => {
            const moduleMountText = optional
              ? module.slot.replace('_', '')
                  .replace(/([0-9]+)/g, ' $1 ')
                  .replace(/^Slot ([0-9]+) Size ([0-9]+)/g, '') // "(Max size: $2)")
                  .replace(/Military 0([0-9])/, 'Military slot $1')
                  .replace(/([a-z])([A-Z])/g, '$1 $2')
                  .trim() || mountText
              : mountText

            const moduleName = module.name
              .replace(/ Package$/, '') // Hull / Armour modules
              .replace(/multidronecontrol_universal/, 'Universal Limpet Controller') // e.g. int_multidronecontrol_universal_size7_class5
              .replace(/int_/, '').replace(/_size(.*?)$/g, ' ').replace(/_/g, ' ') // Fallback for other unsupported modules
            return (
              <tr
                key={`${name}_${module.name}_${module.slot}`}
                tabIndex='3'
                onFocus={() => setSelectedModule(module)}
                data-module-slot={module.slot}
                className={selectedModule && selectedModule.slot === module.slot ? 'table__row--active' : null}
              >
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
                  {/*
                  {module?.power > 0 &&
                    <p className='text-no-wrap'>
                      <span className='text-muted'>Power</span> {parseFloat(module.power).toFixed(2)} MW
                    </p>}
                  */}
                  {module.ammoInClip &&
                    <p className='text-no-wrap'>
                      <span className='text-muted'>Ammo</span> {module.ammoInClip + module.ammoInHopper}
                    </p>}
                  {module.engineering &&
                    <div className='ship-panel__engineering disabled--fx-animated-text' data-fx-order='4'>
                      {[...Array(module.engineeringLevel)].map((j, i) =>
                        <i
                          key={`${name}_${module.name}_${module.slot}_engineering_${i}`}
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
