import { Toaster } from 'react-hot-toast';
import Header from 'components/header'
import Loader from 'components/loader'

export default function Layout ({ children, connected, active, ready = true, loader = false, className = '' }) {
  return (
    <div className='layout'>
      <Toaster
        position='bottom-right'
        toastOptions={{
          className: 'text-uppercase',
          style: {
            borderRadius: '0',
            border: '.2rem solid var(--color-primary)',
            background: '#000',
            color: 'var(--color-primary)',
            maxWidth: '400px',
            textAlign: 'left !important',
            margin: '0 1rem'
          }
        }}
      />
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
