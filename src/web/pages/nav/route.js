import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { NavPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'
import CopyOnClick from 'components/copy-on-click'

export default function NavListPage () {
  const router = useRouter()
  const { query } = router
  const { connected, active, ready } = useSocket()
  const [componentReady, setComponentReady] = useState(false)
  const [navRoute, setNavRoute] = useState()
  const [system, setSystem] = useState()

  const search = async (searchInput) => {
    router.push({ pathname: '/nav/map', query: { system: searchInput.toLowerCase() } })
  }

  useEffect(async () => {
    if (!connected || !router.isReady) return
    const [newSystem, newNavRoute] = await Promise.all([
      sendEvent('getSystem', query.system ? { name: query.system, useCache: true } : null),
      sendEvent('getNavRoute')
    ])
    if (newSystem) setSystem(newSystem)
    if (newNavRoute) setNavRoute(newNavRoute)
    setComponentReady(true)
  }, [connected, ready, router.isReady])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Location', 'FSDJump'].includes(log.event)) {
      const newNavRoute = await sendEvent('getNavRoute')
      if (newNavRoute) setNavRoute(newNavRoute)
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

  // FIXME When entering an undiscovered system and it is the destination system
  // all systems on the route list show as the 'current system' and are
  // highlighted in the secondary theme color.

  return (
    <Layout connected={connected} active={active} ready={ready} loader={!componentReady}>
      <Panel scrollable layout='full-width' navigation={NavPanelNavItems('Route', query)} search={search}>
        <table>
          <tbody>
            <tr style={{ background: 'none' }}>
              <td style={{ width: '50%', padding: 0 }}>
                {navRoute?.currentSystem &&
                  <>
                    <h3 className='text-primary'>
                      Location
                    </h3>
                    <h2 className='text-info'><CopyOnClick>{navRoute.currentSystem?.name}</CopyOnClick></h2>
                  </>}
              </td>
              <td style={{ width: '50%', padding: 0 }} className='text-right'>
                {navRoute?.destination?.distance > 0 &&
                  <>
                    <h3 className='text-primary'>
                      Destination
                    </h3>
                    <h2 className='text-info text-right'><CopyOnClick>{navRoute?.destination?.system}</CopyOnClick></h2>
                  </>}
              </td>
            </tr>
          </tbody>
        </table>
        {navRoute?.route?.length > 0 && navRoute?.jumpsToDestination > 0 &&
          <p className='text-primary text-uppercase text-center' style={{ margin: '1rem 0' }}>
            {navRoute.destination.distance.toLocaleString(undefined, { maximumFractionDigits: 2 })} Ly
            {' '}
            {navRoute.inSystemOnRoute &&
              <>({navRoute.jumpsToDestination === 1 ? `${navRoute.jumpsToDestination} jump` : `${navRoute.jumpsToDestination} jumps`})</>}
            {' '}to destination
          </p>}
        {navRoute?.inSystemOnRoute === false &&
          <p className='text-info text-center' style={{ margin: '1rem 0' }}>
            Use the galaxy map to plot a new route.
          </p>}
        {navRoute?.route?.length > 0 &&
          <>
            <hr style={{ marginBottom: 0 }} />
            <table className='table--animated table--interactive'>
              <tbody className='fx-fade-in'>
                {navRoute.route.map((route, i) => {
                  const icon = route?.isCurrentSystem === true ? 'icarus-terminal-location-filled' : 'icarus-terminal-star'

                  return (
                    <tr
                      key={`nav-route_${route.system}`}
                      className={`${route?.isCurrentSystem === true ? 'table__row--highlighted' : 'table__row--highlight-primary-hover'}`}
                      onClick={() => router.push({ pathname: '/nav/map', query: { system: route?.system?.toLowerCase() } })}
                    >
                      <td className='text-center' style={{ width: '3rem' }}>
                        {i + 1}
                      </td>
                      <td style={{ paddingLeft: '3.5rem' }}>
                        <div style={{ position: 'relative' }}>
                          <i style={{ position: 'absolute', top: '.5rem', left: '-3rem', fontSize: '2rem' }} className={`icon ${icon} visible-medium`} />
                          <i style={{ position: 'absolute', top: '.4rem', left: '-3rem', fontSize: '2rem' }} className={`icon ${icon} hidden-medium`} />
                          <span>{route.system} </span>
                          <br /><span className='text-muted'>{route.starClass} Class, </span>
                          {route.starClass.match(/([OBAFGKM])/) ? 'Fuel Star' : <span className='text-muted'>Not Fuel Star</span>}
                          <span className='visible-medium'>
                            {route?.isCurrentSystem === false && <span><br />{route.distance.toLocaleString(undefined, { maximumFractionDigits: 2 })} Ly</span>}
                            {route?.isCurrentSystem === true && <><br />Current Location</>}
                          </span>
                        </div>
                      </td>
                      <td className='hidden-medium text-right'>
                        {route?.isCurrentSystem === false && <span className='text-no-transform'>{route.distance.toLocaleString(undefined, { maximumFractionDigits: 2 })} Ly</span>}
                        {route?.isCurrentSystem === true && <>Current Location</>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <hr className='small' style={{ marginTop: 0 }} />
          </>}
        {navRoute &&
          <p className='text-primary text-muted text-center' style={{ margin: '1rem 0' }}>
            Set route using galaxy map
          </p>}
      </Panel>
    </Layout>
  )
}
