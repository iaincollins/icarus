import { useState, useEffect } from 'react'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import Layout from 'components/layout'
import Panel from 'components/panel'
import NavigationSystemMapPanel from 'components/panels/navigation/navigation-system-map'
import NavigationInspectorPanel from 'components/panels/navigation/navigation-inspector-panel'
import NavigationListPanel from 'components/panels/navigation/navigation-list-panel'

export default function NavPage () {
  const MAP_VIEW = 'MAP_VIEW'
  const LIST_VIEW = 'LIST_VIEW'

  const { connected, active, ready } = useSocket()
  const [componentReady, setComponentReady] = useState(false)
  const [system, setSystem] = useState()
  const [systemObject, setSystemObject] = useState()
  const [view, setView] = useState(MAP_VIEW)

  useEffect(async () => {
    if (!connected) return
    setComponentReady(false)
    const newSystem = await sendEvent('getSystem')
    const firstSystemObject = newSystem?.stars?.[0]?._children?.[0] ?? null
    setSystem(newSystem)
    setSystemObject(firstSystemObject)
    setComponentReady(true)
  }, [connected, ready])

  useEffect(() => eventListener('newLogEntry', async (newLogEntry) => {
    if (newLogEntry.event === 'FSDJump') {
      const newSystem = await sendEvent('getSystem')
      const firstSystemObject = newSystem?.stars?.[0]?._children?.[0] ?? null
      setSystem(newSystem)
      setSystemObject(firstSystemObject)
    }
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready && componentReady}>
      <Panel layout='full-width' navigationItems={[
        {
          icon: 'system-bodies',
          onClick: () => setView(MAP_VIEW),
          active: view === MAP_VIEW
        },
        {
          icon: 'table-inspector',
          onClick: () => setView(LIST_VIEW),
          active: view === LIST_VIEW
        }
      ]}>
        {view === LIST_VIEW && <NavigationListPanel system={system} setSystemObject={setSystemObject} />}
        {view === MAP_VIEW && <NavigationSystemMapPanel system={system} setSystemObject={setSystemObject} />}
        <NavigationInspectorPanel systemObject={systemObject} />
      </Panel>
    </Layout>
  )
}
