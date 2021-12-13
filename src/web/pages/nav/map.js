import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { NavPanelNavItems } from 'lib/navigation-items'
import NavigationSystemMapPanel from 'components/panels/navigation/navigation-system-map'
import NavigationInspectorPanel from 'components/panels/navigation/navigation-inspector-panel'

// TODO Refactor to reduce code duplication
export default function NavMapPage () {
  const router = useRouter()
  const { query } = router
  const { connected, active, ready } = useSocket()
  const [system, setSystem] = useState()
  const [systemObject, setSystemObject] = useState()

  const getSystem = async (systemName) => {
    const newSystem = await sendEvent('getSystem', { name: systemName })
    if (!newSystem) return
    setSystem(newSystem)
    const newSystemObject = newSystem?.stars?.[0]?._children?.[0] ?? null
    setSystemObject(newSystemObject)
  }

  const setSystemObjectByName = (name) => {
    const el = document.querySelector(`[data-system-object-name="${name}" i]`)
    if (el) {
      el.focus()
    } else {
      const newSystemObject = system.objectsInSystem.filter(child => child.name.toLowerCase() === name.toLowerCase())[0]
      setSystemObject(newSystemObject)
    }
  }

  if (router.isReady && system && !systemObject) {
    let newSystemObject
    if (query.selected) {
      newSystemObject = system.objectsInSystem.filter(child => child.name.toLowerCase() === query.selected.toLowerCase())[0]
    } else {
      newSystemObject = system?.stars?.[0]?._children?.[0] ?? null
    }

    if (newSystemObject) {
      setTimeout(() => {
        const el = document.querySelector(`[data-system-object-name="${newSystemObject?.name}" i]`)
        if (el) {
          el.focus()
        } else {
          // TODO If the object is a ground facility, highlight the nearest planet in the map
          setSystemObject(newSystemObject)
        }
      }, 500) // Delay to allow map to render
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
      if (!newSystem) return
      setSystem(newSystem)
      const newSystemObject = newSystem?.stars?.[0]?._children?.[0] ?? null
      setSystemObject(newSystemObject)
    }
  }), [])

  useEffect(() => {
    if (!router.isReady) return
    const q = { ...query }
    if (system) q.system = system.name.toLowerCase()
    if (systemObject) q.selected = systemObject.name.toLowerCase()
    router.push({ query: q }, undefined, { shallow: true })
  }, [system, systemObject, router.isReady])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' navigation={NavPanelNavItems('Map', query)}>
        <NavigationSystemMapPanel system={system} setSystemObject={setSystemObject} getSystem={getSystem} />
        <NavigationInspectorPanel systemObject={systemObject} setSystemObjectByName={setSystemObjectByName} />
      </Panel>
    </Layout>
  )
}
