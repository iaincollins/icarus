import { useState, useEffect } from 'react'
import SystemMap from 'components/system-map/system-map'

export default function NavigationSystemMapPanel ({ system, setSystemObject, getSystem }) {
  if (!system) return null

  const [searchValue, setSearchValue] = useState('')
  const [searchInputVisible, setSearchInputVisible] = useState(false)

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
    function handleClick (event) {
      if (!event?.target?.id.startsWith('navigation-panel__system-map-search-')) {
        setSearchInputVisible(false)
      }
    }
  }, [])

  return (
    <div className='navigation-panel__map' style={{ display: 'block' }}>
      <form
        id='navigation-panel__system-map-search-form'
        className='navigation-panel__system-map-search-form'
        onSubmit={(event) => {
          event.preventDefault()
          const el = document.getElementById('navigation-panel__system-map-search-input')
          getSystem(el.value)
          setSearchInputVisible(false)
        }}
        autoComplete='off'
      >
        {searchInputVisible &&
          <>
            <input
              id='navigation-panel__system-map-search-input'
              className='navigation-panel__system-map-search-input'
              type='text'
              placeholder='Enter system name…'
              onFocus={() => {
                const el = document.getElementById('navigation-panel__system-map-search-input')
                el.select()
              }}
              value={searchValue}
              autoFocus
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <button id='navigation-panel__system-map-search-button' type='submit' className='button--active'>Search</button>
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
