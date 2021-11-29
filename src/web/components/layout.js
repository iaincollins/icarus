import Toolbar from 'components/toolbar'
import Loader from 'components/loader'

export default function Layout ({ children, connected, active, activeNavButton }) {
  return (
    <div className='layout'>
      <Loader visible={!connected} />
      <header>
        <Toolbar connected={connected} active={active} activeNavButton={activeNavButton} />
      </header>
      <div className='layout__main' style={{ opacity: connected ? 1 : 0 }}>
        {children}
      </div>
    </div>
  )
}

Layout.defaultProps = {
  connected: false,
  active: false
}
