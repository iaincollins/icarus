import { useState, useEffect } from 'react'
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
  const [materials, setMaterials] = useState()
  const [componentReady, setComponentReady] = useState(false)
  const [blueprintSymbolFilter, setBlueprintSymbolFilter] = useState()

  useEffect(async () => {
    if (!connected) return
    if (!router.isReady) return
    if (!blueprints) setBlueprints(await sendEvent('getBlueprints'))
    if (!materials) setMaterials(await sendEvent('getMaterials'))
    setComponentReady(true)
    setBlueprintSymbolFilter(query?.symbol ?? '')
  }, [connected, ready, router.isReady, query])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Materials', 'MaterialCollected', 'MaterialDiscarded'].includes(log.event)) {
      setMaterials(await sendEvent('getMaterials'))
    }
  }), [])
  
  return (
    <Layout connected={connected} active={active} ready={ready} loader={!componentReady}>
      <Panel layout='full-width' scrollable navigation={EngineeringPanelNavItems('Blueprints')}>
        <h2>Engineering Blueprints</h2>
        <h3 className='text-primary'>Ship weapons and module modification</h3>
        <hr style={{ margin: '1rem 0 0 0' }} />
        {blueprints && materials &&
          <table className={ (blueprintSymbolFilter && blueprintSymbolFilter.trim() !== '') ? '' : 'table--interactive table--animated'}>
            <tbody>
              {blueprints.map(blueprint =>
                (!blueprintSymbolFilter || (blueprintSymbolFilter.toLowerCase() === blueprint.symbol.toLowerCase()))
                  ? <tr key={`blueprint_${blueprint.name}_${blueprint.modules.join(', ')}`}>
                    <td onClick={() => {
                    router.push({ pathname: '/eng/blueprints', query: { symbol: blueprint.symbol }})
                    }}>
                      <h2 className='text-info'>{blueprint.name}</h2>
                      <h3 className='text-primary'>{blueprint.originalName}</h3>
                      { blueprintSymbolFilter && blueprintSymbolFilter.toLowerCase() === blueprint.symbol.toLowerCase() && 
                        <div>
                          {Object.keys(blueprint.grades).map(grade =>
                            <>
                              <h4 className='text-info' style={{margin: '1rem 0 0 0', fontSize: '2rem'}}>
                                {[...Array(blueprint.grades[grade].grade)].map((j, i) =>
                                  <i
                                    key={`${blueprint.symbol}_${grade}_engineering_${i}`}
                                    className='icon icarus-terminal-engineering'
                                  />
                                )}
                              </h4>
                              <hr style={{margin: 0}}/>
                              <table className='table--animated'>
                                <thead>
                                  <tr>
                                    <th className='text-left' colSpan={2}>Material</th>
                                    <th>Cost</th>
                                    <th>Current</th>
                                  </tr>
                                </thead>
                                <tbody>
                                {Object.keys(blueprint.grades[grade].components).map(component => {
                                  const material = materials.filter(m => m.name === component)?.[0] ?? 0
                                  const count = material.count
                                  return (
                                    <tr
                                      key={`blueprint_${blueprint.name}_grade_${grade}_component_${component}`}
                                      className={count > 0 ? 'text-primary' : 'text-muted'}
                                    >
                                      <td style={{background: 'var(--color-primary-dark)', width: '1rem', verticalAlign: 'middle'}}>
                                        <i className={`icon icarus-terminal-materials-grade-${material.grade}`} style={{fontSize: '2rem'}} />
                                      </td>
                                      <td style={{background: 'var(--color-primary-dark)', verticalAlign: 'middle'}}>
                                        {material.name}
                                      </td>
                                      <td className='text-right' style={{width: '4rem', verticalAlign: 'middle'}}>{blueprint.grades[grade].components[component]}</td>
                                      <td className='text-right' style={{width: '4rem', verticalAlign: 'middle'}}>{count}</td>
                                    </tr>
                                  )
                                })}
                                </tbody>
                              </table>
                              <hr style={{marginTop: 0, marginBottom: '2rem'}} className='small'/>
                            </>
                          )}
                        </div>}
                    </td>
                  </tr>
                : null
              )}
            </tbody>
          </table>}
          {blueprintSymbolFilter && blueprintSymbolFilter.trim() !== '' &&
            <p className='text-link text-primary text-center' style={{margin: '1rem 0'}} >
              <button onClick={() => router.push({ pathname: '/eng/blueprints', query: {} })}>List all Blueprints</button>
            </p>}
      </Panel>
    </Layout>
  )
}
