export default function ShipModuleInspectorPanel ({ module, setSelectedModule }) {
  if (!module) return (<div className='ship-panel__module-inspector ship-panel__module-inspector--hidden' />)

  let inspectorTitle = 'Optional Module'
  if (module.hardpoint) inspectorTitle = 'Hardpoint'
  if (module.utility) inspectorTitle = 'Utility'
  if (module.core) inspectorTitle = 'Core Module'

  return (
    <div className='inspector inspector--horizontal ship-panel__module-inspector'>
      <div className='inspector__title' onClick={() => { setSelectedModule(null) }}>
        <button className='inspector__close-button'>
          <i className='icon icarus-terminal-chevron-right' />
        </button>
        <h3>{inspectorTitle}</h3>
      </div>
      <div className='inspector__contents scrollable'>
        <div className='ship-panel__module-section text-uppercase'>
          <h2 className='text-info' data-module-name={module.name} data-fx-order='3'>
            {module.size !== 'tiny' ? module.size : ''} {module.mount} {module.name}
          </h2>
          <h3 className='text-no-wrap'>
            {module.class}{module.rating} <span className='text-muted'>{module.slotName}</span>
          </h3>
          <div className='text-primary'>
            {module?.power > 0 && <p><span className='text-muted'>Power</span> {parseFloat(module.power).toFixed(2)} MW</p>}
            {(!module.passengers && module.ammoInHopper && module?.ammoInClip > 0) && <p><span className='text-muted'>Ammo (Clip/Hopper)</span> {module.ammoInClip}/{module.ammoInHopper}</p>}
            {module.passengers && <p><span className='text-muted'>Passengers</span> {module.passengers}</p>}
            {module?.mass > 0 && <p><span className='text-muted'>Mass</span> {module.mass} T</p>}
            {/* <table className='table--layout'>
              <tbody>
                <tr>
                  <td>{module?.power > 0 && <><span className='text-muted'>Power</span> {parseFloat(module.power).toFixed(2)} MW</>}</td>
                  <td>{module?.mass > 0 && <><span className='text-muted'>Mass</span> {module.mass} T</>}</td>
                </tr>
                <tr>
                  <td>{(!module.passengers && module.ammoInHopper && module?.ammoInClip > 0) && <><span className='text-muted'>Ammo (Clip/Hopper)</span> {module.ammoInClip}/{module.ammoInHopper}</>}</td>
                  <td>{module.passengers && <><span className='text-muted'>Passengers</span> {module.passengers}</>}</td>
                </tr>
              </tbody>
            </table> */}
            {module.description &&
              <p className='text-primary text-muted'>
                {module.description}
              </p>}
          </div>
        </div>
        {module.engineering &&
          <>
            <div className='ship-panel__module-section ship-panel__module-section--engineering text-uppercase'>
              <h3 className='text-muted'>Engineering</h3>
              {true &&
                <div className='ship-panel__module-section--engineering-tab'>
                  <p className='text-primary'>
                    {module.engineering.name} <span className='text-muted'>engineering</span>
                    {module.engineering.experimentalEffect &&
                      <>
                        <br />
                        <span className='text-muted'>experimental</span>
                        <span> {module.engineering.experimentalEffect}</span>
                      </>}
                    <br /><span className='text-muted'>by</span> {module.engineering.engineer}
                  </p>
                  <p style={{ margin: 0, fontSize: '2rem', top: '.25rem', position: 'relative' }}>
                    {[...Array(module.engineering.level)].map((j, i) =>
                      <i
                        key={`${module.name}_${module.slot}_engineering_${i}`}
                        className='icon icarus-terminal-engineering'
                      />
                    )}
                  </p>
                </div>}
            </div>
            <div className='ship-panel__module-section ship-panel__module-section--engineering text-uppercase'>
              {true &&
                <div className='ship-panel__module-section--engineering-tab'>
                  <ul>
                    {module.engineering.modifiers.map(modifier =>
                      <li
                        key={`${module.name}_${module.slot}_engineering_modifier_${modifier.name}`}
                        className='text-primary'
                      >
                        {modifier.name}
                        <span style={{ marginLeft: '.5rem' }}>
                          <span className={modifier.improvement ? 'text-success' : 'text-danger'}>{modifier.difference}</span>
                        </span>
                      </li>
                    )}
                  </ul>
                </div>}
            </div>
          </>}
      </div>
    </div>
  )
}
