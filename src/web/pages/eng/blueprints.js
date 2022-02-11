import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { EngineeringPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'

export default function EngineeringMaterialsPage () {
  const router = useRouter()
  const { query } = router
  const { connected, active, ready } = useSocket()
  const [blueprints, setBlueprints] = useState()
  const [componentReady, setComponentReady] = useState(false)
  const [blueprintsApplied, setBlueprintsApplied] = useState()
  const [blueprintsNotApplied, setBlueprintsNotApplied] = useState()
  const [selectedBlueprint, setSelectedBlueprint] = useState()

  useEffect(async () => {
    if (!connected) return
    if (!router.isReady) return
    if (!blueprints) {
      const newBlueprints = await sendEvent('getBlueprints')
      setBlueprints(newBlueprints)
      setBlueprintsApplied(newBlueprints.filter(b => b.appliedToModules.length > 0))
      setBlueprintsNotApplied(newBlueprints.filter(b => b.appliedToModules.length === 0))
    }
    setComponentReady(true)
  }, [connected, router.isReady, query])

  useEffect(async () => {
    if (!blueprints) return
    const newSelectedBlueprint = (query?.symbol && query?.symbol.trim() !== '')
      ? blueprints?.filter(blueprint => query?.symbol.toLowerCase() === blueprint.symbol.toLowerCase())?.[0] ?? null
      : null
    setSelectedBlueprint(newSelectedBlueprint)
  }, [blueprints, query])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Materials', 'MaterialCollected', 'MaterialDiscarded', 'MaterialTrade', 'EngineerCraft'].includes(log.event)) {
      const newBlueprints = await sendEvent('getBlueprints')
      setBlueprints(newBlueprints)
      setBlueprintsApplied(newBlueprints.filter(b => b.appliedToModules.length > 0))
      setBlueprintsNotApplied(newBlueprints.filter(b => b.appliedToModules.length === 0))
    }
  }), [])

  useEffect(() => eventListener('gameStateChange', async () => {
    const newBlueprints = await sendEvent('getBlueprints')
    setBlueprints(newBlueprints)
    setBlueprintsApplied(newBlueprints.filter(b => b.appliedToModules.length > 0))
    setBlueprintsNotApplied(newBlueprints.filter(b => b.appliedToModules.length === 0))
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready} loader={!componentReady}>
      {!selectedBlueprint &&
        <Panel layout='full-width' scrollable navigation={EngineeringPanelNavItems('Blueprints')}>
          <h2>Engineering Blueprints</h2>
          <h3 className='text-primary'>Ship weapons and module modification</h3>

          {blueprintsApplied && blueprintsApplied.length > 0 &&
            <>
              <div className='tabs'>
                <h4 className='tab' style={{ marginTop: '1rem' }}>Applied Blueprints</h4>
              </div>
              <table className='table--interactive table--animated'>
                <tbody className='fx-fade-in'>
                  {blueprintsApplied.map(blueprint =>
                    <tr
                      key={`blueprint_${blueprint.name}_${blueprint.modules.join(', ')}`}
                      tabIndex={2}
                      className='table__row--highlighted'
                      onFocus={() => {
                        router.push({ pathname: '/eng/blueprints', query: { symbol: blueprint.symbol } })
                      }}
                    >
                      <td>
                        <h4>{blueprint.name}</h4>
                        <h4 className='text-muted visible-medium'>{blueprint.originalName}</h4>
                      </td>
                      <td className='text-right hidden-medium'>
                        <h4 className='text-muted'>{blueprint.originalName}</h4>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className='tabs'>
                <h4 className='tab' style={{ marginTop: '1rem' }}>Other Blueprints</h4>
              </div>
            </>}
          {blueprintsApplied && blueprintsApplied.length === 0 &&
            <div className='tabs'>
              <h4 className='tab' style={{ marginTop: '1rem' }}>Blueprints</h4>
            </div>}
          {blueprintsNotApplied &&
            <table className='table--interactive table--animated'>
              <tbody>
                {blueprintsNotApplied.map(blueprint =>
                  <tr
                    key={`blueprint_${blueprint.name}_${blueprint.modules.join(', ')}`}
                    tabIndex={2}
                    className='table__row--highlight-primary-hover'
                    onFocus={() => {
                      router.push({ pathname: '/eng/blueprints', query: { symbol: blueprint.symbol } })
                    }}
                  >
                    <td>
                      <h4>{blueprint.name}</h4>
                      <h4 className='text-muted visible-medium'>{blueprint.originalName}</h4>
                    </td>
                    <td className='text-right hidden-medium'>
                      <h4 className='text-muted'>{blueprint.originalName}</h4>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>}
        </Panel>}
      {selectedBlueprint &&
        <Panel layout='full-width' scrollable navigation={EngineeringPanelNavItems('Blueprints')}>
          <h2>{selectedBlueprint.name}</h2>
          <h3 className='text-primary'>{selectedBlueprint.originalName}</h3>

          {selectedBlueprint.appliedToModules.length > 0 &&
            <>
              <div className='tabs'>
                <h4 className='tab' style={{ marginTop: '1rem' }}>Engineered Modules</h4>
              </div>
              <table className='table--animated'>
                <tbody className='fx-fade-in'>
                  {selectedBlueprint.appliedToModules.map(module => (
                    <tr
                      key={`engineering_${module.engineering.symbol}_applied-to_${module.name}_slot_${module.slot}`}
                      className='table__row--highlighted'
                    >
                      <td>
                        {module.class}{module.rating} {module.name}
                        <span className='visible-medium text-muted'><br />{module.slotName}</span>
                      </td>
                      <td className='hidden-medium'>
                        <span className='text-muted'>{module.slotName}</span>
                      </td>
                      <td className='text-info text-no-wrap' style={{ minWidth: '3rem' }}>
                        <span className='visible-medium' style={{ fontSize: '1.75rem', lineHeight: '1.75rem' }}>
                          <i className='icon icarus-terminal-engineering float-right' />
                          <span className='float-right' style={{ marginRight: '.25rem' }}>{module.engineering.level}</span>
                        </span>
                        <span className='hidden-medium float-right' style={{ height: '1.75rem' }}>
                          {[...Array(module.engineering.level)].map((j, i) =>
                            <i
                              style={{ fontSize: '1.75rem', lineHeight: '1.75rem', width: '1.75rem', display: 'inline-block', marginRight: '0.1rem' }}
                              key={`engineering_${module.engineering.symbol}_applied-to_${module.name}_slot_${module.slot}_engineering-grade_${i}`}
                              className='icon icarus-terminal-engineering'
                            />
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>}

          {selectedBlueprint.appliedToModules.length === 0 &&
            <>
              <div className='tabs'>
                <h4 className='tab' style={{ marginTop: '1rem' }}>Modules</h4>
              </div>
              <p className='text-muted text-primary'>Not applied to any equipped modules</p>
            </>}

          {Object.keys(selectedBlueprint.grades).map(grade =>
            <div style={{ position: 'relative' }} key={`${selectedBlueprint.symbol}_${grade}_materials`}>

              <div className='tabs' style={{ marginTop: '1rem' }}>
                <h4 className='tab'>Grade {parseInt(grade) + 1}</h4>
                <h4 className='text-info text-muted float-right'>Cost / Inventory</h4>
              </div>

              <h4 className='text-info hidden-medium' style={{ position: 'absolute', margin: '.5rem 0 0 0' }}>
                {[...Array(selectedBlueprint.grades[grade].grade)].map((j, i) =>
                  <i
                    style={{ fontSize: '2rem', width: '2rem', display: 'inline-block', marginRight: '0.1rem' }}
                    key={`${selectedBlueprint.symbol}_${grade}_engineering_${i}`}
                    className='icon icarus-terminal-engineering'
                  />
                )}
              </h4>
              <div className='engineering__blueprint-grade'>
                <table className='table--animated'>
                  {/*
                  <thead>
                    <tr>
                      <th className='text-left' colSpan={2}>Material</th>
                      <th>Cost</th>
                      <th>
                        <span className='text-muted'>Current</span>
                      </th>
                    </tr>
                  </thead>
                  */}
                  <tbody>
                    {selectedBlueprint.grades[grade].components.map(component => {
                      return (
                        <tr
                          key={`blueprint_${selectedBlueprint.name}_grade_${grade}_component_${component.name}`}
                          className={component.count > 0 ? 'text-primary' : 'text-muted'}
                        >
                          <td className='text-center' style={{ background: 'var(--color-primary-dark)', width: '1rem' }}>
                            <i className={`icon icarus-terminal-materials-grade-${component.grade}`} style={{ fontSize: '2.5rem' }} />
                          </td>
                          <td style={{ background: 'var(--color-primary-dark)' }}>
                            {component.name}
                            <div className='text-muted'>
                              {component.type}
                            </div>
                          </td>
                          <td className='text-right' style={{ width: '3rem' }}>{component.cost}</td>
                          <td className='text-right text-muted' style={{ width: '3rem' }}>{component.count}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Panel>}
    </Layout>
  )
}
