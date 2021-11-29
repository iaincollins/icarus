import Layout from 'components/layout'
import Panel from 'components/panel'
import { useSocket } from 'lib/socket'

export default function ShipPage () {
  const { connected, active } = useSocket()

  return (
    <Layout connected={connected} active={active}>
      <Panel layout='full-width' scrollable>
        <h2>Ship</h2>
      </Panel>
    </Layout>
  )
}
