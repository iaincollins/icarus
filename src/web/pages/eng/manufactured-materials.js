import { useState, useEffect } from 'react'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { EngineeringPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'
import Materials from 'components/panels/eng/materials'

export default function EngineeringMaterialsPage () {
  const { connected, active, ready } = useSocket()
  const [materials, setMaterials] = useState()

  useEffect(async () => {
    if (!connected) return
    setMaterials(await sendEvent('getMaterials'))
  }, [connected, ready])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Materials', 'MaterialCollected', 'MaterialDiscarded'].includes(log.event)) {
      setMaterials(await sendEvent('getMaterials'))
    }
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' scrollable navigation={EngineeringPanelNavItems('Manufactured Materials')}>
        <h2>Manufactured Materials</h2>
        <h3 className='text-primary'>For engineering and synthesis</h3>
        {materials && <Materials materialType='Manufactured' materials={materials} />}
      </Panel>
    </Layout>
  )
}
