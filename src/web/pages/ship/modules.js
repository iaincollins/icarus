import { useState, useEffect } from 'react'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { ShipPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'
import ShipModulesPanel from 'components/panels/ship/ship-modules-panel'
import ShipModuleInspectorPanel from 'components/panels/ship/ship-module-inspector-panel'

export default function ShipModulesPage () {
  const { connected, active, ready } = useSocket()
  const [ship, setShip] = useState()
  const [selectedModule, setSelectedModule] = useState()

  useEffect(async () => {
    if (!connected) return
    setShip(await sendEvent('getShip'))
  }, [connected, ready])

  useEffect(() => eventListener('gameStateChange', async () => {
    setShip(await sendEvent('getShip'))
  }), [])

  useEffect(() => eventListener('newLogEntry', async () => {
    setShip(await sendEvent('getShip'))
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready} className='ship-panel'>
      <Panel navigation={ShipPanelNavItems('Modules')} scrollable>
        <ShipModulesPanel ship={ship} selectedModule={selectedModule} setSelectedModule={setSelectedModule} />
      </Panel>
      <Panel>
        <ShipModuleInspectorPanel module={selectedModule} setSelectedModule={setSelectedModule} />
      </Panel>
    </Layout>
  )
}
