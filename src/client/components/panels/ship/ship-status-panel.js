import { UNKNOWN_VALUE } from '../../../../shared/consts'
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
      <div className='ship-panel__status scrollable'>
        <div className='ship-panel__title'>
          <div>
            <h2>{ship.name}</h2>
            <h3 className='text-primary'>
              {ship.ident}
              <span className='text-primary text-muted'> {ship.type}</span>
            </h3>
          </div>
          <div style={{ position: 'relative', minWidth: '7em' }}>
            <h5 className='text-right text-info text-uppercase' style={{ position: 'absolute', right: '.5rem', opacity: ship.onBoard ? 1 : 0.5 }}>
              {ship.onBoard ? 'Online' : 'Offline'}
            </h5>
            <div className={`ship-panel__horizontal-activity ${ship.onBoard ? 'ship-panel__horizontal-activity--online' : ''}`}/>
            <div className='ship-panel__horizontal-activity-marker'/>
          </div>
        </div>
        <hr style={{ margin: '0 0 1rem 0' }} />
        <ShipInstrumentation
          ship={ship}
          cmdrStatus={cmdrStatus}
          toggleSwitches={toggleSwitches}
          toggleSwitch={toggleSwitch}
        />
      </div>
    </>
  )
}
