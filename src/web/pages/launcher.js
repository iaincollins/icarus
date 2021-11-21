import { useState, useEffect } from 'react'
import { useSocket } from 'components/socket'
import Loader from 'components/loader'
import Panel from 'components/panel'
import packageJson from '../../../package.json'

export default function IndexPage () {
  const { connected, sendEvent } = useSocket()
  const [hostInfo, setHostInfo] = useState()

  useEffect(async () => {
    setHostInfo(await sendEvent('hostInfo'))
  }, [])

  return (
    <>
      <Loader visible={!connected} />
      <Panel visible={connected}>
        <h1>ICARUS</h1>
        <h3 className='text-primary'>Version {packageJson.version}</h3>
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}>
          <button onClick={() => window.app_newWindow()}>New Terminal</button>
        </div>
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
          <p className='text-muted'>Connect remotely:</p>
          <ul>
            {hostInfo && hostInfo.urls.map(url =>
              <li key={url} className="selectable">{url}</li>
            )}
          </ul>
        </div>
      </Panel>
    </>
  )
}
