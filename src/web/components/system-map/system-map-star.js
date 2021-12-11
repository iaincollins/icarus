import SystemMapObject from './system-map-object'

export default function SystemMapStar ({ star, setSystemObject }) {
  if (star.type === 'Null' && (!star._children || star._children.length === 0)) return null

  return (
    <div
      className='system-map__planetary-system'
      data-stellar-objects-horizontal={star._children.length}
      data-stellar-objects-vertical={star._maxObjectsInOrbit}
    >
      <h2>
        <span className='fx-animated-text' data-fx-order='4'>
          {star.type !== 'Null'
            ? <i className='icon icarus-terminal-star' />
            : <i className='icon icarus-terminal-system-bodies' />} {star.name}
        </span>
      </h2>
      <h3>
        <span className='fx-animated-text text-primary' data-fx-order='5'>
          {star.type === 'Null'
            ? star.description || ''
            : `Type ${star.subType} // Class ${star.spectralClass} ${star.isScoopable ? '// Fuel Star' : ''}`}
        </span>
      </h3>
      {star.numberOfPlanets > 0 &&
        <h4>
          <span className='fx-animated-text text-primary text-muted' data-fx-order='6'>
            {star.numberOfPlanets === 1 ? '1 orbiting body' : `${star.numberOfPlanets} orbiting bodies`}
          </span>
        </h4>}
      {star.numberOfPlanets === 0 &&
        <h4>
          <span className='fx-animated-text text-primary text-muted' data-fx-order='6'>
            No orbiting bodies
          </span>
        </h4>}
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
                stroke='var(--system-map-line-color)'
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
                    stroke='var(--system-map-line-color)'
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
