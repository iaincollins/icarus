import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { NavPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'
import NavigationSystemMapPanel from 'components/panels/nav/navigation-system-map-panel'
import NavigationInspectorPanel from 'components/panels/nav/navigation-inspector-panel'

export default function NavMapPage () {
  const router = useRouter()
  const { query } = router
  const { connected, active, ready } = useSocket()
  const [componentReady, setComponentReady] = useState(false)
  const [system, setSystem] = useState()
  const [systemObject, setSystemObject] = useState()

  const search = async (searchInput) => {
    const newSystem = await sendEvent('getSystem', { name: searchInput })
    if (!newSystem) return
    setSystemObject(null)
    setSystem(newSystem)
  }

  const getSystem = async (systemName, useCache = true) => {
    const newSystem = await sendEvent('getSystem', { name: systemName, useCache })
    if (!newSystem) return
    setSystemObject(null)
    setSystem(newSystem)
  }

  const setSystemObjectByName = (name) => {
    const el = document.querySelector(`[data-system-object-name="${name}" i]`)
    if (el) {
      el.focus()
    } else {
      const newSystemObject = system.objectsInSystem.filter(child => child.name.toLowerCase() === name?.toLowerCase())[0]
      setSystemObject(newSystemObject)
    }
  }

  useEffect(async () => {
    if (!connected || !router.isReady) return

    const newSystem = await sendEvent('getSystem', query.system ? { name: query.system, useCache: true } : null)
    if (newSystem) {
      setSystem(newSystem)
    } else {
      // If system lookup fails (i.e. no game data), fallback to Sol system
      setSystem(await sendEvent('getSystem', { name: 'Sol', useCache: true }))
    }

    if (query.selected) {
      const newSystemObject = newSystem.objectsInSystem.filter(child => child.name.toLowerCase() === query.selected.toLowerCase())[0]
      if (!newSystemObject) return
      setSystemObject(newSystemObject)
      // TODO Highlight body on map (or, if ground facility, the nearest planet)
      // setTimeout(() => {
      //   const el = document.querySelector(`[data-system-object-name="${newSystemObject?.name}" i]`)
      //   if (el) el.focus()
      // }, 750) // Delay to allow map to render
    }
    setComponentReady(true)
  }, [connected, ready, router.isReady])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (log.event === 'FSDJump') {
      const newSystem = await sendEvent('getSystem', { useCache: false })
      if (!newSystem) return // If no result, don't update map
      setSystemObject(null) // Clear selected object
      setSystem(newSystem)
    }
    if (['FSSDiscoveryScan', 'FSSAllBodiesFound', 'Scan'].includes(log.event)) {
      const newSystem = await sendEvent('getSystem', { name: system?.name, useCache: false })
      if (newSystem) setSystem(newSystem)
    }
  }), [system])

  useEffect(() => {
    if (!router.isReady) return
    const q = { ...query }
    if (system) q.system = system?.name?.toLowerCase()
    if (systemObject) {
      q.selected = systemObject?.name?.toLowerCase()
    } else {
      if (q.selected) delete q.selected
    }
    router.push({ query: q }, undefined, { shallow: true })
  }, [system, systemObject, router.isReady])

  return (
    <Layout connected={connected} active={active} ready={ready} loader={!componentReady}>
      <Panel layout='full-width' navigation={NavPanelNavItems('Map', query)} search={search} exit={(system?.isCurrentLocation === false || system?.unknownSystem === true) ? () => getSystem() : null}>
        <NavigationSystemMapPanel system={system} systemObject={systemObject} setSystemObject={setSystemObject} getSystem={getSystem} />
        <NavigationInspectorPanel systemObject={systemObject} setSystemObjectByName={setSystemObjectByName} />
      </Panel>
    </Layout>
  )
}
