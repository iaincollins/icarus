import { useState, useEffect } from 'react'
import Layout from 'components/layout'
import Panel from 'components/panel'
import NavigationSystemMapPanel from 'components/panels/navigation/navigation-system-map'
import NavigationInspectorPanel from 'components/panels/navigation/navigation-inspector-panel'
import NavigationListPanel from 'components/panels/navigation/navigation-list-panel'
import { useSocket, sendEvent } from 'lib/socket'

export default function NavPage () {
  const { connected, active } = useSocket()
  const [ready, setReady] = useState(false)
  const [system, setSystem] = useState()
  const [systemObject, setSystemObject] = useState()
  const [view, setView] = useState('map')

  useEffect(async () => {
    if (!connected) return
    const newSystem = await sendEvent('getSystem')
    const firstSystemObject = newSystem?.stars?.[0]?._children?.[0] ?? null
    setSystem(newSystem)
    setSystemObject(firstSystemObject)
    setReady(true)
  }, [connected])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' scrollable>
        <div className="secondary-navigation">
          <button tabIndex="1" className={`button--icon ${view === 'map' ? 'button--active' : ''}`} onClick={() => setView('map')}>
            <i className="icon icarus-terminal-system-bodies"/>
          </button>
          <button tabIndex="1" className={`button--icon ${view === 'list' ? 'button--active' : ''}`} onClick={() => setView('list')}>
            <i className="icon icarus-terminal-table-inspector"/>
          </button>
        </div>
        {view === 'list' && <NavigationListPanel system={system} setSystemObject={setSystemObject}/>}
        {view === 'map' && <NavigationSystemMapPanel system={system}/>}
        <NavigationInspectorPanel systemObject={systemObject}/>
      </Panel>
    </Layout>
  )
}
