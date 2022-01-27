import SystemMapObject from './system-map-object'

export default function SystemMapStar ({ star, setSystemObject }) {
  if (star.type === 'Null' && (!star._children || star._children.length === 0)) return null

  let useLargerViewBox = false
  if (star.rings) useLargerViewBox = true
  if (star.subType === 'Neutron Star') useLargerViewBox = true
  if (star?.subType?.startsWith('White Dwarf')) useLargerViewBox = true
  if (star.subType === 'Black Hole') useLargerViewBox = true

  // Modify subType to include full spectral class where known and matches
  // e.g. display 'B7 (Blue-White) Star' instead of just 'B (Blue-White) Star'
  let starDescription =  star?.subType
  if (star?.subType && star?.spectralClass && String(star?.subType?.charAt(0) + star?.subType?.charAt(1)).trim() === star?.spectralClass?.charAt(0)) {
    starDescription = <>{star.subType.replace(star.subType.charAt(0), star.spectralClass)}</>
  }

  return (
    <div
      className='system-map__planetary-system'
      data-stellar-objects-horizontal={star._children.length}
      data-stellar-objects-vertical={star._maxObjectsInOrbit}
    >
      <div
        onClick={() => setSystemObject(star)}
        className={`system-map__planetary-system-star ${star.id ? 'system-map__planetary-system-star--icon' : '0'}`}
      >
        {star.id &&
          <div className='system-map__planetary-system-star-icon'>
            <svg viewBox={useLargerViewBox ? '-4500 -4500 8500 8000' : '-2500 -2500 5000 5000'} preserveAspectRatio='xMinYMid meet'>
              <SystemMapObject systemObject={star} setSystemObject={setSystemObject} labels={false} />
            </svg>
          </div>}
        <h2>
          <span className='fx-animated-text' data-fx-order='4'>
            {star.type !== 'Null'
              ? '' // <i className='icon icarus-terminal-star' />
              : <i className='icon icarus-terminal-system-bodies' />} {star.name}
          </span>
        </h2>
        <h3>
          <span className='fx-animated-text text-primary' data-fx-order='5'>
            {star.type === 'Null'
              ? <>Rogue <span className='text-muted'>//</span> Extrasolar <span className='text-muted'>//</span> Circumbinary</>
              : starDescription
            }
          </span>
        </h3>
        {star.numberOfPlanets > 0 &&
          <h4>
            <span className='fx-animated-text text-primary' data-fx-order='6'>
              {star.numberOfPlanets === 1 ? '1 body found orbit' : `${star.numberOfPlanets} bodies found in orbit`}
            </span>
          </h4>}
        {star.numberOfPlanets === 0 &&
          <h4>
            <span className='fx-animated-text text-primary text-muted' data-fx-order='6'>
              No bodies found in orbit
            </span>
          </h4>}
      </div>
      {star._children && star._children.length > 0 &&
        <div className='system-map__planetary-system-map' style={{ opacity: 1 }}>
          <svg
            viewBox={star._viewBox.join(' ')}
            preserveAspectRatio='xMinYMid meet'
          >
            {star._children && star._children.length > 0 &&
              <line
                x1={star._children[0]._x}
                y1={star._children[0]._y}
                x2={star._children[star._children.length - 1]._x}
                y2={star._children[star._children.length - 1]._y}
                stroke='var(--color-system-map-line)'
                strokeWidth='125'
                opacity='0.25'
              />}
            {star._children.map((systemObject, i) =>
              <g key={`system-map-object_${star.name}_${star.id}_${systemObject.id}`}>
                {systemObject._children && systemObject._children.length > 0 &&
                  <line
                    x1={systemObject._x}
                    y1={systemObject._y}
                    x2={systemObject._children[systemObject._children.length - 1]._x}
                    y2={systemObject._children[systemObject._children.length - 1]._y}
                    stroke='var(--color-system-map-line)'
                    strokeWidth='75'
                    opacity='0.25'
                  />}
                <SystemMapObject systemObject={systemObject} setSystemObject={setSystemObject} parentSystemObject={star} />
                {(systemObject?._children ?? []).map((itemInOrbit, i) =>
                  <SystemMapObject key={`system-map-object_${itemInOrbit.id}`} systemObject={itemInOrbit} setSystemObject={setSystemObject} />
                )}
              </g>
            )}
          </svg>
        </div>}
    </div>
  )
}
