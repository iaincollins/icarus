import { useState, useEffect } from 'react'
import SystemMap from './system-map'

export default function NavigationSystemMapPanel ({ system, systemObject, setSystemObject, getSystem }) {
  if (!system) return null

  const [searchValue, setSearchValue] = useState('')
  const [searchInputVisible, setSearchInputVisible] = useState(false)

  useEffect(() => {
    document.addEventListener('click', onClickHandler)
    return () => document.removeEventListener('click', onClickHandler)
    function onClickHandler (event) {
      if (!event?.target?.id.startsWith('navigation-panel__system-map-search-')) {
        setSearchInputVisible(false)
      }
    }
  }, [])

  return (
    <div className={`navigation-panel__map ${systemObject ? 'navigation-panel__map--inspector' : ''}`}>
      {(!system.stars || system.stars.length < 2) &&
        <div
          className='text-primary text-blink-slow text-center text-center-vertical'
          style={{ zIndex: '30', pointerEvents: 'none' }}
        >
          <h2>No system information</h2>
        </div>}
      <form
        id='navigation-panel__system-map-search-form'
        className='navigation-panel__system-map-search-form'
        onSubmit={(event) => {
          event.preventDefault()
          const el = document.getElementById('navigation-panel__system-map-search-input')
          getSystem(el.value) // Get system
          setSearchInputVisible(false) // Hide control after submission
          setSearchValue() // Reset input contents after submission
        }}
        autoComplete='off'
      >
        {searchInputVisible &&
          <>
            <input
              id='navigation-panel__system-map-search-input'
              className='navigation-panel__system-map-search-input input--secondary'
              type='text'
              placeholder='Enter system name…'
              onFocus={() => {
                const el = document.getElementById('navigation-panel__system-map-search-input')
                el.select()

                // Work around to remove focus from selected item to avoid weird behaviour on mobile devices 
                // as there isn't enough room on screen to also display a panel when there is an on screen
                // virtual keyboard on screen
                setSystemObject(null)
              }}
              value={searchValue}
              autoFocus
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <button id='navigation-panel__system-map-search-button' type='submit' className='button--active button--secondary'>Search</button>
          </>}
        {!searchInputVisible &&
          <button
            id='navigation-panel__system-map-search-toggle'
            className='button--icon button--secondary'
            onClick={() => { setSearchInputVisible(true) }}
          >
            <i className='icon icarus-terminal-search' />
          </button>}
      </form>
      <div className='navigation-panel__map-background'>
        <div className='navigation-panel__map-foreground scrollable'>
          <SystemMap system={system} setSystemObject={setSystemObject} />
        </div>
      </div>
    </div>
  )
}
