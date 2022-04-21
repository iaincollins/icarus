import { UNKNOWN_VALUE } from '../../../../shared/consts'
import ShipModules from './ship-modules'

export default function ShipModulesPanel ({ ship, selectedModule, setSelectedModule, cmdrStatus }) {
  if (!ship) return null

  if (ship.type === UNKNOWN_VALUE && ship.name === UNKNOWN_VALUE && ship.ident === UNKNOWN_VALUE) {
    return (
      <div
        className='text-primary text-blink-slow text-center text-center-vertical'
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
          <h2>{ship.name}</h2>
          <h3 className='text-primary'>
            {ship.ident}
            <span className='text-primary text-muted'> {ship.type}</span>
          </h3>
        </div>
        <div className='ship-panel__ship-pips text-uppercase visible-medium'>
          <h4 className='text-muted' style={{marginBottom: '1rem'}}>Power Distribution</h4>
          <div className='ship-panel__ship-pip'>
            <progress value={ship.onBoard ? ship?.pips?.systems : 0} max={8} />
            <label className={(ship.onBoard && ship?.pips?.systems) > 0 ? 'text-primary' : 'text-primary text-muted'}>SYS</label>
          </div>
          <div className='ship-panel__ship-pip'>
            <progress value={ship.onBoard ? ship?.pips?.engines : 0} max={8} />
            <label className={(ship.onBoard && ship?.pips?.engines > 0) ? 'text-primary' : 'text-primary text-muted'}>ENG</label>
          </div>
          <div className='ship-panel__ship-pip'>
            <progress value={ship.onBoard ? ship?.pips?.weapons : 0} max={8} />
            <label className={(ship.onBoard && ship?.pips?.weapons > 0) ? 'text-primary' : 'text-primary text-muted'}>WEP</label>
          </div>
        </div>

        <div className='ship-panel--status'>
          <table className='ship-panel__ship-stats'>
            <tbody className='text-info'>
              <tr className='hidden-medium'>
                <td rowSpan={4}>
                  <div style={{
                    position: 'relative',
                    border: '.2rem solid var(--color-primary-dark)',
                    padding: '.25rem .5rem',
                    background:'var(--color-background-panel-translucent)'
                  }}>
                    <h4 className='text-muted text-center' style={{margin: '.5rem 0'}}>Power Distribution</h4>
                    <div className='ship-panel__ship-pips text-uppercase'>
                      <div className='ship-panel__ship-pip'>
                        <progress value={ship.onBoard ? ship?.pips?.systems : 0} max={8} />
                        <label className={(ship.onBoard && ship?.pips?.systems) > 0 ? 'text-primary' : 'text-primary text-muted'}>SYS</label>
                      </div>
                      <div className='ship-panel__ship-pip'>
                        <progress value={ship.onBoard ? ship?.pips?.engines : 0} max={8} />
                        <label className={(ship.onBoard && ship?.pips?.engines > 0) ? 'text-primary' : 'text-primary text-muted'}>ENG</label>
                      </div>
                      <div className='ship-panel__ship-pip'>
                        <progress value={ship.onBoard ? ship?.pips?.weapons : 0} max={8} />
                        <label className={(ship.onBoard && ship?.pips?.weapons > 0) ? 'text-primary' : 'text-primary text-muted'}>WEP</label>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <span className='text-muted'>Max jump range</span>
                  <span className='value'>{ship.maxJumpRange || '-'} Ly</span>
                </td>
                <td>
                  <span className='text-muted'>Fuel (curr/max)</span>
                  <span className='value'>{typeof ship?.fuelLevel === 'number' ? ship.fuelLevel : '-'}/{ship.fuelCapacity} T</span>
                </td>
                <td>
                  <span className='text-muted'>Cargo (curr/max)</span>
                  <span className='value'>{typeof ship?.cargo?.count === 'number' ? ship.cargo.count : '-'}/{ship.cargo.capacity} T</span>
                </td>
              </tr>
              <tr>
                <td>
                  {/*
                  <span className='text-muted'>Insurance Rebuy</span>
                  <span className='value'>{ship.rebuy ? ship.rebuy.toLocaleString() : '-'} CR</span>
                  */}
                  <span className='text-muted'>HUD Targeting</span>
                  <span className='value'>
                    {ship.onBoard && (cmdrStatus?.flags?.hudInAnalysisMode ? 'Analysis Mode' : 'Combat Mode')}
                    {!ship.onBoard && '-'}
                  </span>
                </td>
                <td>
                  <span className='text-muted'>Fuel Reservoir</span>
                  <span className='value'>{typeof ship?.fuelReservoir === 'number' ? ship.fuelReservoir : '-'}</span>
                </td>
                <td>
                  <span className='text-muted'>Total mass</span>
                  <span className='value'>{ship.mass} T</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span className='text-muted'>Lat/Lon</span>
                  <span className='value'>{ship.onBoard ? `${cmdrStatus?.latitude ?? '-'}/${cmdrStatus?.longitude ?? '-'}` : '-/-'}</span>
                </td>
                <td>
                  <span className='text-muted'>Heading</span>
                  <span className='value'>{ship.onBoard ? cmdrStatus?.heading ?? '-' : '-'} DEG</span>
                </td>
                <td>
                  <span className='text-muted'>Altitude</span>
                  <span className='value'>{ship.onBoard ? cmdrStatus?.altitude?.toLocaleString() ?? '-' : '-'} M</span>
                </td>
              </tr>
            </tbody>
          </table>

          <table className='table--layout'>
            <tbody>
              <tr>
                <td>
                <label className='checkbox'>
                  <span className='checkbox__text'>Ship Lights</span>
                  <input type='checkbox' checked={ship.onBoard && cmdrStatus?.flags?.lightsOn} />
                  <span class='checkbox__control'/>
                </label>
                </td>
                <td>
                <label className='checkbox'>
                  <span className='checkbox__text'>Night Vision</span>
                  <input type='checkbox' checked={ship.onBoard && cmdrStatus?.flags?.nightVision} />
                  <span class='checkbox__control'/>
                </label>
                </td>
                <td>
                  <label className='checkbox'>
                    <span className='checkbox__text'>Hardpoints</span>
                    <input type='checkbox' checked={ship.onBoard && cmdrStatus?.flags?.hardpointsDeployed} />
                    <span class='checkbox__control'/>
                  </label>
                </td>
                <td>
                  <label className='checkbox'>
                    <span className='checkbox__text'>Landing Gear</span>
                    <input type='checkbox' checked={ship.onBoard && cmdrStatus?.flags?.landingGearDown} />
                    <span class='checkbox__control'/>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
          <table className='table--layout'>
            <tbody>
              <tr>
                <td>
                  <span className={ship.onBoard && cmdrStatus?.flags?.overHeating ? 'ship-panel__light--danger' : 'ship-panel__light--off'}>
                    <span className='ship-panel__light-text'>Overheating</span>
                  </span>
                </td>
                <td>
                  <span className={ship.onBoard && cmdrStatus?.flags?.beingInterdicted ? 'ship-panel__light--danger' : 'ship-panel__light--off'}>
                    <span className='ship-panel__light-text'>Interdiction Detected</span>
                  </span>
                </td>
                <td>
                  <span className={ship.onBoard && cmdrStatus?.flags?.lowFuel ? 'ship-panel__light--danger' : 'ship-panel__light--off'}>
                    <span className='ship-panel__light-text'>Fuel Low</span>
                  </span>
                </td>
                <td>
                  <span className={ship.onBoard && cmdrStatus?.flags?.inDanger ? 'ship-panel__light--danger' : 'ship-panel__light--off'}>
                    <span className='ship-panel__light-text'>Danger</span>
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <span className={ship.onBoard && cmdrStatus?.flags?.fsdMassLocked ? 'ship-panel__light--secondary' : 'ship-panel__light--off'}>
                    <span className='ship-panel__light-text'>Mass Locked</span>
                  </span>
                </td>
                <td>
                  <span className={ship.onBoard && cmdrStatus?.flags?.fsdCooldown ? 'ship-panel__light--secondary' : 'ship-panel__light--off'}>
                    <span className='ship-panel__light-text'>Frame Shift Cooldown</span>
                  </span>
                </td>
                <td>
                  <span className={ship.onBoard && cmdrStatus?.flags?.fsdCharging ? 'ship-panel__light--secondary' : 'ship-panel__light--off'}>
                    <span className='ship-panel__light-text'>Frame Shift Charging</span>
                  </span>
                </td>
                <td>
                  <span className={ship.onBoard && cmdrStatus?.flags?.fsdJump ? 'ship-panel__light--secondary' : 'ship-panel__light--off'}>
                    <span className='ship-panel__light-text'>Frame Shift Jumping</span>
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <span className={ship.onBoard && (cmdrStatus?.flags?.docked || cmdrStatus?.flags?.landed) ? 'ship-panel__light--info' : 'ship-panel__light--off'}>
                    <span className='ship-panel__light-text'>Docked</span>
                  </span>
                </td>
                <td>
                  <span className={ship.onBoard && cmdrStatus?.flags?.supercruise ? 'ship-panel__light--info' : 'ship-panel__light--off'}>
                    <span className='ship-panel__light-text'>Supercruise</span>
                  </span>
                </td>
                <td>
                  <span className={ship.onBoard && cmdrStatus?.flags?.scoopingFuel ? 'ship-panel__light--info' : 'ship-panel__light--off'}>
                    <span className='ship-panel__light-text'>Fuel Scooping</span>
                  </span>
                </td>
                <td>
                  <span className={ship.onBoard && cmdrStatus?.flags?.flightAssistOff ? 'ship-panel__light--info' : 'ship-panel__light--off'}>
                    <span className='ship-panel__light-text'>Flight Assist Off</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

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
