import { useState, useEffect } from 'react'
import animateTableEffect from 'lib/animate-table-effect'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { EngineeringPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'
import Materials from 'components/panels/eng/materials'

export default function EngineeringMaterialsPage () {
  const { connected, active, ready } = useSocket()
  const [materials, setMaterials] = useState()

  useEffect(animateTableEffect)
  
  useEffect(async () => {
    if (!connected) return
    setMaterials(await sendEvent('getMaterials'))
  }, [connected, ready])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Materials', 'MaterialCollected', 'MaterialDiscarded', 'MaterialTrade', 'EngineerCraft'].includes(log.event)) {
      setMaterials(await sendEvent('getMaterials'))
    }
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' scrollable navigation={EngineeringPanelNavItems('Xeno Materials')}>
        <h2>Xeno Materials</h2>
        <h3 className='text-primary'>Guardian and Thargoid Technology</h3>
        <p className='text-primary'>
          Alien technology can be used in synthesis and exchanged with Technology Brokers
        </p>
        {materials && <Materials materialType='Xeno' materials={materials} />}
      </Panel>
    </Layout>
  )
}
