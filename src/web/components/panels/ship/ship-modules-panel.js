import ShipModules from './ship-modules'

export default function ShipModulesPanel ({ ship, selectedModule, setSelectedModule }) {
  if (!ship) return null

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
        <div className='ship-panel__ship-pips text-uppercase'>
          <div className='ship-panel__ship-pip'>
            <progress value={ship.onBoard ? ship?.pips?.systems : 0} max={8} />
            <label className={(ship.onBoard && ship?.pips?.systems) > 0 ? 'text-primary' : 'text-primary text-muted'}>Systems</label>
          </div>
          <div className='ship-panel__ship-pip'>
            <progress value={ship.onBoard ? ship?.pips?.engines : 0} max={8} />
            <label className={(ship.onBoard && ship?.pips?.engines > 0) ? 'text-primary' : 'text-primary text-muted'}>Engines</label>
          </div>
          <div className='ship-panel__ship-pip'>
            <progress value={ship.onBoard ? ship?.pips?.weapons : 0} max={8} />
            <label className={(ship.onBoard && ship?.pips?.weapons > 0) ? 'text-primary' : 'text-primary text-muted'}>Weapons</label>
          </div>
        </div>
        <table className='ship-panel__ship-stats'>
          <tbody className='text-info'>
            <tr>
              <td>
                <span className='text-muted'>Max jump range</span>
                <span className='value'>{ship.maxJumpRange} Ly</span>
              </td>
              <td>
                <span className='text-muted'>Fuel (curr/max)</span>
                <span className='value'>{ship.fuelLevel || '-'}/{ship.fuelCapacity} T</span>
              </td>
              <td>
                <span className='text-muted'>Cargo (curr/max)</span>
                <span className='value'>{ship.cargo.count || '-'}/{ship.cargo.capacity} T</span>
              </td>
            </tr>
            <tr>
              <td>
                <span className='text-muted'>Insurance Rebuy</span>
                <span className='value'>{ship.rebuy ? ship.rebuy.toLocaleString() : '-'} CR</span>
              </td>
              <td>
                <span className='text-muted'>Total mass</span>
                <span className='value'>{ship.mass} T</span>
              </td>
              <td>
                <span className='text-muted'>Power draw</span>
                <span className='value'>{ship.modulePowerDraw || '-'} MW</span>
              </td>
            </tr>
          </tbody>
        </table>
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
