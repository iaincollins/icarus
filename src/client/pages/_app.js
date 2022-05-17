import { Toaster } from 'react-hot-toast'
import { SocketProvider, eventListener } from 'lib/socket'
import App from 'next/app'
import { loadColorSettings, saveColorSettings } from 'components/color-picker'
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

      // Update theme settings (and save them) when sync message received
      eventListener('syncMessage', (event) => {
        if (event.name === 'colorSettings') {
          const colorSettings = event.message
          document.documentElement.style.setProperty('--color-primary-r', colorSettings.primaryColor.r)
          document.documentElement.style.setProperty('--color-primary-g', colorSettings.primaryColor.g)
          document.documentElement.style.setProperty('--color-primary-b', colorSettings.primaryColor.b)
          document.documentElement.style.setProperty('--color-primary-dark-modifier', colorSettings.primaryColor.modifier)
          document.documentElement.style.setProperty('--color-secondary-r', colorSettings.secondaryColor.r)
          document.documentElement.style.setProperty('--color-secondary-g', colorSettings.secondaryColor.g)
          document.documentElement.style.setProperty('--color-secondary-b', colorSettings.secondaryColor.b)
          document.documentElement.style.setProperty('--color-secondary-dark-modifier', colorSettings.secondaryColor.modifier)
          saveColorSettings()
        }
      })
    }
  }


  render () {
    const { Component, pageProps } = this.props
    return (
      <SocketProvider>
        <div id='notifications' style={{transition: '1s all ease-in-out', position: 'fixed', zIndex: 9999}}>
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
                boxShadow: '0 0 1rem black',
              }
            }}
          />
        </div>
        <Component {...pageProps} />
      </SocketProvider>
    )
  }
}
