export default function NavigationInspectorPanel ({ systemObject }) {
  if (!systemObject) return null

  return (
    <div className='navigation-panel__detail'>
      <div className='navigation-panel__detail-info'>
        <i className='text-info icon icarus-terminal-planet' />
        <h3 className='text-info'><span className='fx-animated-text' data-fx-order='1'>{systemObject.name}</span></h3>
        <h4 className='text-primary'><span className='fx-animated-text' data-fx-order='2'>{systemObject.type}</span></h4>
      </div>
      <hr />
    </div>
  )
}
