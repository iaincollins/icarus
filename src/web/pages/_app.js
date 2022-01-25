import { Toaster } from 'react-hot-toast'
import '../public/fonts/icarus-terminal/icarus-terminal.css'
import '../css/main.css'

import { SocketProvider } from 'lib/socket'

export default function MyApp ({ Component, pageProps }) {
  return (
    <SocketProvider>
      <Toaster
        position='bottom-right'
        toastOptions={{
          duration: 8000,
          className: 'notification text-uppercase text-primary',
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
      <Component {...pageProps} />
    </SocketProvider>
  )
}
