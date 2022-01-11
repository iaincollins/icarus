import Header from 'components/header'
import Loader from 'components/loader'

export default function Layout ({ children, connected, active, ready = true, loader = false, className = '' }) {
  return (
    <div className='layout'>
      <Loader visible={!connected || !ready || loader} />
      <Header connected={connected} active={active || !ready} />
      <div className={`layout__main ${className}`} style={{ opacity: connected && ready ? 1 : 0 }}>
        {children}
      </div>
    </div>
  )
}

Layout.defaultProps = {
  connected: false,
  active: false
}
