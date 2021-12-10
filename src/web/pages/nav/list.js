import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import Layout from 'components/layout'
import Panel from 'components/panel'
import NavigationListPanel from 'components/panels/navigation/navigation-list-panel'
import NavigationInspectorPanel from 'components/panels/navigation/navigation-inspector-panel'

// TODO Refactor to reduce code duplication
export default function NavListPage () {
  const router = useRouter()
  const { query } = router
  const { connected, active, ready } = useSocket()
  const [system, setSystem] = useState()
  const [systemObject, setSystemObject] = useState()

  const setSystemObjectByName = (name) => {
    const el = document.querySelector(`[data-system-object-name="${name}"]`)
    if (el) {
      el.focus()
    } else {
      const newSystemObject = system.objectsInSystem.filter(child => child.name === name)[0]
      setSystemObject(newSystemObject)
    }
  }

  if (router.isReady && system && !systemObject) {
    let newSystemObject
    if (query.selected) {
      newSystemObject = system.objectsInSystem.filter(child => child.name === query.selected)[0]
    } else {
      newSystemObject = system?.stars?.[0]?._children?.[0] ?? null
    }
    if (newSystemObject) {
      const el = document.querySelector(`[data-system-object-name="${newSystemObject.name}"]`)
      if (el) el.focus()
    }
  }

  useEffect(async () => {
    if (!connected || !router.isReady) return
    const newSystem = await sendEvent('getSystem', query.system ? { name: query.system } : null)
    if (newSystem) setSystem(newSystem)
  }, [connected, ready, router.isReady])

  useEffect(() => eventListener('newLogEntry', async (newLogEntry) => {
    if (newLogEntry.event === 'FSDJump') {
      const newSystem = await sendEvent('getSystem')
      if (newSystem) setSystem(newSystem)
      const newSystemObject = newSystem?.stars?.[0]?._children?.[0] ?? null
      setSystemObject(newSystemObject)
    }
  }), [])

  useEffect(() => {
    if (!router.isReady) return
    const q = { ...query }
    if (system) q.system = system.name
    if (systemObject) q.selected = systemObject.name
    router.push({ query: q }, undefined, { shallow: true })
  }, [system, systemObject, router.isReady])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel
        layout='full-width' navigation={[
          {
            icon: 'system-bodies',
            url: {
              pathname: '/nav/map',
              query
            }
          },
          {
            icon: 'table-inspector',
            active: true
          }
        ]}
      >
        <NavigationListPanel system={system} setSystemObject={setSystemObject} />
        <NavigationInspectorPanel system={system} systemObject={systemObject} setSystemObjectByName={setSystemObjectByName} />
      </Panel>
    </Layout>
  )
}
