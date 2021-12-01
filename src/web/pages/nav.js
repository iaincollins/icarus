import { useState, useEffect } from 'react'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { useSocket } from 'lib/socket'
import RenderSystemMapObject from 'lib/render-system-map-object'

export default function NavPage () {
  const { connected, active, sendEvent } = useSocket()
  const [ready, setReady] = useState(false)
  const [system, setSystem] = useState()

  useEffect(async () => {
    if (!connected) return
    setSystem(await sendEvent('getSystem'))
    setReady(true)
  }, [connected])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' scrollable>
        <div className='navigation-panel__map' style={{ display: 'block' }}>
          <div className='navigation-panel__map-background'>
            <div className='navigation-panel__map-foreground scrollable'>
              {system &&
                <div className='system-info'>
                  <h1>
                    <span className='fx-animated-text' data-fx-order='1'>
                      <i className='icarus-terminal-system' />
                      {system.name}
                    </span>
                  </h1>
                  <h2>
                    <span class='fx-animated-text' data-fx-order='1'>
                      {system.allegiance || 'Unaligned'}
                      {system.government === 'None' ? '// No government' : `// ${system.government}`}
                      {(system.security !== system.government) ? `// ${system.security}` : '// No security'}
                    </span>
                  </h2>
                  <h3 class='text-secondary'>
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
                    <br />
                    <span class='fx-animated-text' data-fx-order='3'>
                      {system.faction && system.faction !== 'Unknown'
                        ? `System controlled by ${system.faction}`
                        : 'No factions have a claim to this system'}
                    </span>
                  </h3>
                </div>}

              {system && system.stars.map(star =>
                <div
                  key={star.name}
                  dangerouslySetInnerHTML={{
                    __html: `
                      <div class="system-objects" data-stellar-objects-horizontal="${star._children.length}" data-stellar-objects-vertical="${star._maxObjectsInOrbit}">
                        <h2>
                          <span class="fx-animated-text" data-fx-order="4">
                            ${star.type !== 'Null'
                              ? '<i class="icarus-terminal-star float-left"></i>'
                              : ''
                            } ${star.name}
                          </span>
                        <h2>
                        <h3>
                          <span class="fx-animated-text text-primary" data-fx-order="5">
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
                      </div>
                      `
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </Panel>
    </Layout>
  )
}
