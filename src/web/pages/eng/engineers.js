import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import distance from '../../../shared/distance'
import { UNKNOWN_VALUE } from '../../../shared/consts'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { EngineeringPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'
import CopyOnClick from 'components/copy-on-click'

export default function EngineeringEngineersPage () {
  const router = useRouter()
  const { query } = router
  const { connected, active, ready } = useSocket()
  const [currentSystem, setCurrentSystem] = useState()
  const [engineers, setEngineers] = useState()
  const [componentReady, setComponentReady] = useState(false)

  useEffect(async () => {
    if (!connected || !router.isReady) return

    // Always refetch list of engineers to ensure up to date
    const newEngineers = await sendEvent('getEngineers')
    setEngineers(newEngineers)

    // Always refetch current system
    const newSystem = await sendEvent('getSystem')
    if (newSystem?.address) setCurrentSystem(newSystem)
    setComponentReady(true)
  }, [connected, ready, router.isReady, query])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Location', 'FSDJump'].includes(log.event)) {
      const newSystem = await sendEvent('getSystem')
      if (newSystem?.address) setCurrentSystem(newSystem)
    }
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready} loader={!componentReady}>
      <Panel layout='full-width' scrollable navigation={EngineeringPanelNavItems('Engineers')}>
        <h2>Engineers</h2>
        <h3 className='text-primary'>Ship weapons and module modification</h3>

        {engineers && engineers.length > 0 &&
          <>
            <div className='section-heading'>
              <h4 className='section-heading__text' style={{ marginTop: '1rem' }}>Engineers</h4>
            </div>
            <table className='table--animated'>
              <tbody className='fx-fade-in'>
                {engineers.map(engineer =>
                  <tr
                    key={`engineer_${engineer.name}`}
                    tabIndex={2}
                    //className='table__row--highlighted'
                    onFocus={() => {
                      ///router.push({ pathname: '/eng/blueprints', query: { symbol: blueprint.symbol } })
                    }}
                  >
                    <td>
                      <h4 className={engineer.progress.rank > 0 ? 'text-primary' : 'text-muted'}>
                        <CopyOnClick>{engineer.name}</CopyOnClick>
                      </h4>
                      {engineer.progress.rank === 0 && <>
                        {engineer.progress.status === UNKNOWN_VALUE
                          ? <p className='text-danger text-muted'>Locked</p>
                          : <p className='text-info text-muted'>{engineer.progress.status}</p>
                        }
                      </>}
                      {engineer.progress.rank > 0 &&
                        <h4 className='text-secondary'>
                          {[...Array(engineer.progress.rank)].map((j, i) =>
                            <i
                              style={{ fontSize: '1.5rem', width: '1.5rem', display: 'inline-block', marginRight: '0.1rem', marginTop: '.25rem' }}
                              key={`${engineer.name}_rank_${i}`}
                              className='icon icarus-terminal-engineering'
                            />
                          )}
                        </h4>
                      }
                    </td>
                    <td className='text-right'>
                      <span className='text-right'>
                        <CopyOnClick>{engineer.system.name}</CopyOnClick>
                      </span>
                      {currentSystem?.position &&
                        <span className='text-muted text-no-transform'>
                          <span className='visible-medium'><br /></span>
                          {' '}
                          {distance(currentSystem.position, engineer.system.position).toLocaleString(undefined, { maximumFractionDigits: 0 })} Ly
                        </span>}
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>}
      </Panel>
    </Layout>
  )
}
