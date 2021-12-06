import SystemMap from 'components/system-map/system-map'

export default function NavigationSystemMapPanel ({ system, setSystemObject }) {
  if (!system) return null

  return (
    <div className='navigation-panel__map' style={{ display: 'block' }}>
      <div className='navigation-panel__map-background'>
        <div className='navigation-panel__map-foreground scrollable'>
          <SystemMap system={system} setSystemObject={setSystemObject} />
        </div>
      </div>
    </div>
  )
}
