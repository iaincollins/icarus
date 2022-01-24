import { useState, useEffect } from 'react'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { EngineeringPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'

export default function EngineeringMaterialsPage () {
  const { connected, active, ready } = useSocket()
  const [blueprints, setBlueprints] = useState()
  const [materials, setMaterials] = useState()
  const [componentReady, setComponentReady] = useState(false)
  const [blueprintNameFilter, setBlueprintNameFilter] = useState()
  const [selectedBlueprintName, setSelectedBlueprintName] = useState()

  useEffect(async () => {
    if (!connected) return
    setBlueprints(await sendEvent('getBlueprints'))
    setMaterials(await sendEvent('getMaterials'))
    setComponentReady(true)
  }, [connected, ready])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Materials', 'MaterialCollected', 'MaterialDiscarded'].includes(log.event)) {
      setMaterials(await sendEvent('getMaterials'))
    }
  }), [])

  let blueprintsToDisplay = blueprints
  if (blueprints && blueprintNameFilter)
    blueprintsToDisplay = blueprints.filter(blueprint => blueprint.name.toLowerCase() === blueprintNameFilter.toLowerCase())
  
  return (
    <Layout connected={connected} active={active} ready={ready} loader={!componentReady}>
      <Panel layout='full-width' scrollable navigation={EngineeringPanelNavItems('Blueprints')}>
        <h2>Engineering Blueprints</h2>
        <h3 className='text-primary'>Ship weapons and module modification</h3>
        <hr style={{ margin: '1rem 0 0 0' }} />
        {blueprints && materials &&
          <table className='table--interactive'>
            <tbody>
              {blueprintsToDisplay.map(blueprint =>
                <tr key={`blueprint_${blueprint.name}_${blueprint.modules.join(', ')}`}>
                  <td onClick={() => {
                    setSelectedBlueprintName(blueprint.name)
                  }}>
                    <h2 className='text-info'>{blueprint.name}</h2>
                    <h3 className='text-primary'>{blueprint.shortName}</h3>
                    <div style={{maxHeight: (blueprint.name === selectedBlueprintName) ? '20rem' : '0', overflow: 'hidden', transition: 'all .5s ease-in-out'}}>
                      <ul>
                        {Object.keys(blueprint.grades).map(grade =>
                          <li key={`blueprint_${blueprint.name}_grade_${grade}`}>
                            <span className='text-info text-muted'>
                              Grade {blueprint.grades[grade].grade}
                            </span>
                            <ul>
                              {Object.keys(blueprint.grades[grade].components).map(component => {
                                const material = materials.filter(m => m.name === component)?.[0] ?? 0
                                const count = material.count
                                return (
                                  <li
                                    key={`blueprint_${blueprint.name}_grade_${grade}_component_${component}`}
                                    className={count > 0 ? 'text-primary' : 'text-muted'}
                                  >
                                    {component} ({blueprint.grades[grade].components[component]}/{count})
                                  </li>
                                )
                              })}
                            </ul>
                          </li>
                        )}
                      </ul>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>}
          {blueprintNameFilter && blueprintNameFilter.trim() !== '' && 
            <p className='text-link text-primary text-center' onClick={() => setBlueprintNameFilter('')}>
                <span className='text-link-text'>List all Blueprints</span>
            </p>}
      </Panel>
    </Layout>
  )
}
