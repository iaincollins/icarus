import { Fragment } from 'react'
import CopyOnClick from 'components/copy-on-click'

export default function Materials ({ materialType, materials }) {
  if (materials.length === 0) return (<p className='text-info text-uppercase'>No materials found.</p>)

  const materialsByType = materials.filter(item => item.type === materialType)

  const materialCategories = []
  materialsByType.forEach(material => {
    if (!materialCategories.includes(material.category)) { materialCategories.push(material.category) }
  })

  return materialCategories.sort().map(materialCategory =>
    <MaterialsTable
      key={`materials-table_${materialType}_${materialCategory}`}
      materialType={materialType}
      materialCategory={materialCategory}
      materials={materialsByType.filter(item => item.category === materialCategory).sort((a, b) => a.grade > b.grade ? 1 : -1)}
    />
  )
}

function MaterialsTable ({ materialType, materialCategory, materials }) {
  if (materials.length === 0) return (<p className='text-info text-uppercase'>No materials.</p>)

  return (
    <>
      {materialCategory &&
        <div className='tabs'>
          <h4 className='tab' style={{ marginTop: '1rem' }}>{materialCategory}</h4>
        </div>}
      <table className='table--animated fx-fade-in'>
        <thead style={{ display: 'none' }}>
          <tr>
            <th style={{ width: '30rem' }}>{materialType} Material</th>
            <th className='hidden-large'>Applications</th>
            <th className='text-right' style={{ width: '3rem' }}>Grade</th>
          </tr>
        </thead>
        <tbody>
          {materials.map(item =>
            <tr
              key={`material_${materialType}_${materialCategory}_${item.symbol}`}
              className={item.count === item?.maxCount ? 'text-secondary' : ''}
            >
              <td style={{ width: '30rem' }}>
                <h3 className={item.count === 0 ? 'text-muted' : ''}><CopyOnClick>{item.name}</CopyOnClick></h3>
                <div style={{ marginTop: '.5rem' }}>
                  <div style={{ width: '30%', display: 'inline-block' }}>
                    <span className={item.count === 0 ? 'text-muted' : ''}>{item.count}</span><span className='text-muted'>/{item.maxCount}</span>
                  </div>
                  <div style={{ width: '70%', display: 'inline-block' }}>
                    <progress style={{ height: '1.25rem' }} value={item.count} max={item?.maxCount ?? item.count} className={item.count === item?.maxCount ? 'progress--secondary' : ''} />
                  </div>
                </div>
              </td>
              <td className='hidden-large text-no-transform'>
                <span style={{ xfontSize: '1rem' }} className={item.count === 0 ? 'text-muted' : ''}>
                  {item.blueprints
                    .map(blueprint => {
                    // TODO Highlight engineering uses relevant to equipped engineered modules
                    // TODO Highlight engineering uses relevant to pinned engineering blueprints
                      let name = blueprint.symbol.replace(/_(.*?)$/, '').replace(/([a-z])([A-Z])/g, '$1 $2').trim()
                      if (['Weapon', 'Engine', 'Sensor'].includes(name)) name = `${name}s`
                      if (name === 'AFM') name = 'AFMU'
                      if (name === 'MC') name = 'Weapons'
                      if (name.includes('Limpet')) name = 'Limpets'
                      if (name === 'FSDinterdictor') name = 'Interdictor'
                      if (name.startsWith('Hull ')) name = 'Hull'
                      if (name === 'Misc') name = blueprint.symbol.replaceAll('_', '').replace(/([a-z])([A-Z])/g, '$1 $2').trim()
                      name = name.replace(/misc /ig, '').replace(/ capacity/gi, '')
                      return name
                    })
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .sort()
                    .map((use, i) => <Fragment key={`material_${item.name}_${use}`}>{i === 0 ? '' : <span className='text-muted'>, </span>}<span>{use}</span></Fragment>)}
                  {materialType === 'Xeno' && <span className='text-muted'>Classified</span>}
                </span>
              </td>
              <td className={`text-right text-no-wrap ${item.count === 0 ? 'text-muted' : ''}`} style={{ width: '3rem' }}>
                <i style={{ fontSize: '3rem' }} className={`icon icarus-terminal-materials-grade-${item.grade}`} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  )
}
