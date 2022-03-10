import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { NavPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'
import NavigationListPanel from 'components/panels/nav/navigation-list-panel'
import NavigationInspectorPanel from 'components/panels/nav/navigation-inspector-panel'

export default function NavListPage () {
  const router = useRouter()
  const { query } = router
  const { connected, active, ready } = useSocket()
  const [componentReady, setComponentReady] = useState(false)
  const [system, setSystem] = useState()
  const [systemObject, setSystemObject] = useState()
  const [helpVisible, setHelpVisible] = useState(false)

  const getSystem = async (systemName, useCache = true) => {
    const newSystem = await sendEvent('getSystem', { name: systemName, useCache })
    if (!newSystem) return
    setSystemObject(null)
    setSystem(newSystem)
  }

  const search = async (searchInput) => {
    const newSystem = await sendEvent('getSystem', { name: searchInput })
    if (!newSystem) return
    setSystemObject(null)
    setSystem(newSystem)
  }

  const setSystemObjectByName = (name) => {
    if (!name) setSystemObject(null)
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
      if (newSystemObject) {
        const el = document.querySelector(`[data-system-object-name="${newSystemObject.name}" i]`)
        if (el) el.focus()
      }
    }
    setComponentReady(true)
  }, [connected, ready, router.isReady])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Location', 'FSDJump'].includes(log.event)) {
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
    <>
      <div className='modal-dialog' style={{ display: helpVisible ? 'block' : 'none' }}>
        <h3 className='text-primary'>Key</h3>
        <hr />
        <div className='text-primary text-uppercase navigation-panel__legend'>
          <p>
            <i className='icon icarus-terminal-planet-lander text-secondary' /> Landable
          </p>
          <p>
            <i className='icon icarus-terminal-planet-atmosphere' /> Atmosphere
          </p>
          <p>
            <i className='icon icarus-terminal-planet-volcanic' /> Volcanic activity
          </p>
          <p>
            <i className='icon icarus-terminal-planet-terraformable' /> Terraformable
          </p>
          <p>
            <i className='icon icarus-terminal-planet-earthlike' /> Earthlike
          </p>
          <p>
            <i className='icon icarus-terminal-planet-water-world' /> Water World
          </p>
          <p>
            <i className='icon icarus-terminal-planet-high-metal-content' /> High metal content
          </p>
          <p>
            <i className='icon icarus-terminal-planet-gas-giant' /> Gas Giant
          </p>
          <p>
            <i className='icon icarus-terminal-planet-water-based-life' /> Water based life
          </p>
          <p>
            <i className='icon icarus-terminal-planet-ammonia-based-life' /> Ammonia based life
          </p>
          <p>
            <i className='icon icarus-terminal-planet-ringed' /> Ringed
          </p>
        </div>
        <hr style={{ margin: '1rem 0 .5rem 0' }} />
        <button className='float-right' onClick={() => setHelpVisible(false)}>
          Close
        </button>
      </div>
      <Layout connected={connected} active={active} ready={ready} loader={!componentReady}>
        <Panel layout='full-width' navigation={NavPanelNavItems('List', query)} search={search} exit={(system?.isCurrentLocation === false || system?.unknownSystem === true) ? () => getSystem() : null}>
          <NavigationListPanel system={system} systemObject={systemObject} setSystemObject={setSystemObject} showHelp={() => setHelpVisible(true)} />
          <NavigationInspectorPanel systemObject={systemObject} setSystemObjectByName={setSystemObjectByName} />
        </Panel>
      </Layout>
    </>
  )
}
