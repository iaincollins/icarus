import Layout from 'components/layout'
import Panel from 'components/panel'
import { useSocket } from 'lib/socket'
import testSystem from 'lib/test-system.json'
import SystemMap from 'lib/system-map'

export default function NavPage () {
  const { connected, active } = useSocket()
  const systemMap = new SystemMap(testSystem)

  return (
    <Layout connected={connected} active={active}>
      <Panel layout='full-width' scrollable>
        <h2>Navigation</h2>
        <pre
          className='selectable' dangerouslySetInnerHTML={{
            __html: `${JSON.stringify(systemMap.stars, null, 2)}`
          }}
        />
      </Panel>
    </Layout>
  )
}
