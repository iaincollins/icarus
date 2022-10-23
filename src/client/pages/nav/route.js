import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import animateTableEffect from 'lib/animate-table-effect'
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

  useEffect(animateTableEffect)
  
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
        <h2>Route Plan</h2>
        <table>
          <tbody>
            <tr style={{ background: 'none' }}>
              <td style={{ width: '50%', padding: '.5rem 0 0 0' }}>
                {navRoute?.currentSystem &&
                  <>
                    <h3 className='text-primary'>
                      <i className='icarus-terminal-location-filled text-secondary' style={{ position: 'relative', top: '.25rem', marginRight: '.5rem' }} />
                      Location
                    </h3>
                    <h2 className='navigation-panel__route-heading text-info'>
                      <CopyOnClick>{navRoute.currentSystem?.name}</CopyOnClick>
                    </h2>
                  </>}
              </td>
              <td style={{ width: '50%', padding: '.5rem 0 0 0' }} className='text-right'>
                {navRoute?.destination &&
                  <>
                    <h3 className='text-primary'>
                      <i className='icarus-terminal-route' style={{ position: 'relative', top: '.25rem', marginRight: '.5rem' }} />
                      Destination
                    </h3>
                    <h2 className='navigation-panel__route-heading text-info text-right'>
                      {navRoute?.destination?.distance > 0
                        ? <CopyOnClick>{navRoute?.destination?.system}</CopyOnClick>
                        : <span className='text-muted'>—</span>}
                    </h2>
                  </>}
              </td>
            </tr>
          </tbody>
        </table>
        <hr style={{ marginBottom: 0 }} />
        {navRoute?.route?.length > 0 &&
          <>
            <div className='scrollable' style={{ position: 'fixed', top: '20rem', bottom: '4.5rem', left: '5rem', right: '1rem' }}>
              <table className='navigation-panel__route-plan table--animated table--interactive'>
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
                        style={{top: '-.5rem', position: 'relative'}}
                      >
                        <td className='text-center' style={{ width: '3rem', paddingLeft: '.5rem', paddingRight: '.5rem' }}>
                          <span className={previouslyVistedSystem ? 'text-muted' : ''}>{i + 1}</span>
                        </td>
                        <td style={{ paddingLeft: '3.5rem' }}>
                          <div style={{ position: 'relative' }} className={previouslyVistedSystem ? 'text-muted' : ''}>
                            <i style={{ position: 'absolute', top: '.5rem', left: '-3rem', fontSize: '2rem' }} className={`icon ${icon} visible-medium`} />
                            <i style={{ position: 'absolute', top: '.4rem', left: '-3rem', fontSize: '2rem' }} className={`icon ${icon} hidden-medium`} />
                            <span className='text-info'>{route.system}</span>
                            <br/>
                            {route.numberOfStars > 0 && <span className='text-no-wrap'>
                              <span style={{marginRight: '1rem'}}>
                                <i className='icon icarus-terminal-star' style={{ position: 'relative', top: '.35rem', fontSize: '1.5rem'}}/> {route.numberOfStars}
                                <span className='hidden-small'> {route.numberOfStars === 1 ? 'Star' : 'Stars'}</span>
                              </span>
                              {route.numberOfPlanets > 0 && <>
                                <i className='icon icarus-terminal-planet' style={{ position: 'relative', top: '.35rem', fontSize: '1.5rem'}}/> {route.numberOfPlanets}
                                <span className='hidden-small'> {route.numberOfPlanets === 1 ? 'Planet' : 'Planets'}</span>
                              </>}
                            </span>}
                            {route.numberOfStars < 1 && <>
                              <span className='text-muted'>Unknown System</span>
                            </>}
                          </div>
                        </td>
                        <td className='text-no-wrap hidden-small hidden-medium'>
                            <span className='text-muted'>
                              {route.starClass.match(/^[DNH]/)
                                ? route.starClass.match(/^D/)
                                    ? 'White Dwarf'
                                    : route.starClass.match(/^N/)
                                      ? 'Neutron Star'
                                      : 'Black Hole'
                                : `${route.starClass} Class`
                              }
                              {route.starClass.match(/^[OBAFGKM]/) ? <><br/>Main Sequence</> : ''}
                            </span>
                        </td>
                        <td className='text-right' style={{ width: '1rem', paddingLeft: '.5rem', paddingRight: '.5rem' }}>
                          <span className={previouslyVistedSystem ? 'text-info text-muted' : 'text-info'}>
                            {route?.isExplored === false && <>
                              <i className='icarus-terminal-scan' style={{ position: 'relative', fontSize: '2rem', top: '.25rem', marginRight: '.5rem' }}/>
                              <br className='visible-small'/>
                            </>}
                          </span>
                          <span className={previouslyVistedSystem ? 'text-muted' : ''}>
                            {route.starClass.match(/^[OBAFGKM]/)
                              ? <i className='icarus-terminal-fuel' style={{ position: 'relative', fontSize: '2rem', top: '.25rem', marginRight: '.5rem' }} />
                              : route.starClass.match(/^[DNH]/) 
                                ? <i className='text-danger icarus-terminal-warning' style={{ position: 'relative', fontSize: '2rem', top: '.25rem', marginRight: '.5rem' }} />
                                : ''}
                            </span>
                        </td>
                        <td className='text-right' style={{ width: '1rem' }}>
                          <span className={previouslyVistedSystem ? 'text-muted' : ''}>
                            {route?.isCurrentSystem === false && <span className=' text-no-wrap text-no-transform'>{route.distance.toLocaleString(undefined, { maximumFractionDigits: 2 })} Ly</span>}
                            {route?.isCurrentSystem === true && <span className='text-muted'>Current System</span>}
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
          <div className='text-primary text-uppercase text-center' style={{height: '2F.75rem', fontSize: '1.5rem', position: 'fixed', bottom: '.8rem', left: '5rem', right: '1rem', marginBottom: '.5rem' }}>
            <hr className='small' style={{ marginTop: 0, marginBottom: '1rem' }} />
            {navRoute?.route?.length > 0 && navRoute?.jumpsToDestination > 0 &&
              <>
                {navRoute.inSystemOnRoute && <>
                  {navRoute.jumpsToDestination === 1 ? `${navRoute.jumpsToDestination} jump` : `${navRoute.jumpsToDestination} jumps`}
                  <span className='text-muted'> / </span>
                </>}
                {navRoute.destination.distance.toLocaleString(undefined, { maximumFractionDigits: 2 })} Ly
                {' '}<span className='text-muted hidden-small'>to destination</span>
              </>}
            {navRoute?.route?.length > 0 && navRoute?.jumpsToDestination === 0 &&
              <>Arrived at destination</>}
        </div>
        {navRoute?.route?.length === 0 &&
          <div className='text-center-both' style={{zIndex: '30', pointerEvents: 'none' }}>
            <h2 className='text-primary'>
              NO ROUTE SET<br />
              <span className='text-muted' style={{ fontSize: '1.5rem' }}>Use galaxy map to plot route</span>
            </h2>
          </div>
        }
      </Panel>
    </Layout>
  )
}
