import { useState, useEffect } from 'react'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { useSocket } from 'lib/socket'

export default function NavPage () {
  const { connected, active, sendEvent } = useSocket()
  const [ready, setReady] = useState(false)
  const [system, setSystem] = useState()

  useEffect(async () => {
    if (!connected) return
    setReady(false)
    setSystem(await sendEvent('getSystem'))
    setReady(true)
  }, [connected])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' scrollable>
        {system &&
          <pre
            className='selectable' dangerouslySetInnerHTML={{
              __html: `${JSON.stringify(system, null, 2)}`
            }}
          />}
      </Panel>
    </Layout>
  )
}
