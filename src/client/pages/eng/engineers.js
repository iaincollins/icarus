import { useState, useEffect, Fragment } from 'react'
import animateTableEffect from 'lib/animate-table-effect'
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
  const [componentReady, setComponentReady] = useState(false)
  const [currentSystem, setCurrentSystem] = useState()
  const [engineers, setEngineers] = useState()

  useEffect(animateTableEffect)
  
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
        <h3 className='text-primary'>Engineers &amp; Workshops</h3>

        <p className='text-primary'>
          Engineers can use Blueprints and Experimental Effects to improve ships and equipment
        </p>

        {engineers && engineers.length > 0 &&
          <>
            <div className='section-heading'>
              <h4 className='section-heading__text' style={{ marginTop: '1rem' }}>Unlocked Engineers</h4>
            </div>
            <ListEngineers
              engineers={engineers.filter(e => e.progress.status.toLowerCase() === 'unlocked')}
              currentSystem={currentSystem}
            />
            <div className='section-heading'>
              <h4 className='section-heading__text' style={{ marginTop: '1rem' }}>Known/Invited Engineers</h4>
            </div>
            <ListEngineers
              engineers={engineers.filter(e => e.progress.status !== UNKNOWN_VALUE && e.progress.status.toLowerCase() !== 'unlocked')}
              currentSystem={currentSystem}
            />
            <div className='section-heading'>
              <h4 className='section-heading__text' style={{ marginTop: '1rem' }}>Locked Engineers</h4>
            </div>
            <ListEngineers
              engineers={engineers.filter(e => e.progress.status === UNKNOWN_VALUE)}
              currentSystem={currentSystem}
            />
          </>}
      </Panel>
    </Layout>
  )
}

function ListEngineers ({ engineers, currentSystem }) {
  return (
    <>
      <table className='table--animated'>
        <tbody className='fx-fade-in'>
          {engineers?.length === 0 &&
            <tr>
              <td className='text-muted'>None</td>
            </tr>}
          {engineers?.length > 0 && engineers.map(engineer =>
            <tr
              key={`engineer_${engineer.name}`}
              tabIndex={2}
              // className='table__row--highlighted'
              onFocus={() => {
                /// router.push({ pathname: '/eng/blueprints', query: { symbol: blueprint.symbol } })
              }}
            >
              <td className={`text-primary text-center ${engineer.progress.status.toLowerCase() === 'unlocked' ? '' : 'text-muted'}`} style={{ width: '2rem' }}>
                <i
                  className='icon icarus-terminal-engineer'
                  style={{ fontSize: '1.75rem', lineHeight: '2rem', width: '2rem', display: 'inline-block' }}
                />
              </td>
              <td style={{ width: '18rem' }}>
                <h4 className={engineer.progress.status.toLowerCase() === 'unlocked' ? 'text-info' : 'text-info text-muted'}>
                  <CopyOnClick>{engineer.name}</CopyOnClick>
                </h4>
                {engineer.progress.rank === 0 && <>
                  {engineer.progress.status === UNKNOWN_VALUE
                    ? <p className='text-danger text-muted'>Locked</p>
                    : <p className={engineer.progress.status.toLowerCase() === 'unlocked' ? 'text-primary' : 'text-primary text-muted'}>{engineer.progress.status}</p>}
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
                  </h4>}
              </td>
              <td className='text-primary text-no-transform text-left hidden-small'>
                {engineer.description}
              </td>
              <td className='text-right'>
                <span className='text-right'>
                  <CopyOnClick>{engineer.system.name}</CopyOnClick>
                </span>
                {currentSystem?.position &&
                  <span className='text-muted text-no-transform'>
                    <br />
                    {distance(currentSystem.position, engineer.system.position).toLocaleString(undefined, { maximumFractionDigits: 0 })} Ly
                  </span>}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <hr className='small' style={{ marginTop: 0 }} />
    </>
  )
}
