import SystemMap from 'components/system-map/system-map'

export default function NavigationSystemMapPanel ({ system, setSystemObject, getSystem }) {
  if (!system) return null

  return (
    <div className='navigation-panel__map' style={{ display: 'block' }}>
      <form
        className='navigation-panel__system-map-search-form'
        onSubmit={(e) => {
          /* This is nasty and hacky, but a temporary wau to add a search
              control until the search bar component has been built */
          e.preventDefault()
          const el = document.getElementById('navigation-panel__system-map-search-input')
          getSystem(el.value.toLowerCase())
          el.value = ''
          const oldWidth = el.style.width
          el.style.width = '1rem'
          el.blur()
          setTimeout(() => {
            const el = document.getElementById('navigation-panel__system-map-search-input')
            el.style.width = oldWidth
          }, 1000)
        }}
        onMouseOver={() => {
          const el = document.getElementById('navigation-panel__system-map-search-input')
          el.select()
        }}
        onMouseLeave={() => {
          const el = document.getElementById('navigation-panel__system-map-search-input')
          el.blur()
        }}
        autoComplete='off'
      >
        <input
          id='navigation-panel__system-map-search-input'
          className='navigation-panel__system-map-search-input'
          type='text'
          placeholder='> Enter system name…'
          onFocus={() => {
            const el = document.getElementById('navigation-panel__system-map-search-input')
            el.select()
          }}
        />
        <button className='button--active'>Search</button>
      </form>
      <div className='navigation-panel__map-background'>
        <div className='navigation-panel__map-foreground scrollable'>
          <SystemMap system={system} setSystemObject={setSystemObject} />

        </div>
      </div>
    </div>
  )
}
