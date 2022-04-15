import Icons from 'lib/icons'
import { SURFACE_PORTS, PLANETARY_OUTPOSTS, SETTLEMENTS } from '../../../../shared/consts'

const USE_ICONS_FOR_PLANETS = false
const SHOW_LABELS = true
const DEFAULT_RADIUS = 2000

// TODO This has been ported to JSX but would be easier to maintain if each
// type of object was refactored out into it's own component
export default function SystemMapObject ({ systemObject, setSystemObject, parentSystemObject, labels = true }) {
  const CLICKABLE_AREA_PADDING = 250
  const MAX_LABEL_WIDTH = 3000

  // Draw for Planets and Stars
  if (['Planet', 'Star'].includes(systemObject?.type)) {
    // If USE_ICONS_FOR_PLANETS is set, use alternate icon shape
    if (USE_ICONS_FOR_PLANETS) {
      const CORRECT_FOR_IMAGE_OFFSET = 140
      const x = (systemObject._x - 500)
      const y = (systemObject._y - 500)
      const h = systemObject._r * 2
      const w = systemObject._r * 2

      const h2 = systemObject._r + (CLICKABLE_AREA_PADDING * 2)
      const w2 = systemObject._r + (CLICKABLE_AREA_PADDING * 2)

      return (
        <>
          <svg
            preserveAspectRatio='xMinYMid meet'
            x={x}
            y={y}
            height={h}
            width={w}
            className='system-map__planet-icon'
          >
            {Icons.Planet}
          </svg>
          {/* Transparent interactive overlay for icon (as transparent SVG parts not clickable) */}
          <rect
            x={x - CORRECT_FOR_IMAGE_OFFSET}
            y={y - CORRECT_FOR_IMAGE_OFFSET}
            height={h2}
            width={w2}
            onFocus={() => setSystemObject(systemObject)}
            tabIndex='0'
            className='system-map__station'
            data-system-object-type={systemObject.type}
            data-system-object-name={systemObject.name}
            opacity='0.85'
          />
        </>
      )
    } else {
      const x = systemObject._x || 0
      const y = systemObject._y || 0
      const r = systemObject._r || DEFAULT_RADIUS

      // An image is used underneath the main SVG to easily add a texture to
      // the planet (could be done without foreignObject, but this is simpler)
      // const imgH = (systemObject._r) * 2
      // const imgW = (systemObject._r) * 2
      // const imgX = (systemObject._x - (imgW / 2))
      // const imgY = (systemObject._y - (imgH / 2))

      const textNameContents = truncateString(systemObject.label, (systemObject.orbitsStar ? 10 : 20))
      const textNameXOffset = textNameContents.length * 120 // Roughly center text

      // Check wider is no wider than planet (so they don't overlap)
      const textNameXLength = systemObject.orbitsStar || textNameContents.length <= 10
        ? textNameXOffset * 2 > MAX_LABEL_WIDTH ? MAX_LABEL_WIDTH : false
        : textNameXOffset * 2 > MAX_LABEL_WIDTH ? MAX_LABEL_WIDTH : textNameXOffset * 2

      const textNameX = systemObject.orbitsStar ? x - textNameXOffset : x + (r * 1) + 200
      const textNameY = systemObject.orbitsStar ? y - (r * 1) - 700 : y - 100

      const textDistanceContents = `${systemObject.distanceToArrival.toFixed(0)} Ls`
      const textDistanceX = systemObject.orbitsStar ? textNameX : x + (r * 1) + 200
      const textDistanceY = systemObject.orbitsStar ? y - (r * 1) - 300 : y + 300

      // const CORRECT_FOR_IMAGE_OFFSET_X = ['Star', 'Null'].includes(parentSystemObject?.type) ? 550 : 2000
      // const CORRECT_FOR_IMAGE_OFFSET_Y = ['Star', 'Null'].includes(parentSystemObject?.type) ? 150 : 100

      const CORRECT_FOR_IMAGE_OFFSET_X = 250
      const CORRECT_FOR_IMAGE_OFFSET_Y = 200

      const imageX = x - CORRECT_FOR_IMAGE_OFFSET_X
      const imageY = y - CORRECT_FOR_IMAGE_OFFSET_Y

      let hasPlanetaryPort = false
      let hasPlanetaryFacilities = false

      // TODO Make these explict properties (bools) that are pre-calculated
      systemObject?._planetaryBases?.forEach(base => {
        if (PLANETARY_OUTPOSTS.concat(SETTLEMENTS).includes(base.type)) {
          hasPlanetaryFacilities = true
        }
        if (SURFACE_PORTS.includes(base.type)) {
          hasPlanetaryPort = true
        }
      })

      return (
        <g
          className='system-map__system-object'
          data-system-object-landable={systemObject.isLandable}
          data-system-object-type={systemObject.type}
          data-system-object-sub-type={systemObject.subType}
          data-system-object-small={!!systemObject._small}
          data-system-object-atmosphere={systemObject.atmosphereType}
          data-system-object-name={systemObject.name}
          tabIndex='0'
          onFocus={() => setSystemObject(systemObject)}
        >
          {(systemObject.atmosphereType && systemObject.atmosphereType !== 'No atmosphere') &&
            <g className='system-map__body'>
              <g className='system-map__planet'>
                <circle
                  className='system-map__planet-atmosphere'
                  cx={x - 0}
                  cy={y - 0}
                  r={r + 70}
                />
              </g>
            </g>}
          {SHOW_LABELS === true && labels === true &&
            <>
              <text
                className='system-map__planet-name-text'
                x={textNameX}
                y={textNameY}
                textLength={textNameXLength !== false ? `${textNameXLength}px` : null}
                lengthAdjust='spacingAndGlyphs'
              >
                {textNameContents}
              </text>
              <text
                className='system-map__planet-distance-text'
                x={textDistanceX}
                y={textDistanceY}
              >
                {textDistanceContents}
              </text>
            </>}
          <g className='system-map__body'>
            <g className='system-map__planet'>
              <circle
                id={`navigation-panel__${systemObject.id}`}
                cx={x}
                cy={y}
                r={r}
              />
              <circle
                className='system-map__planet-surface'
                cx={x}
                cy={y}
                r={r}
              />
              {systemObject.rings &&
                <>
                  <defs>
                    <mask
                      id={`planet-ring-mask-${systemObject.id}`}
                      className='system-map__planet-ring-mask'
                    >
                      <ellipse
                        cx={x}
                        cy={y}
                        rx={r * 2}
                        ry={r / 3}
                        fill='white'
                      />
                      <ellipse
                        cx={x}
                        cy={y - (r / 5)}
                        rx={r}
                        ry={r / 3}
                        fill='black'
                      />
                      <ellipse
                        cx={x}
                        cy={y - (r / 15)}
                        rx={r * 1.2}
                        ry={r / 5}
                        fill='black'
                      />
                    </mask>
                  </defs>
                  <ellipse
                    className='system-map__planet-ring'
                    cx={x}
                    cy={y}
                    rx={r * 2}
                    ry={r / 3}
                    mask={`url(#planet-ring-mask-${systemObject.id})`}
                    opacity='1'
                  />
                  <ellipse
                    className='system-map__planet-ring'
                    cx={x}
                    cy={y - (r / 80)}
                    rx={r * 1.85}
                    ry={r / 4.2}
                    mask={`url(#planet-ring-mask-${systemObject.id})`}
                    opacity='.25'
                  />
                </>}
            </g>
            {hasPlanetaryFacilities && !hasPlanetaryPort &&
              <svg
                className='system-map__planetary-facility-icon'
                x={imageX}
                y={imageY}
              >
                {Icons.Settlement}
              </svg>}
            {hasPlanetaryPort &&
              <svg
                className='system-map__planetary-port-icon'
                x={imageX}
                y={imageY - 100}
              >
                {Icons['Planetary Port']}
              </svg>}
            {!hasPlanetaryFacilities && !hasPlanetaryPort && systemObject.isLandable &&
              <svg
                className='system-map__planetary-lander-icon'
                x={imageX}
                y={imageY - 100}
              >
                {Icons['Planet Lander']}
              </svg>}
          </g>
        </g>
      )
    }
  } else {
    // Draw systemObjects that are not planets or stars using icons
    const r = systemObject._r || DEFAULT_RADIUS
    const CORRECT_FOR_IMAGE_OFFSET = 90

    let imageY = (systemObject._y - (r / 2)) - CORRECT_FOR_IMAGE_OFFSET
    let imageX = (systemObject._x - (r / 2)) - CORRECT_FOR_IMAGE_OFFSET
    let viewBox = '0 0 1000 1000'

    // Icon specific hacks
    if (systemObject.type === 'Mega ship') {
      imageX -= 30
      imageY += 60
    }

    if (systemObject.type === 'Outpost') {
      imageX -= 90
    }

    if (systemObject.type === 'Asteroid base') {
      viewBox = '0 0 2000 2000'
    }

    const textNameContents = truncateString(systemObject.label, (systemObject.orbitsStar ? 10 : 20))
    const textNameXOffset = textNameContents.length * 120 // Roughly center text

    const textNameXLength = systemObject.orbitsStar || textNameContents.length <= 10
      ? textNameXOffset * 2 > MAX_LABEL_WIDTH ? MAX_LABEL_WIDTH : false
      : textNameXOffset * 2 > MAX_LABEL_WIDTH ? MAX_LABEL_WIDTH : textNameXOffset * 2

    const textNameX = systemObject.orbitsStar ? systemObject._x - textNameXOffset : systemObject._x + (r * 1) + 200
    const textNameY = systemObject.orbitsStar ? systemObject._y - (r * 1) - 700 : systemObject._y - 100

    const textDistanceContents = `${systemObject.distanceToArrival.toFixed(0)} Ls`
    const textDistanceXOffset = textDistanceContents.length * 95 // Roughly center text
    const textDistanceX = systemObject.orbitsStar ? systemObject._x - textDistanceXOffset : systemObject._x + (r * 1) + 200
    const textDistanceY = systemObject.orbitsStar ? systemObject._y - (r * 1) - 300 : systemObject._y + 300

    return (
      <g
        className='system-map__system-object'
        onFocus={() => setSystemObject(systemObject)}
        tabIndex='0'
        data-system-object-type={systemObject.type}
        data-system-object-name={systemObject.name}
      >
        {/* Transparent interactive overlay for icon (as transparent SVG parts not clickable) */}
        <circle
          className='system-map__station'
          cx={systemObject._x}
          cy={systemObject._y}
          r={systemObject._r - 50}
        />
        {/*  Inline SVG icon (loaded from string so can be easily styled) */}
        <svg
          className='system-map__station-icon'
          x={imageX}
          y={imageY}
          height='1000'
          width='1000'
          preserveAspectRatio='xMinYMid meet'
          viewBox={viewBox}
        >
          {Icons[systemObject.type]}
        </svg>
        {SHOW_LABELS === true && labels === true &&
          <>
            <text
              className='system-map__planet-name-text'
              x={textNameX}
              y={textNameY}
              textLength={textNameXLength !== false ? `${textNameXLength}px` : null}
              lengthAdjust='spacingAndGlyphs'
            >{textNameContents}
            </text>
            <text
              className='system-map__planet-distance-text'
              x={textDistanceX}
              y={textDistanceY}
            >{textDistanceContents}
            </text>
          </>}
      </g>
    )
  }
}

function truncateString (string, maxLength) {
  if (string.length > maxLength) {
    return `${string.substring(0, maxLength - 1)}…`
  }
  return string
}
