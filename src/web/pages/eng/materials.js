import { useState, useEffect, Fragment } from 'react'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { EngineeringPanelNavItems } from 'lib/navigation-items'

export default function EngineeringMaterialsPage () {
  const { connected, active, ready } = useSocket()
  const [materials, setMaterials] = useState()

  useEffect(async () => {
    if (!connected) return
    setMaterials(await sendEvent('getMaterials'))
  }, [connected, ready])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Materials', 'MaterialCollected', 'MaterialDiscarded'].includes(log.event)) {
      setMaterials(await sendEvent('getMaterials'))
    }
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' scrollable navigation={EngineeringPanelNavItems('Materials')}>
        {materials &&
          <>
            <h1 className='text-info'>Materials</h1>
            {materials && <Materials materialType='Raw' materials={materials.filter(item => item.type === 'Raw')} />}
            {materials && <Materials materialType='Manufactured' materials={materials.filter(item => item.type === 'Manufactured')} />}
            {materials && <Materials materialType='Encoded' materials={materials.filter(item => item.type === 'Encoded')} />}
          </>}
      </Panel>
    </Layout>
  )
}

function Materials ({ materialType, materials }) {
  if (materials.length === 0) return (<p className='text-info text-uppercase'>No materials found.</p>)

  return (
    <>
      <hr style={{ margin: '1rem 0' }} />
      <h2 style={{ margin: '1rem 0' }} className='text-primary'>{materialType} Materials</h2>
      <table className='table--animated'>
        <thead>
          <tr>
            <td style={{ width: '20rem' }}>{materialType} Material</td>
            <td className='hidden-small'>Engineering applications</td>
            <td className='hidden-small text-right'>Grade</td>
          </tr>
        </thead>
        <tbody>
          {materials.map(item =>
            <tr key={`material_${item.name}_${item.type}`}>
              <td style={{ width: '20rem' }}>
                <h3>{item.name}</h3>
                <span className='text-muted'>{item.description}</span>
                <div>
                  <div style={{ width: '30%', display: 'inline-block' }}>
                    {item.count}<span className='text-muted'>/{item.maxCount}</span>
                  </div>
                  <div style={{ width: '70%', display: 'inline-block' }}>
                    <progress style={{ height: '1rem' }} value={item.count} max={item?.maxCount ?? item.count} />
                  </div>
                </div>
              </td>
              <td className='hidden-small'>
                {item.blueprints
                  .map(blueprint => {
                    // TODO Highlight engineering uses relevant to equipped engineered modules
                    // TODO Highlight engineering uses relevant to pinned engineering blueprints
                    let name = blueprint.symbol.replace(/_(.*?)$/, '').replace(/([a-z])([A-Z])/g, '$1 $2').trim()
                    if (name === 'MC') name = 'Weapons'
                    if (name === 'Weapon') name = 'Weapons'
                    if (name === 'Engine') name = 'Engines'
                    if (name.includes('Limpet')) name = 'Limpets'
                    if (name === 'FSDinterdictor') name = 'Interdictor'
                    if (name === 'Misc') name = blueprint.symbol.replaceAll('_', '').replace(/([a-z])([A-Z])/g, '$1 $2').trim()
                    return name
                  })
                  .filter((value, index, self) => self.indexOf(value) === index)
                  .sort()
                  .map((use, i) => <Fragment key={`material_${item.name}_${use}`}>{i === 0 ? '' : <span className='text-muted'>, </span>}<span className='text-muted'>{use}</span></Fragment>)}
              </td>
              <td className='hidden-small text-right text-no-wrap'><small>{item.rarity}</small></td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  )
}
