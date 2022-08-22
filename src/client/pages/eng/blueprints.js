import { useState, useEffect } from 'react'
import animateTableEffect from 'lib/animate-table-effect'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { UNKNOWN_VALUE } from '../../../shared/consts'
import distance from '../../../shared/distance'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { EngineeringPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'
import CopyOnClick from 'components/copy-on-click'

export default function EngineeringMaterialsPage () {
  const router = useRouter()
  const { query } = router
  const { connected, active, ready } = useSocket()
  const [currentSystem, setCurrentSystem] = useState()
  const [blueprints, setBlueprints] = useState()
  const [componentReady, setComponentReady] = useState(false)
  const [blueprintsApplied, setBlueprintsApplied] = useState()
  const [blueprintsNotApplied, setBlueprintsNotApplied] = useState()
  const [selectedBlueprint, setSelectedBlueprint] = useState()

  useEffect(animateTableEffect)
  
  useEffect(async () => {
    if (!connected || !router.isReady) return

    if (!blueprints) {
      const newBlueprints = await sendEvent('getBlueprints')
      setBlueprints(newBlueprints)
      setBlueprintsApplied(newBlueprints.filter(b => b.appliedToModules.length > 0))
      setBlueprintsNotApplied(newBlueprints.filter(b => b.appliedToModules.length === 0))
    }
    const newSystem = await sendEvent('getSystem')
    if (newSystem?.address) setCurrentSystem(newSystem)
    setComponentReady(true)
  }, [connected, router.isReady, query])

  useEffect(async () => {
    if (!blueprints) return
    const newSelectedBlueprint = (query?.symbol && query?.symbol.trim() !== '')
      ? blueprints?.filter(blueprint => query?.symbol.toLowerCase() === blueprint.symbol.toLowerCase())?.[0] ?? null
      : null
    setSelectedBlueprint(newSelectedBlueprint)
    const newSystem = await sendEvent('getSystem')
    if (newSystem?.address) setCurrentSystem(newSystem)
  }, [blueprints, query])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Materials', 'MaterialCollected', 'MaterialDiscarded', 'MaterialTrade', 'EngineerCraft'].includes(log.event)) {
      const newBlueprints = await sendEvent('getBlueprints')
      setBlueprints(newBlueprints)
      setBlueprintsApplied(newBlueprints.filter(b => b.appliedToModules.length > 0))
      setBlueprintsNotApplied(newBlueprints.filter(b => b.appliedToModules.length === 0))
    }
    if (['Location', 'FSDJump'].includes(log.event)) {
      const newSystem = await sendEvent('getSystem')
      if (newSystem?.address) setCurrentSystem(newSystem)
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
          <h2>Blueprints</h2>
          <h3 className='text-primary'>Ship &amp; equipment modifications</h3>

          <p className='text-primary'>
            Blueprints can be used to improve ships and equipment
          </p>

          {blueprintsApplied && blueprintsApplied.length > 0 &&
            <>
              <div className='section-heading'>
                <h4 className='section-heading__text' style={{ marginTop: '1rem' }}>Applied Blueprints</h4>
              </div>
              <p className='text-primary'>
                Equipment on your current ship that has been modified using Blueprints
              </p>
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
                      <td
                        className='text-center text-info'
                        style={{ width: '1rem' }}
                      >
                        <i
                          className='icon icarus-terminal-wrench'
                          style={{ position: 'relative', top: '.15rem' }}
                        />
                      </td>
                      <td>
                        <h4>{blueprint.name}</h4>
                        <h4 className='text-muted visible-medium'>{blueprint.originalName}</h4>
                      </td>
                      <td className='text-right hidden-medium'>
                        <h4 className='text-muted'>{blueprint.originalName}</h4>
                      </td>
                      <td className='text-center' style={{ width: '1rem' }}>
                        <i className='icon icarus-terminal-chevron-right' style={{ fontSize: '1rem' }} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className='section-heading'>
                <h4 className='section-heading__text' style={{ marginTop: '1rem' }}>Other Blueprints</h4>
              </div>
            </>}
          {blueprintsApplied && blueprintsApplied.length === 0 &&
            <div className='section-heading'>
              <h4 className='section-heading__text' style={{ marginTop: '1rem' }}>Blueprints</h4>
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
                    <td
                      className='text-center text-primary'
                      style={{ width: '1rem' }}
                    >
                      <i
                        className='icon icarus-terminal-wrench'
                        style={{ position: 'relative', top: '.15rem' }}
                      />
                    </td>
                    <td>
                      <h4>{blueprint.name}</h4>
                      <h4 className='text-muted visible-medium'>{blueprint.originalName}</h4>
                    </td>
                    <td className='text-right hidden-medium'>
                      <h4 className='text-muted'>{blueprint.originalName}</h4>
                    </td>
                    <td className='text-center' style={{ width: '1rem' }}>
                      <i className='icon icarus-terminal-chevron-right' style={{ fontSize: '1rem' }} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>}
        </Panel>}
      {selectedBlueprint &&
        <Panel layout='full-width' scrollable navigation={EngineeringPanelNavItems('Blueprints')}>
          <p style={{ marginTop: 0, marginBottom: '1rem' }}>
            <Link href='/eng/blueprints'>
              <a className='text-link text-uppercase'><span className='text-link-text'>Blueprints</span></a>
            </Link>
            <span className='text-link text-uppercase text-muted'>
              <i className='icon icarus-terminal-chevron-right' style={{ fontSize: '1rem' }} />
              {selectedBlueprint.name}
            </span>
          </p>
          <h2>{selectedBlueprint.name}</h2>
          <h3 className='text-primary'>{selectedBlueprint.originalName}</h3>
          {selectedBlueprint.appliedToModules.length > 0 &&
            <>
              <div className='section-heading'>
                <h4 className='section-heading__text' style={{ marginTop: '1rem' }}>Engineered equipment</h4>
              </div>
              <p className='text-primary'>
                Equipment on your current ship that has been modified using this Blueprint
              </p>
              <table className='table--animated'>
                <tbody className='fx-fade-in'>
                  {selectedBlueprint.appliedToModules.map(module => (
                    <tr
                      key={`engineering_${module.engineering.symbol}_applied-to_${module.name}_slot_${module.slot}`}
                      className='table__row--highlighted'
                    >
                      <td
                        className='text-center text-info'
                        style={{ width: '1rem' }}
                      >
                        <i
                          className='icon icarus-terminal-wrench'
                          style={{ position: 'relative', top: '.15rem' }}
                        />
                      </td>
                      <td>
                        <span className='text-info'>{module.class}{module.rating} {module.name}</span>
                        <span className='visible-medium'><br />{module.slotName}</span>
                      </td>
                      <td className='hidden-medium text-no-wrap' style={{ width: '12rem' }}>
                        <span>{module.slotName}</span>
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
              <div className='section-heading'>
                <h4 className='section-heading__text' style={{ marginTop: '1rem' }}>Engineered equipment</h4>
              </div>
              <p className='text-muted text-primary'>Blueprint not applied to any currently fitted equipment</p>
            </>}

          <div className='section-heading'>
            <h4 className='section-heading__text' style={{ marginTop: '1rem' }}>Engineers</h4>
          </div>
          <p className='text-primary'>
            Engineers who know how to apply or upgrade this Blueprint
          </p>
          <table className='table--animated' style={{ tableLayout: 'fixed' }}>
            <tbody className='fx-fade-in'>
              {Object.keys(selectedBlueprint?.engineers ?? []).map(engineer => (
                <tr key={`engineer_${engineer}`}>
                  <td
                    className={`text-center ${selectedBlueprint?.engineers[engineer]?.rank === 0 ? 'text-info text-muted' : 'text-info'}`}
                    style={{ width: '1rem' }}
                  >
                    <i
                      className='icon icarus-terminal-engineer'
                      style={{ position: 'relative', top: '.15rem' }}
                    />
                  </td>
                  <td>
                    <span className={selectedBlueprint?.engineers[engineer]?.rank === 0 ? 'text-info text-muted' : 'text-info'}>
                      <CopyOnClick>{engineer}</CopyOnClick>
                      <span className='visible-medium text-primary'>
                        <br />
                        {
                            Math.min(...selectedBlueprint?.engineers?.[engineer]?.grades) !== Math.max(...selectedBlueprint?.engineers?.[engineer]?.grades) &&
                            `Grade ${Math.min(...selectedBlueprint?.engineers?.[engineer]?.grades)} — ${Math.max(...selectedBlueprint?.engineers?.[engineer]?.grades)}`
                          }
                        {
                            Math.min(...selectedBlueprint?.engineers?.[engineer]?.grades) === Math.max(...selectedBlueprint?.engineers?.[engineer]?.grades) &&
                            `Grade ${Math.min(...selectedBlueprint?.engineers?.[engineer]?.grades)}`
                          }
                      </span>
                    </span>
                  </td>
                  <td className='text-right hidden-medium'>
                    <span className={selectedBlueprint?.engineers[engineer]?.rank === 0 ? 'text-primary text-muted' : 'text-primary'}>
                      {
                        Math.min(...selectedBlueprint?.engineers?.[engineer]?.grades) !== Math.max(...selectedBlueprint?.engineers?.[engineer]?.grades) &&
                        `Grade ${Math.min(...selectedBlueprint?.engineers?.[engineer]?.grades)} — ${Math.max(...selectedBlueprint?.engineers?.[engineer]?.grades)}`
                      }
                      {
                        Math.min(...selectedBlueprint?.engineers?.[engineer]?.grades) === Math.max(...selectedBlueprint?.engineers?.[engineer]?.grades) &&
                        `Grade ${Math.min(...selectedBlueprint?.engineers?.[engineer]?.grades)}`
                      }
                    </span>
                  </td>
                  <td>
                    {selectedBlueprint?.engineers[engineer]?.rank === 0 && <>
                      {selectedBlueprint?.engineers[engineer]?.progress === UNKNOWN_VALUE
                        ? <span className='text-danger text-muted'>Locked</span>
                        : <span className='text-info text-muted'>{selectedBlueprint?.engineers[engineer]?.progress}</span>}
                    </>}
                    {selectedBlueprint?.engineers[engineer]?.rank > 0 && <span className='text-secondary'> Grade {selectedBlueprint?.engineers[engineer]?.rank} Unlocked</span>}
                  </td>
                  <td className='text-right'>
                    <span className='text-right'>
                      <CopyOnClick>{selectedBlueprint?.engineers[engineer]?.system}</CopyOnClick>
                    </span>
                    {(currentSystem?.position && selectedBlueprint?.engineers[engineer]?.location) &&
                      <span className='text-muted text-no-transform'>
                        <span className='visible-medium'><br /></span>
                        {' '}
                        {distance(currentSystem.position, selectedBlueprint?.engineers[engineer]?.location).toLocaleString(undefined, { maximumFractionDigits: 0 })} Ly
                      </span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {Object.keys(selectedBlueprint.grades).map(grade =>
            <div className='engineering__blueprint-grade' style={{ position: 'relative' }} key={`${selectedBlueprint.symbol}_${grade}_materials`}>

              <div className='section-heading' style={{ marginTop: '1rem' }}>
                <h4 className='section-heading__text'>Grade {parseInt(grade) + 1}</h4>
                <h4 className='text-info text-muted float-right' style={{ marginTop: '.5rem' }}>Cost / Inventory</h4>
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
              <div className='engineering__blueprint-features text-uppercase'>
                {Object.entries(selectedBlueprint.grades[grade]?.features).map(([k, v]) => {
                  if (!v.improvement) return null
                  return (
                    <p key={`feature_${k}_${v}`} className='text-success'>
                      <i className='icon icarus-terminal-chevron-up' style={{ marginRight: '.2rem', position: 'relative', top: '.1rem' }} />
                      {k}
                      <span className='float-right'>
                        {v.value[0] === v.value[1] && <>{v.value[0] >= 0 && '+'}{v.value[0]}</>}
                        {v.value[0] !== v.value[1] && <>{v.value[0] !== 0 && <>{v.value[0] >= 0 && '+'}{v.value[0]} <span className='text-info text-muted'>—</span></>} {v.value[1] >= 0 && '+'}{v.value[1]}</>}
                      </span>
                    </p>
                  )
                })}
                {Object.entries(selectedBlueprint.grades[grade]?.features).map(([k, v]) => {
                  if (v.improvement) return null
                  return (
                    <p key={`feature_${k}_${v}`} className='text-danger'>
                      <i className='icon icarus-terminal-chevron-down' style={{ marginRight: '.2rem', position: 'relative', top: '.1rem' }} />
                      {k}
                      <span className='float-right'>
                        {v.value[0] === v.value[1] && <>{v.value[0] >= 0 && '+'}{v.value[0]}</>}
                        {v.value[0] !== v.value[1] && <>{v.value[0] !== 0 && <>{v.value[0] >= 0 && '+'}{v.value[0]} <span className='text-info text-muted'>—</span></>} {v.value[1] >= 0 && '+'}{v.value[1]}</>}
                      </span>
                    </p>
                  )
                })}
              </div>
              <div className='engineering__blueprint-components'>
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
                          className={component.count > 0 ? 'text-primary' : 'text-muted text-danger'}
                        >
                          <td className='text-center' style={{ background: 'var(--color-primary-dark)', width: '1rem' }}>
                            <i className={`icon icarus-terminal-materials-grade-${component.grade}`} style={{ fontSize: '2.5rem' }} />
                          </td>
                          <td style={{ background: 'var(--color-primary-dark)' }}>
                            <CopyOnClick>{component.name}</CopyOnClick>
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
