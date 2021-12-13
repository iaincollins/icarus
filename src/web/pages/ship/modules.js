import { useState, useEffect } from 'react'
import { useSocket, sendEvent } from 'lib/socket'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { ShipPanelNavItems } from 'lib/navigation-items'

export default function ShipModulesPage () {
  const { connected, active, ready } = useSocket()
  const [shipModules, setShipModules] = useState()

  useEffect(async () => {
    if (!connected) return
    setShipModules(await sendEvent('getShipModules'))
  }, [connected, ready])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' navigation={ShipPanelNavItems('Modules')}>
        <h1>Ship Modules</h1>
        <pre>
          {JSON.stringify(shipModules, null, 2)}
        </pre>
      </Panel>
    </Layout>
  )
}
