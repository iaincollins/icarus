import { useState, useEffect, useRef } from 'react'
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
  const [scrolled, setScrolled] = useState(false)
  const [navRoute, setNavRoute] = useState()
  const [system, setSystem] = useState()
  const currentSystemRef = useRef(null)

  // Scroll to current route once, on view load
  useEffect(() => {
    if (!scrolled && currentSystemRef?.current) {
      currentSystemRef?.current?.scrollIntoView()
      setScrolled(true)
    }
  }, [navRoute])

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
    // TODO Check destination system and only update navroute if different
    // to current destination and if it is then execute setScrolled(false) so
    // that the route scroll position will update
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
      <Panel scrollable layout='full-width' navigation={NavPanelNavItems('Route', query)} search={search}>
        <table>
          <tbody>
            <tr style={{ background: 'none' }}>
              <td style={{ width: '50%', padding: 0 }}>
                {navRoute?.currentSystem &&
                  <>
                    <h3 className='text-primary'>Location</h3>
                    <h2 className='navigation-panel__route-heading text-info'>
                      <i className='icarus-terminal-system-orbits' style={{ position: 'relative', top: '.25rem', marginRight: '.5rem' }} />
                      <CopyOnClick>{navRoute.currentSystem?.name}</CopyOnClick>
                    </h2>
                  </>}
              </td>
              <td style={{ width: '50%', padding: 0 }} className='text-right'>
                {navRoute?.destination &&
                  <>
                    <h3 className='text-primary'>Destination</h3>
                    <h2 className='navigation-panel__route-heading text-info text-right'>
                      {navRoute?.destination?.distance > 0
                        ? <>
                          <i className='icarus-terminal-system-orbits' style={{ position: 'relative', top: '.25rem', marginRight: '.5rem' }} />
                          <CopyOnClick>{navRoute?.destination?.system}</CopyOnClick>
                          </>
                        : <span className='text-muted'>—</span>}
                    </h2>
                  </>}
              </td>
            </tr>
          </tbody>
        </table>
        <p className='text-primary text-uppercase text-center' style={{ margin: '.5rem 0', fontSize: '1.5rem', lineHeight: '1.5rem' }}>
          {navRoute?.route?.length > 0 && navRoute?.jumpsToDestination > 0 &&
            <>
              {navRoute.destination.distance.toLocaleString(undefined, { maximumFractionDigits: 2 })} Ly
              {' '}
              {navRoute.inSystemOnRoute &&
                <>/ {navRoute.jumpsToDestination === 1 ? `${navRoute.jumpsToDestination} jump` : `${navRoute.jumpsToDestination} jumps`}</>}
              {' '}<span className='text-muted'>to destination</span>
            </>}
          {navRoute?.route?.length > 0 && navRoute?.jumpsToDestination === 0 &&
            <>Arrived at destination</>}
          {navRoute?.route?.length === 0 &&
            <span className='text-blink-slow'>Set route using galaxy map</span>}
        </p>
        {navRoute?.route?.length > 0 &&
          <>
            <hr style={{ marginBottom: 0 }} />
            <div className='scrollable' style={{ position: 'fixed', top: '19.5rem', bottom: '3.75rem', left: '5rem', right: '1rem' }}>
              <table className='table--animated table--interactive'>
                <tbody className='fx-fade-in'>
                  {navRoute.route.map((route, i) => {
                    const icon = route?.isCurrentSystem === true ? 'icarus-terminal-location-filled' : 'icarus-terminal-star'
                    const previouslyVistedSystem = navRoute?.inSystemOnRoute && (navRoute?.route?.length - navRoute.jumpsToDestination) > (i + 1)
                    return (
                      <tr
                        ref={route?.isCurrentSystem === true ? currentSystemRef : null}
                        key={`nav-route_${route.system}`}
                        className={`${route?.isCurrentSystem === true ? 'table__row--highlighted' : 'table__row--highlight-primary-hover'}`}
                        onClick={() => router.push({ pathname: '/nav/map', query: { system: route?.system?.toLowerCase() } })}
                      >
                        <td className='text-center' style={{ width: '3rem' }}>
                          <span className={previouslyVistedSystem ? 'text-muted' : ''}>{i + 1}</span>
                        </td>
                        <td style={{ paddingLeft: '3.5rem' }}>
                          <div style={{ position: 'relative' }} className={previouslyVistedSystem ? 'text-muted' : ''}>
                            <i style={{ position: 'absolute', top: '.5rem', left: '-3rem', fontSize: '2rem' }} className={`icon ${icon} visible-medium`} />
                            <i style={{ position: 'absolute', top: '.4rem', left: '-3rem', fontSize: '2rem' }} className={`icon ${icon} hidden-medium`} />
                            <span>{route.system} </span>
                            <br /><span className='text-muted'>{route.starClass} Class, </span>
                            {route.starClass.match(/^[OBAFGKM]/) ? 'Fuel Star' : <span className='text-muted'>Not Fuel Star</span>}
                            <span className='visible-medium'>
                              {route?.isCurrentSystem === false && <span><br />{route.distance.toLocaleString(undefined, { maximumFractionDigits: 2 })} Ly</span>}
                              {route?.isCurrentSystem === true && <><br />Current Location</>}
                            </span>
                          </div>
                        </td>
                        <td className='hidden-medium text-right'>
                          <span className={previouslyVistedSystem ? 'text-muted' : ''}>
                            {route?.isCurrentSystem === false && <span className='text-no-transform'>{route.distance.toLocaleString(undefined, { maximumFractionDigits: 2 })} Ly</span>}
                            {route?.isCurrentSystem === true && <>Current Location</>}
                          </span>
                        </td>
                        <td className='text-center' style={{ width: '1rem' }}>
                          <i className='icon icarus-terminal-chevron-right' style={{ fontSize: '1rem' }} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>}
        {navRoute?.route?.length > 0 &&
          <div style={{ position: 'fixed', bottom: '.75rem', left: '5rem', right: '1rem' }}>
            <hr className='small' style={{ marginTop: 0, marginBottom: '.75' }} />
            <p className='text-primary text-muted text-center'>
              Set route using galaxy map
            </p>
          </div>}
      </Panel>
    </Layout>
  )
}
