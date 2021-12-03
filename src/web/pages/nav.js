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
  const { connected, active } = useSocket()
  const [ready, setReady] = useState(false)
  const [system, setSystem] = useState()
  const [systemObject, setSystemObject] = useState()
  const [view, setView] = useState(MAP_VIEW)

  useEffect(async () => {
    if (!connected) return
    const newSystem = await sendEvent('getSystem')
    const firstSystemObject = newSystem?.stars?.[0]?._children?.[0] ?? null
    console.log(newSystem)
    setSystem(newSystem)
    setSystemObject(firstSystemObject)
    setReady(true)
  }, [connected])

  useEffect(() => eventListener('newLogEntry', async (newLogEntry) => {
    if (newLogEntry.event === 'FSDJump') {
      const newSystem = await sendEvent('getSystem')
      const firstSystemObject = newSystem?.stars?.[0]?._children?.[0] ?? null
      setSystem(newSystem)
      setSystemObject(firstSystemObject)
    }
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' scrollable>
        <div className='secondary-navigation'>
          <button tabIndex='1' className={`button--icon ${view === MAP_VIEW ? 'button--active' : ''}`} onClick={() => setView(MAP_VIEW)}>
            <i className='icon icarus-terminal-system-bodies' />
          </button>
          <button tabIndex='1' className={`button--icon ${view === LIST_VIEW ? 'button--active' : ''}`} onClick={() => setView(LIST_VIEW)}>
            <i className='icon icarus-terminal-table-inspector' />
          </button>
        </div>
        {view === LIST_VIEW && <NavigationListPanel system={system} setSystemObject={setSystemObject} />}
        {view === MAP_VIEW && <NavigationSystemMapPanel system={system} />}
        <NavigationInspectorPanel systemObject={systemObject} />
      </Panel>
    </Layout>
  )
}
