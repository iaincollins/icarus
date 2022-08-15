import { useEffect, useRef } from 'react'

const applyScaling = (scaledWrapper, scaledContent) => {
  try {
    scaledContent.style.transform = 'scale(1, 1)'
    const { width: cw, height: ch } = scaledContent.getBoundingClientRect()
    const { width: ww, height: wh } = scaledWrapper.getBoundingClientRect()
    const scaleAmtX = Math.min(ww / cw, wh / ch)
    const scaleAmtY = scaleAmtX
    scaledContent.style.transform = `translate(0, 0) scale(${scaleAmtX}, ${scaleAmtY})`
  } catch (e) {
    console.log(e)
  }
}

export default function ShipInstrumentation ({ ship, cmdrStatus, toggleSwitches, toggleSwitch }) {
  const scaledWrapper = useRef()
  const scaledContent = useRef()

  useEffect(async () => {
    const resizeEventHandler = () => {
      if (scaledWrapper.current && scaledContent.current) {
        applyScaling(scaledWrapper.current, scaledContent.current)
      }
    }
    window.addEventListener('resize', resizeEventHandler)
    resizeEventHandler()
    return () => window.removeEventListener('resize', resizeEventHandler)
  }, [])

  useEffect(()=> {
    if (scaledWrapper.current && scaledContent.current) {
      applyScaling(scaledWrapper.current, scaledContent.current)
    }
  },[scaledWrapper.current,scaledContent.current])

  return (
    <div ref={scaledWrapper} style={{position: 'fixed', pointerEvents: 'none', top: '14.25rem', bottom: '2rem', right: '1rem', left: '5rem', xoverflow: 'hidden'}}>
      <div  ref={scaledContent}
        className='ship-panel__instrumentation'
        style={{ 
          position: 'absolute',
          margin: 'auto', 
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          maxWidth: '80rem'
        }}
      >
        <table className={`ship-panel__ship-stats ${!ship.onBoard ? 'text-muted' : ''}`}
          style={{
            marginBottom: '4rem'
          }}
          >
          <tbody className='text-info'>
            <tr className='visible-medium' >
              <td style={{ padding: 0, overflow: 'visible' }}>
                <NavigationInstrumentation ship={ship} cmdrStatus={cmdrStatus} />
              </td>
              <td style={{ padding: 0, overflow: 'visible' }}>
                <PowerDistribution ship={ship} />
              </td>
            </tr>
          </tbody>
        </table>

        <table className={`ship-panel__ship-stats ${!ship.onBoard ? 'text-muted' : ''}`}>
          <tbody className='text-info'>
            <tr className='hidden-medium' >
              <td rowSpan={4} style={{ padding: 0, overflow: 'visible' }}>
                <NavigationInstrumentation ship={ship} cmdrStatus={cmdrStatus} />
              </td>
            </tr>
            <tr>
              <td>
                <span className='text-muted'>Max jump dist</span>
                <span className={`value ${!ship.onBoard ? 'text-muted' : ''}`}>{ship.maxJumpRange || '-'} Ly</span>
              </td>
              <td>
                <span className='text-muted'>Fuel reservoir</span>
                <span className={`value ${!ship.onBoard ? 'text-muted' : ''}`}>{typeof ship?.fuelReservoir === 'number' ? <>{ship.fuelReservoir} T</>: '-'}</span>
              </td>
              <td className='hidden-medium' rowSpan={4} style={{ padding: 0, overflow: 'visible' }}>
                <PowerDistribution ship={ship} />
              </td>
            </tr>
            <tr>
              <td>
                <span className='text-muted'>Total mass</span>
                <span className={`value ${!ship.onBoard ? 'text-muted' : ''}`}>{ship.mass} T</span>
              </td>
              <td>
                <span className='text-muted'>
                  Fuel {ship?.onBoard == true && <>{ship?.fuelLevel ?? 0}/{ship?.fuelCapacity ?? 0} T</>}
                </span>
                <span className='value'>
                  <progress
                    style={{ margin: '.25rem 0 0 0', height: '1.5rem', display: 'inline-block', width: '10rem', opacity: ship.onBoard ? 1 : 0.5 }}
                    value={ship?.fuelLevel ?? 0}
                    max={ship?.fuelCapacity ?? 0}
                    className={`progress--border ${ship.onBoard && cmdrStatus?.flags?.lowFuel ? 'progress--danger' : 'progress--info'}`}
                  />
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <span className='text-muted'>Targeting mode</span>
                <h3 className={`value ${!ship.onBoard ? 'text-muted' : ''}`} style={{ padding: '.25rem 0', height: '1.5rem' }}>
                  {ship.onBoard && (cmdrStatus?.flags?.hudInAnalysisMode === true) && <span className='text-secondary'>Analysis</span>}
                  {ship.onBoard && (cmdrStatus?.flags?.hudInAnalysisMode === false) && <span className='text-danger'>Combat</span>}
                  {(!ship.onBoard || !cmdrStatus) && '-'}
                </h3>
              </td>
              <td>
                <span className='text-muted'>
                  Cargo {ship?.onBoard == true && <>{ship?.cargo?.countl ?? 0}/{ship?.cargo?.capacity ?? 0} T</>}
                </span>
                <span className='value'>
                  {typeof ship?.cargo?.count === 'number'
                    ? <progress
                        style={{ margin: '.25rem 0 0 0', height: '1.5rem', display: 'inline-block', width: '10rem', opacity: ship.onBoard ? 1 : 0.5 }}
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

        <div className={`${!ship.onBoard ? 'text-muted' : ''}`} style={{ position: 'relative', height: '2rem', marginTop: '.75rem' }}>
          <div style={{
            display: 'none',
            borderTop: '.2rem solid var(--color-info)',
            position: 'absolute',
            top: '2rem',
            left: '.5rem',
            left: '6rem',
            right: '6rem',
            height: '2rem',
            opacity: '.25'
          }}
          />
        </div>
        <table className={`table--layout ${!ship.onBoard ? 'text-muted' : ''}`} style={{ marginBottom: '1rem' }}>
          <tbody>
            <tr>
              <td>
                <label className='checkbox'>
                  <span className={`checkbox__text ${(!ship.onBoard || !toggleSwitches.lights) && 'text-muted'}`}>
                    Ship lights
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
                    Night vision
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
                    Cargo hatch
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
                    Landing gear
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
                  <span className={`checkbox__text ${(!ship.onBoard || !toggleSwitches.hardpoints || cmdrStatus?.flags?.supercruise) ? 'text-muted' : ''}`}>
                    Hard points
                  </span>
                  <input
                    type='checkbox'
                    checked={ship.onBoard && cmdrStatus?.flags?.supercruise === false && toggleSwitches?.hardpoints}
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
                  <span className='ship-panel__light-text'>Low altitude</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.lowFuel ? 'ship-panel__light--danger' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Low fuel</span>
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.fsdMassLocked ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Mass locked</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.fsdCooldown ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>FSD cooldown</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && (cmdrStatus?.flags?.supercruise && !cmdrStatus?.flags?.fsdJump) ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Supercruise</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && (cmdrStatus?.flags?.fsdCharging && !cmdrStatus?.flags?.fsdJump) ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>FSD charging</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.fsdJump ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>FSD jumping</span>
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
                  <span className='ship-panel__light-text'>Flight assist off</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.glideMode ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Glide mode</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.silentRunning ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Silent running</span>
                </span>
              </td>
              <td>
                <span className={ship.onBoard && cmdrStatus?.flags?.scoopingFuel ? 'ship-panel__light--on' : 'ship-panel__light--off'}>
                  <span className='ship-panel__light-text'>Fuel scooping</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NavigationInstrumentation ({ ship, cmdrStatus }) {
  return (
    <div className='ship-panel__navigation-instrumentation text-uppercase'>
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        display: 'block',
        height: '100%',
        maxHeight: '12rem',
        maxWidth: '12rem',
        margin: 'auto',
        aspectRatio: '1'
      }}
      >
        <div style={{
          border: '.4rem solid var(--color-info)',
          borderRadius: '100rem',
          Xbackground: 'red',
          position: 'absolute',
          bottom: '-5.75rem',
          left: '-5%',
          width: '100%',
          aspectRatio: '1/1',
          transform: 'rotateX(250deg)',
          opacity: '.5'
        }}
        />
        <div style={{
          border: '.4rem solid var(--color-info)',
          borderRadius: '100rem',
          Xbackground: 'red',
          position: 'absolute',
          bottom: '-8rem',
          left: '-15%',
          xleft: 0,
          xright: 0,
          width: '120%',
          aspectRatio: '1/1',
          transform: 'rotateX(250deg)',
          opacity: '.25'
        }}
        />
      </div>
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        display: 'block',
        height: '100%',
        maxHeight: '12rem',
        maxWidth: '12rem',
        margin: 'auto',
        aspectRatio: '1',
        border: '.5rem double var(--color-info)',
        transform: `rotate(${ship.onBoard ? cmdrStatus?.heading ?? 0 : 0}deg)`,
        opacity: (ship.onBoard && typeof cmdrStatus?.heading === 'number') ? 1 : '.5',
        borderRadius: '100rem',
        transition: 'opacity .25s ease-in-out',
        zIndex: 100
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
          boxShadow: '0 0 .5rem var(--color-info), 0 0 .25rem var(--color-secondary)',
          display: ship.onBoard && typeof cmdrStatus?.heading === 'number' ? ' block' : 'none'
        }}
        />
      </div>
      <div style={{
        display: 'block',
        maxHeight: '12rem',
        maxWidth: '12rem',
        margin: 'auto',
        aspectRatio: '1/1',
        border: '.5rem double transparent',
        borderRadius: '100rem'
      }}
      >
        <div style={{
          position: 'relative',
          top: '0',
          left: '0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          height: '100%',
          minHeight: '12rem',
          minWidth: '12rem',
          opacity: ship.onBoard ? 1 : 0.5,
          background: 'linear-gradient(transparent 30%, var(--color-background-panel-translucent) 90%)',
          boxShadow: (ship.onBoard && typeof cmdrStatus?.heading === 'number') ? 'inset 0 0 .5rem var(--color-info), 0 0 1.75rem var(--color-secondary), inset 0 0 1.5rem var(--color-secondary)' : '',
          borderRadius: '100rem',
          backdropFilter: 'blur(.15rem)'
        }}
        >
          <div style={{
            position: 'absolute',
            top: '-.25rem',
            left: '0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            height: '100%',
            opacity: ship.onBoard ? 1 : 0.5
          }}
          />
          <h5 className='text-muted' style={{ margin: '0 0 .25rem 0' }}>
            PLANETARY<br />APPROACH SUITE
          </h5>
          <h2 style={{ padding: 0, margin: '0 0 .1rem 0' }}>
            <span className='value'>{ship.onBoard ? cmdrStatus?.heading ?? '-' : '-'}°</span>
          </h2>
          <p style={{ padding: 0, margin: '.1rem 0' }}>
            <span className='text-muted'>LAT</span>
            {' '}
            <span className='value'>{ship.onBoard ? cmdrStatus?.latitude ?? '-' : '-'}°</span>
          </p>
          <p style={{ padding: 0, margin: '.1rem 0' }}>
            <span className='text-muted'>LON</span>
            {' '}
            <span className='value'>{ship.onBoard ? cmdrStatus?.longitude ?? '-' : '-'}°</span>
          </p>
          <p style={{ padding: 0, margin: '.1rem 0 0 0' }}>
            <span className='text-muted'>ALT</span>
            {' '}
            <span className='value'>{(ship.onBoard && cmdrStatus?.altitude)
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
    <div className='ship-panel__ship-pips'>
      <div
        className='hidden-medium'
        style={{
          border: '.2rem solid var(--color-info)',
          borderBottom: 'none',
          position: 'absolute',
          top: '-.5rem',
          left: '1.75rem',
          right: '.25rem',
          height: '2rem',
          opacity: '.25'
        }}
      />
      <h4 className='text-center text-muted' style={{ marginBottom: '1.5rem', marginLeft: '1.5rem' }}>PWR Distribution</h4>
      <div className='text-uppercase'>
        <div className='ship-panel__ship-pip'>
          <progress className={ship.onBoard ? 'progress--gradient' : ''} value={ship.onBoard ? ship?.pips?.systems : 0} max={8} />
          <label className={(ship.onBoard && ship?.pips?.systems) > 0 ? 'text-primary' : 'text-primary text-muted'}>SYS</label>
        </div>
        <div className='ship-panel__ship-pip'>
          <progress className={ship.onBoard ? 'progress--gradient' : ''} value={ship.onBoard ? ship?.pips?.engines : 0} max={8} />
          <label className={(ship.onBoard && ship?.pips?.engines > 0) ? 'text-primary' : 'text-primary text-muted'}>ENG</label>
        </div>
        <div className='ship-panel__ship-pip'>
          <progress className={ship.onBoard ? 'progress--gradient' : ''} value={ship.onBoard ? ship?.pips?.weapons : 0} max={8} />
          <label className={(ship.onBoard && ship?.pips?.weapons > 0) ? 'text-primary' : 'text-primary text-muted'}>WEP</label>
        </div>
      </div>
    </div>
  )
}
