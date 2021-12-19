export default function ShipModules ({ name, modules, hardpoint, optional, selectedModule, setSelectedModule = () => {} }) {
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
