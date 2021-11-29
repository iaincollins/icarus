import Toolbar from 'components/toolbar'
import Loader from 'components/loader'

export default function Layout ({ children, connected, active, ready = true }) {
  return (
    <div className='layout'>
      <Loader visible={!connected || !ready} />
      <header>
        <Toolbar connected={connected} active={active || !ready} />
      </header>
      <div className='layout__main' style={{ opacity: connected && ready ? 1 : 0 }}>
        {children}
      </div>
    </div>
  )
}

Layout.defaultProps = {
  connected: false,
  active: false
}
