import { useSocket } from 'components/socket'
import Loader from 'components/loader'
import Panel from 'components/panel'
import packageJson from '../../../package.json'

export default function IndexPage () {
  const { connected } = useSocket()
  return (
    <>
      <Loader visible={!connected} />
      <Panel visible={connected}>
        <h1>ICARUS</h1>
        <p>
          <button onClick={() => window.app_newWindow()}>New Terminal</button>
        </p>
        <p>
          <button disabled>Settings</button>
        </p>
        <p>
          <button onClick={() => window.app_quit()}>Quit Application</button>
        </p>
        <p>
          <small>Preview Build {packageJson.version}</small>
        </p>
      </Panel>
    </>
  )
}
