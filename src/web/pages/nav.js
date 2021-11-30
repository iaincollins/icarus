import { useState, useEffect } from 'react'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { useSocket } from 'lib/socket'
import { renderSystemMapObject } from 'lib/render-system-map'

export default function NavPage () {
  const { connected, active, sendEvent } = useSocket()
  const [ready, setReady] = useState(false)
  const [system, setSystem] = useState()

  useEffect(async () => {
    if (!connected) return
    setReady(false)
    setSystem(await sendEvent('getSystem'))
    setReady(true)
  }, [connected])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' scrollable>
        {system && system.map(star =>
          <div
            key={star.name}
            dangerouslySetInnerHTML={{
              __html: `
              <div class="system-objects" data-stellar-objects-horizontal="${star._children.length}" data-stellar-objects-vertical="${star._maxObjectsInOrbit}">
      <div>
        <h2><span class="fx-animated-text" data-fx-order="4">
          ${star.type !== 'Null'
            // ? Icons.icon('Star', { height: '2rem', top: '.25rem' })
            ? '<i class="icarus-terminal-star float-left" />'
            : ''
          } ${star.name}
        </span><h2>
        <h3><span class="fx-animated-text text-primary" data-fx-order="5">
        ${star.type === 'Null'
          ? star.description || ''
          : `Type ${star.subType} // Class ${star.spectralClass} ${star.isScoopable ? '// Fuel Star' : ''}`
        }
        </span></h3>
        <h4><span class="fx-animated-text" data-fx-order="6">
          ${star.numberOfPlanets === 1 ? '1 planet' : `${star.numberOfPlanets} planets`}
        </span></h4>
      </div>
      <div class="svg-wrapper">
                <svg
                  style="width: 100%; height: 100%;"
                  viewBox="0 -${star._yOffset} ${star._xMax + star._xOffset} ${star._yMax + star._yOffset}""
                  preserveAspectRatio="xMinYMid meet"
                >
                ${star._children && star._children.length > 0
? `
                <line
                  x1="${star._children[0]._x}" y1="${star._children[0]._y}"
                  x2="${star._children[star._children.length - 1]._x}" y2="${star._children[star._children.length - 1]._y}"
                  stroke="var(--icon-color)"
                  stroke-width="100"
                  opacity="0.25"
                />`
              : ''}
                ${star._children.map((systemObject, i) => `
                  ${systemObject._children && systemObject._children.length > 0
? `
                    <line
                      x1="${systemObject._x}" y1="${systemObject._y}"
                      x2="${systemObject._children[systemObject._children.length - 1]._x}" y2="${systemObject._children[systemObject._children.length - 1]._y}"
                      stroke="var(--icon-color)"
                      stroke-width="75"
                      opacity="0.25"
                    />`
                  : ''}
                  ${renderSystemMapObject(systemObject)}
                  ${(systemObject._children || []).map((itemInOrbit, i) =>
                    renderSystemMapObject(itemInOrbit)
                  )}
                `)}
                </svg>
              </div>
              </div>
              `

            }}
          />
        )}
      </Panel>
    </Layout>
  )
}
