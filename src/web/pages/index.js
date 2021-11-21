import { toggleFullScreen } from 'lib/window'
import { useSocket } from 'components/socket'
import Loader from 'components/loader'
import Panel from 'components/panel'

export default function IndexPage () {
  const { connected } = useSocket()
  return (
    <>
      <Loader visible={!connected} />
      <Panel visible={connected}>
        <h3>ICARUS Terminal</h3>
        <p>
          <button onClick={toggleFullScreen}>Toggle Fullscreen</button>
        </p>
      </Panel>
    </>
  )
}
