
export default function ShipModuleInspectorPanel ({ module }) {
  if (!module) return (<div className='ship-panel__module-inspector ship-panel__module-inspector--hidden' />)

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
    .replace(/int_/, '').replace(/_size(.*?)$/g, ' ').replace(/_/g, ' ') // Fallback for other unsupported modules

  return (
    <div
      className='ship-panel__module-inspector scrollable'
      data-module-slot={module?.slot}
      onClick={(e) => e.preventDefault()}
    >
      <button className='button--icon button__close-button'>
        <i className='icon icarus-terminal-chevron-down' />
      </button>
      <div className='ship-panel__module-section text-uppercase'>
        <h2 className='text-info' data-module-name={module.name} data-fx-order='3'>
          {size} {module.mount} {moduleName}
        </h2>
        <h3 className='text-no-wrap'>
          {module.class}{module.rating} <span className='text-muted'>Class Rating</span>
        </h3>
        <div className='text-primary'>
          <p className='text-no-wrap '>{slotName}</p>
          {module?.power > 0 &&
            <p className='text-no-wrap'>
              <span className='text-muted'>Power</span> {parseFloat(module.power).toFixed(2)} MW
            </p>}
          {module.ammoInHopper && module.ammoInClip &&
            <p className='text-no-wrap'>
              <span className='text-muted'>Ammo (Clip/Hopper)</span> {module.ammoInClip}/{module.ammoInHopper}
            </p>}
        </div>
      </div>
      {module.engineering &&
        <div className='ship-panel__module-section ship-panel__module-section--engineering text-uppercase'>
            <h3>Engineering</h3>
            <p className='text-secondary'>
              {module.engineering?.BlueprintName?.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim()}
              {' '}
              {module.engineering?.ExperimentalEffect_Localised &&
                <>
                  <br />
                  <span className='text-secondary'>{module.engineering.ExperimentalEffect_Localised.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim()}</span>
                  {' '}
                  <span className='text-muted'>experimental</span>
                </>}
              <br /><span className='text-muted'>by</span> {module.engineering.Engineer}
            </p>
            <progress
              className='progress--secondary progress--border'
              value={module.engineeringLevel}
              max='5'
              />
            {/* <p className='text-info' style={{ margin: 0, fontSize: '2rem', top: '.25rem', position: 'relative' }}>
              {[...Array(module.engineeringLevel)].map((j, i) =>
                <i
                  key={`${module.name}_${module.slot}_engineering_${i}`}
                  className='icon icarus-terminal-engineering'
                />
              )}
            </p> */}
        </div>}
      {module.engineering &&
        <div className='ship-panel__module-section ship-panel__module-section--engineering text-uppercase'>
          <ul>
            {module.engineering?.Modifiers?.map((modifier) =>
              <li
                key={`${module.name}_${module.slot}_engineering_modifier_${modifier.Label}`}
                className='text-secondary'
              >
                {modifier.Label.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim()}
                <span style={{ marginLeft: '.5rem' }}>
                  {(modifier.LessIsGood === 0 && modifier.Value > modifier.OriginalValue) && <><span className='text-success'>+{(modifier.Value - modifier.OriginalValue).toFixed(2).replace(/\.00$/, '').replace(/0$/, '')}</span></>}
                  {(modifier.LessIsGood === 0 && modifier.Value < modifier.OriginalValue) && <><span className='text-danger'>-{(modifier.OriginalValue - modifier.Value).toFixed(2).replace(/\.00$/, '').replace(/0$/, '')}</span></>}
                  {(modifier.LessIsGood === 1 && modifier.Value < modifier.OriginalValue) && <><span className='text-success'>-{(modifier.OriginalValue - modifier.Value).toFixed(2).replace(/\.00$/, '').replace(/0$/, '')}</span></>}
                  {(modifier.LessIsGood === 1 && modifier.Value > modifier.OriginalValue) && <><span className='text-danger'>+{(modifier.Value - modifier.OriginalValue).toFixed(2).replace(/\.00$/, '').replace(/0$/, '')}</span></>}
                </span>
              </li>
            )}
          </ul>
        </div>}
    </div>
  )
}
