export default function ShipInstrumentation ({ ship, cmdrStatus, toggleSwitches, toggleSwitch }) {
  return (
    <>
      <div className='visible-medium' style={{ padding: '1rem 0' }}>
        <NavigationInstrumentation ship={ship} cmdrStatus={cmdrStatus} />
      </div>

      <div className='ship-panel--status'>
        <table className='ship-panel__ship-stats'>
          <tbody className='text-info'>
            <tr className='hidden-medium'>
              <td rowSpan={4} style={{ padding: 0, overflow: 'visible' }}>
                <NavigationInstrumentation ship={ship} cmdrStatus={cmdrStatus} />
              </td>
            </tr>
            <tr>
              <td>
                <span className='text-muted'>Max jump range</span>
                <span className='value'>{ship.maxJumpRange || '-'} Ly</span>
              </td>
              <td>
                <span className='text-muted'>Fuel Reservoir</span>
                <span className='value'>{typeof ship?.fuelReservoir === 'number' ? ship.fuelReservoir : '-'}</span>
              </td>
              <td rowSpan={4} className='hidden-medium' style={{ padding: 0 }}>
                <PowerDistribution ship={ship} />
              </td>
            </tr>
            <tr>
              <td>
                <span className='text-muted'>Total mass</span>
                <span className='value'>{ship.mass} T</span>
              </td>
              <td>
                <span className='text-muted'>Total Fuel</span>
                <span className='value'>
                  {typeof ship?.fuelLevel === 'number'
                    ? <progress
                        style={{ margin: '.25rem 0 0 0', height: '1.5rem', display: 'inline-block', width: '10rem', opacity: ship.onBoard ? 1 : .5 }}
                        value={ship?.fuelLevel ?? 0}
                        max={ship?.fuelCapacity ?? 0}
                        className={`progress--border ${ship.onBoard && cmdrStatus?.flags?.lowFuel ? 'progress--danger' : 'progress--info'}`}
                      />
                    : <>-</>}
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <span className='text-muted'>HUD Mode</span>
                <h3 className='value' style={{ padding: '.25rem 0', height: '1.5rem' }}>
                  {ship.onBoard && (cmdrStatus?.flags?.hudInAnalysisMode === true) && <span className='text-secondary'>Analysis</span>}
                  {ship.onBoard && (cmdrStatus?.flags?.hudInAnalysisMode === false) && <span className='text-primary'>Combat</span>}
                  {(!ship.onBoard || !cmdrStatus) && '-'}
                </h3>
              </td>
              <td>
                <span className='text-muted'>Cargo Hold</span>
                <span className='value'>
                  {typeof ship?.cargo?.count === 'number'
                    ? <progress
                        style={{ margin: '.25rem 0 0 0', height: '1.5rem', display: 'inline-block', width: '10rem', opacity: ship.onBoard ? 1 : .5 }}
                        value={ship?.cargo?.count ?? 0}
                        max={ship?.cargo?.capacity ?? 0}
                        className='progress--border progress--info'
                      />
                    : <>-</>}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div className='visible-medium'>
          <PowerDistribution ship={ship} />
        </div>

        <table className='table--layout'>
          <tbody>
            <tr>
              <td>
                <label className='checkbox'>
                  <span className={`checkbox__text ${(!ship.onBoard || !toggleSwitches.lights) && 'text-muted'}`}>
                    Ship Lights
                  </span>
                  <input
                    type='checkbox'
                    checked={ship.onBoard && toggleSwitches?.lights}
                    onChange={() => toggleSwitch('lights')}
                    disabled
                  />
                  <span className='checkbox__control' />
                </label>
              </td>
              <td>
                <label className='checkbox'>
                  <span className={`checkbox__text ${(!ship.onBoard || !toggleSwitches.nightVision) && 'text-muted'}`}>
                    Night Vision
                  </span>
                  <input
                    type='checkbox'
                    checked={ship.onBoard && toggleSwitches?.nightVision}
                    onChange={() => toggleSwitch('nightVision')}
                    disabled
                  />
                  <span className='checkbox__control' />
                </label>
              </td>
              <td>
                <label className='checkbox'>
                  <span className={`checkbox__text ${(!ship.onBoard || !toggleSwitches.cargoHatch) && 'text-muted'}`}>
                    Cargo Hatch
                  </span>
                  <input
                    type='checkbox'
                    checked={ship.onBoard && toggleSwitches?.cargoHatch}
                    onChange={() => toggleSwitch('cargoHatch')}
                    disabled
                  />
                  <span className='checkbox__control' />
                </label>
              </td>
              <td>
                <label className='checkbox'>
                  <span className={`checkbox__text ${(!ship.onBoard || !toggleSwitches.landingGear) && 'text-muted'}`}>
                    Landing Gear
                  </span>
                  <input
                    type='checkbox'
                    checked={ship.onBoard && toggleSwitches?.landingGear}
                    onChange={() => toggleSwitch('landingGear')}
                    disabled
                  />
                  <span className='checkbox__control' />
                </label>
              </td>
              <td>
                <label className='checkbox'>
                  <span className={`checkbox__text ${(!ship.onBoard || !toggleSwitches.hardpoints) && 'text-muted'}`}>
                    Hardpoints
                  </span>
                  <input
                    type='checkbox'
                    checked={ship.onBoard && toggleSwitches?.hardpoints}
                    onChange={() => toggleSwitch('hardpoints')}
                    disabled
                  />
                  <span className='checkbox__control' />
                </label>
              </td>
            </tr>
          </tbody>
        </table>
        <table className='table--layout ship-panel__lights'>
          <tbody>
            <tr>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.overHeating ? 'ship-panel__light--danger' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Overheating</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.beingInterdicted ? 'ship-panel__light--danger' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Interdiction</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.inDanger ? 'ship-panel__light--danger' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Hazard</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && (!cmdrStatus?.flags?.landingGearDown && cmdrStatus?.altitude < 100) ? 'ship-panel__light--danger' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Low Altitude</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.lowFuel ? 'ship-panel__light--danger' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Low Fuel</span>
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.fsdMassLocked ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Mass Locked</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.fsdCooldown ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>FSD Cooldown</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && (cmdrStatus?.flags?.supercruise && !cmdrStatus?.flags?.fsdJump) ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Supercruise</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && (cmdrStatus?.flags?.fsdCharging && !cmdrStatus?.flags?.fsdJump) ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>FSD Charging</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.fsdJump ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>FSD Jumping</span>
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <span className={ship.onBoard && (cmdrStatus?.flags?.docked || cmdrStatus?.flags?.landed) ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>
                    {cmdrStatus?.flags?.docked && 'Docked'}
                    {cmdrStatus?.flags?.landed && 'Landed'}
                    {(!cmdrStatus?.flags?.docked && !cmdrStatus?.flags?.landed) && 'Docked / Landed'}
                  </span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.flightAssistOff ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Flight Assist Off</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.glideMode ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Glide Mode</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.silentRunning ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Silent Running</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.scoopingFuel ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Fuel Scooping</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}


function NavigationInstrumentation ({ ship, cmdrStatus }) {
  return (
    <div className='text-uppercase' style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        display: 'block',
        height: '100%',
        maxHeight: '12rem',
        margin: 'auto',
        aspectRatio: '1',
        border: '.5rem double var(--color-info)',
        transform: `rotate(${ship.onBoard ? cmdrStatus?.heading ?? 0 : 0}deg)`,
        opacity: ship.onBoard ? 1 : '.5',
        borderRadius: '100rem',
        boxShadow: 'inset 0 0 .25rem var(--color-info), 0 0 .25rem var(--color-info)',
        transition: 'opacity .25s ease-in-out'
      }}
      >
        <div style={{
          position: 'absolute',
          top: '-.8rem',
          left: 0,
          right: 0,
          margin: 'auto',
          background: 'var(--color-info)',
          height: '1.25rem',
          width: '1.25rem',
          borderRadius: '100rem',
          boxShadow: '0 0 .5rem var(--color-info)',
          display: ship.onBoard && typeof cmdrStatus?.heading === 'number' ? ' block' : 'none'
        }}
        />
      </div>
      <div style={{
        display: 'block',
        maxHeight: '12rem',
        margin: 'auto',
        aspectRatio: '1/1',
        border: '.5rem double transparent',
        borderRadius: '100rem'
      }}
      >
        <div style={{
          position: 'relative',
          top: '-.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          height: '100%'
        }}
        >
          <h2 style={{ padding: 0, margin: '0 0 .5rem 0' }}>
            <span className='value'>{ship.onBoard ? cmdrStatus?.heading ?? '-' : '-'}°</span>
          </h2>
          <p style={{ padding: 0, margin: '.15rem 0' }}>
            <span className='text-muted'>LAT</span>
            {' '}
            <span className='value'>{ship.onBoard ? cmdrStatus?.latitude ?? '-' : '-'}°</span>
          </p>
          <p style={{ padding: 0, margin: '.15rem 0' }}>
            <span className='text-muted'>LON</span>
            {' '}
            <span className='value'>{ship.onBoard ? cmdrStatus?.longitude ?? '-' : '-'}°</span>
          </p>
          <p style={{ padding: 0, margin: '.15rem 0 0 0' }}>
            <span className='text-muted'>ALT</span>
            {' '}
            <span className='value'>{ship.onBoard
              ? <>
                {cmdrStatus?.altitude > 10000
                  ? <>{(cmdrStatus.altitude / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '-'} KM</>
                  : <>{cmdrStatus?.altitude?.toLocaleString() ?? '-'} M</>}
              </>
              : '-'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

function PowerDistribution ({ ship }) {
  return (
    <div
      className='ship-panel__ship-pips'
      style={{
        position: 'relative',
        padding: '.25rem .5rem'
      }}
    >
      <h4 className='text-center text-muted' style={{marginBottom: '1rem', marginLeft: '2rem'}}>Pwr Distribution</h4>
      <div className='text-uppercase'>
        <div className='ship-panel__ship-pip'>
          <progress className='progress--gradient' value={ship.onBoard ? ship?.pips?.systems : 0} max={8} />
          <label className={(ship.onBoard && ship?.pips?.systems) > 0 ? 'text-primary' : 'text-primary text-muted'}>SYS</label>
        </div>
        <div className='ship-panel__ship-pip'>
          <progress className='progress--gradient' value={ship.onBoard ? ship?.pips?.engines : 0} max={8} />
          <label className={(ship.onBoard && ship?.pips?.engines > 0) ? 'text-primary' : 'text-primary text-muted'}>ENG</label>
        </div>
        <div className='ship-panel__ship-pip'>
          <progress className='progress--gradient' value={ship.onBoard ? ship?.pips?.weapons : 0} max={8} />
          <label className={(ship.onBoard && ship?.pips?.weapons > 0) ? 'text-primary' : 'text-primary text-muted'}>WEP</label>
        </div>
      </div>
    </div>
  )
}