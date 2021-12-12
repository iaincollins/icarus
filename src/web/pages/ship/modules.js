import { useState, useEffect } from 'react'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { ShipPanelNavItems } from 'lib/navigation-items'

export default function ShipModulesPage () {
  const { connected, active, ready } = useSocket()
  const [ship, setShip] = useState()

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' navigation={ShipPanelNavItems('Modules')}>
        <h1>Ship Modules</h1>
      </Panel>
    </Layout>
  )
}
