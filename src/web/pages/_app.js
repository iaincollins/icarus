import { Toaster } from 'react-hot-toast'
import { SocketProvider } from 'lib/socket'
import App from 'next/app'
import { loadColorSettings } from 'components/color-picker'
import '../public/fonts/icarus-terminal/icarus-terminal.css'
import '../css/main.css'

export default class MyApp extends App {
  constructor (props) {
    super(props)
    if (typeof window !== 'undefined') {
      // Load settings at startup
      loadColorSettings()

      // Update settings in this window when they are changed in another window
      window.addEventListener('storage', (event) => {
        if (event.key === 'color-settings') { loadColorSettings() }
      })
    }
  }

  render () {
    const { Component, pageProps } = this.props
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
              margin: '0 1rem',
              boxShadow: '0 0 1rem black'
            }
          }}
        />
        <Component {...pageProps} />
      </SocketProvider>
    )
  }
}
