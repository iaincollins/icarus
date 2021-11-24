import { toggleFullScreen } from 'lib/window'
import Loader from 'components/loader'
import Panel from 'components/panel'
import JournalPanel from 'components/panels/journal'
import { useSocket } from 'components/socket'

export default function IndexPage () {
  const { connected } = useSocket()

  return (
    <>
      <Loader visible={!connected} />
      <Panel visible={connected}>
        <h2 style={{ padding: '1rem 0' }}>ICARUS Terminal</h2>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <button onClick={toggleFullScreen}>Toggle Fullscreen</button>
        </div>
        <div className='scrollable' style={{ position: 'absolute', top: '5rem', bottom: '1rem', left: '1rem', right: '1rem' }}>
          <JournalPanel />
        </div>
      </Panel>
    </>
  )
}
