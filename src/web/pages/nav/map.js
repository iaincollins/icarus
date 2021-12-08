import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import Layout from 'components/layout'
import Panel from 'components/panel'
import NavigationSystemMapPanel from 'components/panels/navigation/navigation-system-map'
import NavigationInspectorPanel from 'components/panels/navigation/navigation-inspector-panel'

// TODO Refactor to reduce code duplication
export default function NavMapPage () {
  const router = useRouter()
  const { query } = router
  const { connected, active, ready } = useSocket()
  const [system, setSystem] = useState()
  const [systemObject, setSystemObject] = useState()

  if (router.isReady && system && !systemObject) {
    let newSystemObject
    if (query.selected) {
      newSystemObject = system.objectsInSystem.filter(child => child.name === query.selected)[0]
    } else {
      newSystemObject = system?.stars?.[0]?._children?.[0] ?? null
    }

    if (newSystemObject) {
      const el = document.querySelector(`[data-system-object-name="${newSystemObject?.name}"]`)
      if (el) {
        el.focus()
      } else {
        // TODO If the object is a ground facility, highlight the nearest planet in the map
        setSystemObject(newSystemObject)
      }
    }
  }

  useEffect(async () => {
    if (!connected || !router.isReady) return
    const newSystem = await sendEvent('getSystem', query.system ? { name: query.system } : null)
    console.log('newSystem', newSystem)
    if (newSystem) setSystem(newSystem)
  }, [connected, ready, router.isReady])

  useEffect(() => eventListener('newLogEntry', async (newLogEntry) => {
    if (newLogEntry.event === 'FSDJump') {
      const newSystem = await sendEvent('getSystem')
      if (newSystem) setSystem(newSystem)
      const newSystemObject = newSystem?.stars?.[0]?._children?.[0] ?? null
      if (newSystemObject) setSystemObject(newSystemObject)
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
            active: true
          },
          {
            icon: 'table-inspector',
            url: {
              pathname: '/nav/list',
              query
            }
          }
        ]}
      >
        <NavigationSystemMapPanel system={system} setSystemObject={setSystemObject} />
        <NavigationInspectorPanel systemObject={systemObject} />
      </Panel>
    </Layout>
  )
}
