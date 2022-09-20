import SystemMapStar from 'components/panels/nav/system-map/system-map-star'
import CopyOnClick from 'components/copy-on-click'

export default function SystemMap ({ system, setSystemObject }) {
  if (!system) return null

  return (
    <>
      <div className='system-map'>
        <div className='system-map__overlay'/>
        {system?.stars?.map(star =>
          <SystemMapStar
            key={`system-map_${system.name}_${star.name}_${star.id}`}
            star={star}
            setSystemObject={setSystemObject}
          />
        )}
      </div>
    </>
  )
}
