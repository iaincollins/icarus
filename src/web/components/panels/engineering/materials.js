import { Fragment } from 'react'

export default function Materials ({ materialType, materials }) {
  if (materials.length === 0) return (<p className='text-info text-uppercase'>No materials found.</p>)

  const materialsByType = materials.filter(item => item.type === materialType)

  const materialCategories = []
  materialsByType.map(material => {
    if (!materialCategories.includes(material.category))
      materialCategories.push(material.category)
  })

  return (
    <>
      {materialCategories.sort().map(materialCategory => 
        <MaterialsTable
          materialType={materialType}
          materialCategory={materialCategory}
          materials={materialsByType.filter(item => item.category === materialCategory)}
          />
      )}
  </>
  )
}

function MaterialsTable ({ materialType, materialCategory, materials }) {
  if (materials.length === 0) return (<p className='text-info text-uppercase'>No materials.</p>)

  return (
    <>
      {materialCategory &&
        <div className='tabs'>
          <h4 className='tab' style={{marginTop: '1rem'}}>{materialCategory}</h4>
        </div>}
      <table className='table--animated fx-fade-in'>
        <thead style={{display: 'none'}}>
          <tr>
            <th style={{ width: '30rem' }}>{materialType} Material</th>
            <th className='hidden-small'>Applications</th>
            <th className='text-right' style={{width: '3rem'}}>Grade</th>
          </tr>
        </thead>
        <tbody>
          {materials.map(item =>
            <tr key={`material_${materialType}_${materialCategory}_${item.symbol}`}>
              <td style={{ width: '30rem' }}>
                <h3>{item.name}</h3>
                <span className='visible-small text-muted'>{item.description}</span>
                <div style={{marginTop: '.5rem'}}>
                  <div style={{ width: '30%', display: 'inline-block' }}>
                    {item.count}<span className='text-muted'>/{item.maxCount}</span>
                  </div>
                  <div style={{ width: '70%', display: 'inline-block' }}>
                    <progress style={{ height: '1.25rem' }} value={item.count} max={item?.maxCount ?? item.count} />
                  </div>
                </div>
              </td>
              <td className='hidden-small' style={{verticalAlign: 'middle'}}>
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
                    name = name.replace(/misc /ig, '').replace(/ capacity/gi, '')
                    return name
                  })
                  .filter((value, index, self) => self.indexOf(value) === index)
                  .sort()
                  .map((use, i) => <Fragment key={`material_${item.name}_${use}`}>{i === 0 ? '' : <span className='text-muted'>, </span>}<span className='text-muted'>{use}</span></Fragment>)}
                {materialType === 'Xeno' && <span className='text-muted'>Classified</span>}
              </td>
              <td className='text-right text-no-wrap' style={{width: '3rem',verticalAlign: 'middle'}}>
                <i style={{fontSize: '3rem'}} className={`icon icarus-terminal-materials-grade-${item.grade}`}/>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  )
}