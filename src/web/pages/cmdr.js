import { useState } from 'react'
import { useSocket } from 'lib/socket'
import Layout from 'components/layout'
import Panel from 'components/panel'


export default function CmdrPage () {
  const COMMANDER_VIEW = 'COMMANDER_VIEW'
  const FINANCE_VIEW = 'FINANCE_VIEW'
  const MATERIALS_VIEW = 'MATERIALS_VIEW'

  const { connected, active } = useSocket()
  const [view, setView] = useState(COMMANDER_VIEW)

  return (
    <Layout connected={connected} active={active}>
      <Panel layout='full-width' navigationItems={[
    {
      icon: 'commander',
      onClick: () => setView(COMMANDER_VIEW),
      active: view === COMMANDER_VIEW
    },
    {
      icon: 'credits',
      onClick: () => setView(FINANCE_VIEW),
      active: view === FINANCE_VIEW
    },
    {
      icon: 'engineering',
      onClick: () => setView(MATERIALS_VIEW),
      active: view === MATERIALS_VIEW
    }
  ]} scrollable>
        <h2>Cmdr</h2>
      </Panel>
    </Layout>
  )
}
