// This component relies heavily on dangerouslySetInnerHTML and HTML element
// generation routines from code that was not
import RenderSystemMapObject from 'lib/render-system-map-object'

export default function NavigationSystemMapPanel ({ system }) {
  if (!system) return null

  return (
    <div className='navigation-panel__map' style={{ display: 'block' }}>
      <div className='navigation-panel__map-background'>
        <div className='navigation-panel__map-foreground scrollable'>
          <div className='navigation-panel__system-info text-primary'>
            <h1>
              <span className='fx-animated-text' data-fx-order='1'>
                <i className='icon icarus-terminal-system-orbits' />
                {system.name}
              </span>
            </h1>
            <h2 className='text-secondary'>
              <span className='fx-animated-text' data-fx-order='1'>
                {system.allegiance || 'Unaligned'}
                {system.government === 'None' ? ' // No government' : ` // ${system.government}`}
                {(system.security !== system.government) ? ` // ${system.security}` : ''}
              </span>
            </h2>
            <h3 className='text-secondary'>
              {/* <span class="fx-animated-text" data-fx-order="2">${loadedSystemInfo === true ? `
              ${Render.numberOf(numberOfStars, 'star')},
              ${Render.numberOf(planets, 'planet')},
              ${Render.numberOf(starports, 'starport')},
              ${Render.numberOf(planetaryPorts, 'planetary port')},
              ${Render.numberOf(settlements, 'settlement')}
              <!--
              ${Render.numberOf(planetaryOutposts, 'outpost')},
              ${Render.numberOf(megaships, 'megaship')},
              ${Render.numberOf(system?.population, 'people', false)}
              -->
              ` : ''}
            </span> */}
              <span className='fx-animated-text' data-fx-order='3'>
                {system.faction && system.faction !== 'Unknown'
                  ? `Controlled by ${system.faction}`
                  : ''}
              </span>
            </h3>
          </div>
          {system.stars.map(star =>
            <div
              key={`${star.name}_ID:${star.bodyId}`}
              className='system-objects text-primary'
              data-stellar-objects-horizontal={star._children.length}
              data-stellar-objects-vertical={star._maxObjectsInOrbit}
              dangerouslySetInnerHTML={{
                __html: starHtml(star)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function starHtml (star) {
  if (star.type === 'Null' && (!star._children || star._children.length === 0)) return ''

  return `
                  <h2>
                    <span class="fx-animated-text" data-fx-order="4">
                      ${star.type !== 'Null'
                        ? '<i class="icon icarus-terminal-star"></i>'
                        : '<i class="icon icarus-terminal-system-bodies"></i>'
                      } ${star.name}
                    </span>
                  <h2>
                  <h3>
                    <span class="fx-animated-text text-secondary" data-fx-order="5">
                    ${star.type === 'Null'
                      ? star.description || ''
                      : `Type ${star.subType} // Class ${star.spectralClass} ${star.isScoopable ? '// Fuel Star' : ''}`
                    }
                    </span>
                  </h3>
                  <h4>
                    <span class="fx-animated-text" data-fx-order="6">
                      ${star.numberOfPlanets === 1 ? '1 planet' : `${star.numberOfPlanets} planets`}
                    </span>
                  </h4>
                  ${(star._children && star._children.length > 0)
  ? `
                    <div class="svg-wrapper" style="opacity: 1;">
                      <svg
                        viewBox="${star._viewBox}"
                        preserveAspectRatio="xMinYMid meet"
                      >
                      ${star._children && star._children.length > 0
                        ? `<line
                            x1="${star._children[0]._x}" y1="${star._children[0]._y}"
                            x2="${star._children[star._children.length - 1]._x}" y2="${star._children[star._children.length - 1]._y}"
                            stroke="var(--icon-color)"
                            stroke-width="100"
                            opacity="0.25"
                          />`
                        : ''
                      }
                      ${star._children.map((systemObject, i) => `
                        ${systemObject._children && systemObject._children.length > 0
                          ? `<line
                              x1="${systemObject._x}" y1="${systemObject._y}"
                              x2="${systemObject._children[systemObject._children.length - 1]._x}" y2="${systemObject._children[systemObject._children.length - 1]._y}"
                              stroke="var(--icon-color)"
                              stroke-width="75"
                              opacity="0.25"
                            />`
                          : ''
                        }
                        ${RenderSystemMapObject(systemObject)}
                        ${(systemObject._children || []).map((itemInOrbit, i) =>
                          RenderSystemMapObject(itemInOrbit)
                        )}
                      `)}
                      </svg>
                    </div>
                  `
  : ''}
                `
}
