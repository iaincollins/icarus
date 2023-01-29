import App from 'next/app'
import { Toaster } from 'react-hot-toast'
import { SocketProvider, eventListener } from 'lib/socket'
import { loadColorSettings, saveColorSettings } from 'components/settings'
import '../public/fonts/icarus-terminal/icarus-terminal.css'
import '../css/main.css'

const handleKeyPress = (event) => {
  const element = document.activeElement.tagName

  // Check for focus on input elements
  if (element.toLowerCase() === 'input') {
    // If ESC is pressed, then remove focus from input
    if (event.key === 'Escape') document.body.click()
    
    // If UP or DOWN arrow is pressed then remove focus
    if (['ArrowUp', 'ArrowDown'].includes(event.key)) document.body.click()

    return
  }

  try {
    switch(event.key) {
      case "1":
        if (event.getModifierState('Alt')) {
          return document.querySelector(`#secondaryNavigation button[data-secondary-navigation='1']`).click() 
        } else {
          return document.querySelector(`#primaryNavigation button[data-primary-navigation='1']`).click()
        }
      case "2":
        if (event.getModifierState('Alt')) {
          return document.querySelector(`#secondaryNavigation button[data-secondary-navigation='2']`).click() 
        } else {
          return document.querySelector(`#primaryNavigation button[data-primary-navigation='2']`).click()
        }
      case "3":
        if (event.getModifierState('Alt')) {
          return document.querySelector(`#secondaryNavigation button[data-secondary-navigation='3']`).click() 
        } else {
          return document.querySelector(`#primaryNavigation button[data-primary-navigation='3']`).click()
        }
      case "4":
        if (event.getModifierState('Alt')) {
          return document.querySelector(`#secondaryNavigation button[data-secondary-navigation='4']`).click() 
        } else {
          return document.querySelector(`#primaryNavigation button[data-primary-navigation='4']`).click()
        }
      case "5":
        if (event.getModifierState('Alt')) {
          return document.querySelector(`#secondaryNavigation button[data-secondary-navigation='5']`).click() 
        } else {
          return document.querySelector(`#primaryNavigation button[data-primary-navigation='5']`).click()
        }
      case "6":
        if (event.getModifierState('Alt')) {
          return document.querySelector(`#secondaryNavigation button[data-secondary-navigation='6']`).click() 
        } else {
          return document.querySelector(`#primaryNavigation button[data-primary-navigation='6']`).click()
        }
      case "6":
        if (event.getModifierState('Alt')) {
          return document.querySelector(`#secondaryNavigation button[data-secondary-navigation='7']`).click() 
        } else {
          return document.querySelector(`#primaryNavigation button[data-primary-navigation='7']`).click()
        }
      case "ArrowUp":
        if (!document.querySelector('#secondaryNavigation')) return
        const previousSecondaryButtonNumber = parseInt(document.querySelector('#secondaryNavigation button.button--active').dataset.secondaryNavigation) - 1
        const previousSecondaryButton = document.querySelector(`#secondaryNavigation button[data-secondary-navigation='${previousSecondaryButtonNumber}']`)
        if (previousSecondaryButton) previousSecondaryButton.click()
        return
      case "ArrowDown":
        if (!document.querySelector('#secondaryNavigation')) return
        const nextSecondaryButtonNumber = parseInt(document.querySelector('#secondaryNavigation button.button--active').dataset.secondaryNavigation) + 1
        const nextSecondaryButton = document.querySelector(`#secondaryNavigation button[data-secondary-navigation='${nextSecondaryButtonNumber}']`)
        if (nextSecondaryButton) nextSecondaryButton.click()
        return
      case "ArrowLeft":
        const previousPrimaryButtonNumber = parseInt(document.querySelector('#primaryNavigation button.button--active').dataset.primaryNavigation) - 1
        const previousPrimaryButton = document.querySelector(`#primaryNavigation button[data-primary-navigation='${previousPrimaryButtonNumber}']`)
        if (previousPrimaryButton) previousPrimaryButton.click()
        return
      case "ArrowRight":
        const nextPrimaryButtonNumber = parseInt(document.querySelector('#primaryNavigation button.button--active').dataset.primaryNavigation) + 1
        const nextPrimaryButton = document.querySelector(`#primaryNavigation button[data-primary-navigation='${nextPrimaryButtonNumber}']`)
        if (nextPrimaryButton) nextPrimaryButton.click()
        return 
      default:
        //console.log(`Key pressed: ${event.key}`)
    }
  } catch (e) {
    //console.log(e)
  }
}

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

      document.addEventListener('keydown', handleKeyPress)
    } 
  }

  render () {
    const { Component, pageProps } = this.props
    return (
      <SocketProvider>
        <div id='notifications' style={{ transition: '1s all ease-in-out', position: 'fixed', zIndex: 9999 }}>
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
        </div>
        <Component {...pageProps} />
      </SocketProvider>
    )
  }
}
