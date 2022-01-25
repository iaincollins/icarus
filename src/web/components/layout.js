import { Toaster } from 'react-hot-toast'
import Header from 'components/header'
import Loader from 'components/loader'

export default function Layout ({ children, connected, active, ready = true, loader = false, className = '' }) {
  return (
    <>
      <Toaster
      position='bottom-right'
      toastOptions={{
        duration: 8000,
        className: 'text-uppercase text-primary',
        style: {
          borderRadius: '0',
          border: '.2rem solid var(--color-primary)',
          background: 'var(--color-background-panel)',
          color: 'var(--color-info)',
          minWidth: '300px',
          maxWidth: '420px',
          textAlign: 'left !important',
          margin: '0 1rem'
        }
      }}
    />
      <div className='layout'>
        <Loader visible={!connected || !ready || loader} />
        <Header connected={connected} active={active || !ready} />
        <div className={`layout__main ${className}`} style={{ opacity: connected && ready ? 1 : 0 }}>
          {children}
        </div>
      </div>
    </>
  )
}

Layout.defaultProps = {
  connected: false,
  active: false
}
