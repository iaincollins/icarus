import { useState, useEffect } from 'react'
import Layout from 'components/layout'
import Panel from 'components/panel'
import NavigationSystemMapPanel from 'components/panels/navigation/navigation-system-map'
import NavigationInspectorPanel from 'components/panels/navigation/navigation-inspector-panel'
import NavigationListPanel from 'components/panels/navigation/navigation-list-panel'
import { useSocket, sendEvent, eventListener } from 'lib/socket'

const MAP_VIEW = 'map-view'
const LIST_VIEW = 'list-view'

export default function NavPage () {
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
      <div className='secondary-navigation'>
        <button tabIndex='1' className={`button--icon ${view === MAP_VIEW ? 'button--active' : ''}`} onClick={() => setView(MAP_VIEW)}>
          <i className='icon icarus-terminal-system-bodies' />
        </button>
        <button tabIndex='1' className={`button--icon ${view === LIST_VIEW ? 'button--active' : ''}`} onClick={() => setView(LIST_VIEW)}>
          <i className='icon icarus-terminal-table-inspector' />
        </button>
      </div>
      {view === LIST_VIEW && <NavigationListPanel system={system} setSystemObject={setSystemObject} />}
      {view === MAP_VIEW && <NavigationSystemMapPanel system={system} setSystemObject={setSystemObject} />}
      <NavigationInspectorPanel systemObject={systemObject} />
    </Layout>
  )
}
