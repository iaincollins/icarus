import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { NavPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'

export default function NavListPage () {
  const router = useRouter()
  const { query } = router
  const { connected, active, ready } = useSocket()
  const [componentReady, setComponentReady] = useState(false)
  const [currentSystem, setCurrentSystem] = useState()
  const [system, setSystem] = useState()
  const [navRoute, setNavRoute] = useState()

  useEffect(async () => {
    if (!connected || !router.isReady) return
    const [newCurrentSystem, newSystem, newNavRoute] = await Promise.all([
      sendEvent('getSystem'),
      sendEvent('getSystem', query.system ? { name: query.system, useCache: true } : null),
      sendEvent('getNavRoute')
    ])
    if (newCurrentSystem) setCurrentSystem(newCurrentSystem)
    if (newSystem) setSystem(newSystem)
    if (newNavRoute) setNavRoute(newNavRoute)
    setComponentReady(true)
  }, [connected, ready, router.isReady])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (log.event === 'FSDJump') {
      const newCurrentSystem = await sendEvent('getSystem')
      if (newCurrentSystem) setCurrentSystem(newCurrentSystem)
      if (newCurrentSystem) setSystem(newCurrentSystem)
    }
  }))

  useEffect(() => eventListener('gameStateChange', async (log) => {
    const newNavRoute = await sendEvent('getNavRoute')
    if (newNavRoute) setNavRoute(newNavRoute)
  }))

  useEffect(() => {
    if (!router.isReady) return
    const q = { ...query }
    if (system) {
      q.system = system?.name?.toLowerCase()
      if (q.selected) delete q.selected
    }
    router.push({ query: q }, undefined, { shallow: true })
  }, [system, router.isReady])

  return (
    <Layout connected={connected} active={active} ready={ready} loader={!componentReady}>
      <Panel layout='full-width' navigation={NavPanelNavItems('Route', query)}>
        <div className='navigation-panel__list'>
          <div className='scrollable'>
            <h2>Route</h2>
            <table>
              <tbody>
                <tr style={{ background: 'none' }}>
                  <td style={{ width: '50%', padding: 0 }}>
                    {currentSystem &&
                      <>
                        <h4 className='text-primary'>Current System</h4>
                        <h3 className='text-info'><span className='selectable'>{currentSystem?.name}</span></h3>
                      </>}
                  </td>
                  <td style={{ width: '50%', padding: 0 }} className='text-right'>
                    {system && navRoute && navRoute.length > 0 && navRoute[navRoute.length - 1].StarSystem.toLowerCase() !== system?.name?.toLowerCase() &&
                      <>
                        <h4 className='text-primary'>Destination</h4>
                        <h3 className='text-info'><span className='selectable'>{navRoute[navRoute.length - 1].StarSystem}</span></h3>
                      </>}
                    {system && navRoute && navRoute.length > 0 && navRoute[navRoute.length - 1].StarSystem.toLowerCase() === system?.name?.toLowerCase() &&
                      <>
                        <h4>&nbsp;</h4>
                        <h3 className='text-primary text-muted'>At destination</h3>
                      </>}
                  </td>
                </tr>
              </tbody>
            </table>
            {navRoute && navRoute.length > 0 &&
              <>
                <hr style={{ marginBottom: 0 }} />
                <table className='table--animated table--interactive fx-fade-in'>
                  <thead>
                    <tr>
                      <th style={{ width: '3rem' }} className='text-right'>#</th>
                      <th>System</th>
                      <th className='hidden-medium'>Primary Star</th>
                      <th className='text-right'>&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    {navRoute.map((route, i) =>
                      <tr
                        key={`nav-route_${route.StarSystem}`}
                        className={`${currentSystem && currentSystem?.name === route.StarSystem ? 'table__row--highlighted' : 'table__row--highlight-primary-hover'} ${system && currentSystem && system?.name !== currentSystem?.name && system?.name === route.StarSystem ? 'table__row--selected' : ''}`}
                        onClick={() => router.push({ pathname: '/nav/map', query: { system: route.StarSystem.toLowerCase() } })}
                      >
                        <td className='text-right' style={{ width: '3rem', verticalAlign: 'middle' }}>
                          {i + 1}888
                        </td>
                        <td style={{ paddingLeft: '3.5rem', verticalAlign: 'middle' }}>
                          <i style={{ marginLeft: '-3rem' }} className='icon icarus-terminal-star' />
                          {route.StarSystem}
                        </td>
                        <td style={{ verticalAlign: 'middle' }} className='hidden-medium'>
                          <span className='text-muted'>{route.StarClass} Class</span><br />
                          {route.StarClass.match(/([OBAFGKM])/) ? 'Scoopable' : <span className='text-muted'>Not Scoopable</span>}
                        </td>
                        <td className='text-right' style={{ verticalAlign: 'middle' }}>
                          <span className='text-muted hidden-medium'>
                            Address {route.SystemAddress}<br />
                            {route.StarPos}
                          </span>
                          <span className='visible-medium'>
                            <span className={route.StarClass.match(/([OBAFGKM])/) ? '' : 'text-muted'}> {route.StarClass}</span>
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <hr />
              </>}
            {navRoute && navRoute.length > 0 &&
              <p className='text-primary text-muted text-center' style={{ margin: '1rem 0' }}>
                Select system to view stellar cartography
              </p>}
            <p className='text-primary text-muted text-center' style={{ margin: '1rem 0' }}>
              Set route using galaxy map
            </p>
          </div>
        </div>
      </Panel>
    </Layout>
  )
}