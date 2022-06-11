import { UNKNOWN_VALUE } from '../../../../shared/consts'
import ShipModules from 'components/panels/ship/ship-status/ship-modules'
import ShipInstrumentation from 'components/panels/ship/ship-status/ship-instrumentation'

export default function ShipStatusPanel ({ ship, selectedModule, setSelectedModule, cmdrStatus, toggleSwitches, toggleSwitch }) {
  if (!ship) return null

  if (ship.type === UNKNOWN_VALUE && ship.name === UNKNOWN_VALUE && ship.ident === UNKNOWN_VALUE) {
    return (
      <div
        className='text-primary text-blink-slow text-center-both'
        style={{ zIndex: '30', pointerEvents: 'none' }}
      >
        <h2>No ship found</h2>
      </div>
    )
  }

  return (
    <>
      <div className={`ship-panel__modules scrollable ${selectedModule ? 'ship-panel__modules--module-inspector' : ''}`}>
        <div className='ship-panel__title'>
          <div>
            <h2>{ship.name}</h2>
            <h3 className='text-primary'>
              {ship.ident}
              <span className='text-primary text-muted'> {ship.type}</span>
            </h3>
          </div>
          <div style={{position: 'relative', minWidth: '7em'}}>
            <h5 className='text-right text-info' style={{position: 'absolute', right: '.5rem', opacity: ship.onBoard ? 1 : .5}}>
              {ship.onBoard ? 'SYS PWR' : 'PWR OFF'}
            </h5>
            <div className={`ship-panel__horizontal-activity ${ship.onBoard ? 'ship-panel__horizontal-activity--online' : ''}`} />
          </div>
        </div>
        <hr style={{margin: '0 0 1rem 0'}}/>
        <ShipInstrumentation
          ship={ship}
          cmdrStatus={cmdrStatus}
          toggleSwitches={toggleSwitches}
          toggleSwitch={toggleSwitch}
        />
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
        <ShipModules
          name='Optional Internals'
          modules={
            Object.values(ship.modules)
              .filter(module => {
                if (!module.internal) return false
                if (module.core) return false
                if (module.slot === 'CodexScanner') return false // special case
                return true
              })
            }
          selectedModule={selectedModule}
          setSelectedModule={setSelectedModule}
        />
        <ShipModules
          name='Core Internals'
          modules={
              Object.values(ship.modules)
                .filter(module => {
                  if (!module.core && !ship.armour.includes(module.name)) return false
                  return true
                })
            }
          selectedModule={selectedModule}
          setSelectedModule={setSelectedModule}
        />
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
    </>
  )
}
