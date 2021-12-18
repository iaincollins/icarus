import { useState } from 'react'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { useSocket } from 'lib/socket'

export default function TradePage () {
  const { connected, active } = useSocket()
  const [system, setSystem] = useState()
  const [location, setMarketLocation] = useState()

  return (
    <Layout connected={connected} active={active}>
      <Panel layout='full-width' scrollable>
        <h2>Trade</h2>
      </Panel>
    </Layout>
  )
}
