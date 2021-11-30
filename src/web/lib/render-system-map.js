import Icons from './icons'

const USE_ICONS_FOR_PLANETS = false
const SHOW_LABELS = true

export function renderSystemMapObject (obj, { onFocus } = {}) {
  const CLICKABLE_AREA_PADDING = 250
  const MAX_LABEL_WIDTH = 3000

  // Draw for Planets and Stars
  if (['Planet', 'Star'].includes(obj?.type)) {
    // If USE_ICONS_FOR_PLANETS is set, use alternate icon shape
    if (USE_ICONS_FOR_PLANETS) {
      const CORRECT_FOR_IMAGE_OFFSET = 140
      const x = (obj._x - 500)
      const y = (obj._y - 500)
      const h = obj._r * 2
      const w = obj._r * 2

      const h2 = obj._r + (CLICKABLE_AREA_PADDING * 2)
      const w2 = obj._r + (CLICKABLE_AREA_PADDING * 2)

      return `
        <svg
          preserveAspectRatio="xMinYMid meet"
          x="${x}" y="${y}" 
          height="${h}" width="${w}"
          class="navigation-panel__planet"
          >
          ${Icons.Planet}
        </svg>
        <!-- Transparent interactive overlay for icon (as transparent SVG parts not clickable) -->
      <rect
        x="${x - CORRECT_FOR_IMAGE_OFFSET}"
        y="${y - CORRECT_FOR_IMAGE_OFFSET}"
        height="${h2}"
        width="${w2}"
        onFocus="${onFocus}"
        tabindex="0"
        class="navigation-panel__station"
        data-type="${obj.type}"
        data-detail="${encodeURI(JSON.stringify(obj))}"
        opacity="0.85"
      />
        `
    } else {
      const x = obj._x
      const y = obj._y
      const r = obj._r

      // An image is used underneath the main SVG to easily add a texture to
      // the planet (could be done without foreignObject, but this is simpler)
      const imgH = (obj._r) * 2
      const imgW = (obj._r) * 2
      const imgX = (obj._x - (imgW / 2))
      const imgY = (obj._y - (imgH / 2))

      const textNameContents = truncateString(obj.label, (obj.orbitsStar ? 10 : 20))
      const textNameXOffset = textNameContents.length * 120 // Roughly center text

      // Check wider is no wider than planet (so they don't overlap)
      const textNameXLength = obj.orbitsStar || textNameContents.length <= 10
        ? textNameXOffset * 2 > MAX_LABEL_WIDTH ? MAX_LABEL_WIDTH : false
        : textNameXOffset * 2 > MAX_LABEL_WIDTH ? MAX_LABEL_WIDTH : textNameXOffset * 2

      const textNameX = obj.orbitsStar ? x - textNameXOffset : x + (r * 1) + 200
      const textNameY = obj.orbitsStar ? y - (r * 1) - 700 : y - 100

      const textDistanceContents = `${obj.distanceToArrival.toFixed(0)} Ls`
      const textDistanceX = obj.orbitsStar ? textNameX : x + (r * 1) + 200
      const textDistanceY = obj.orbitsStar ? y - (r * 1) - 300 : y + 300

      return `
      ${(obj.atmosphereType && obj.atmosphereType !== 'No atmosphere')
? `
      <circle
        class="navigation-panel__planet-atmosphere"
        cx="${x - 0}"
        cy="${y - 0}"
        r="${r + 70}"
      />`
: ''}
      ${SHOW_LABELS === true
? `
      <text
        class="navigation-panel__planet-name-text"
        x="${textNameX}"
        y="${textNameY}"
        ${textNameXLength !== false ? `textLength="${textNameXLength}px"` : ''}
        lengthAdjust="spacingAndGlyphs"
        >${textNameContents}</text>
      <text
        class="navigation-panel__planet-distance-text"
        x="${textDistanceX}"
        y="${textDistanceY}"
        >${textDistanceContents}</text>`
        : ''}
      <circle 
        id="navigation-panel__${obj.id}"
        class="system-object"
        data-landable="${obj.isLandable}"
        data-type="${obj.type}"
        data-sub-type="${obj.subType}"
        data-small="${!!obj._small}"
        data-atmosphere="${obj.atmosphereType}"
        data-detail="${encodeURI(JSON.stringify(obj))}"
        tabindex="0"
        cx="${x}"
        cy="${y}"
        r="${r}"
        onFocus="${onFocus}"
        />
        <circle
          class="navigation-panel__planet-surface"
          cx="${x}"
          cy="${y}"
          r="${r}"
          fill="url(#svg-pattern__planet-surface)"
        />
        ${obj.rings
? `
          <defs>
            <mask id="planet-ring-mask-${obj.id}" class="navigation-panel__planet-ring-mask">
              <ellipse
                cx="${x}"
                cy="${y}"
                rx="${r * 2}"
                ry="${r / 3}"
                fill="white"
              />
              <ellipse
                cx="${x}"
                cy="${y - (r / 5)}"
                rx="${r}"
                ry="${r / 3}"
                fill="black" />
              <ellipse
                cx="${x}"
                cy="${y - (r / 15)}"
                rx="${r * 1.2}"
                ry="${r / 5}"
                fill="black" />
              </mask>
          </defs>
          <ellipse
            class="navigation-panel__planet-ring"
            cx="${x}"
            cy="${y}"
            rx="${r * 2}"
            ry="${r / 3}"
            mask="url(#planet-ring-mask-${obj.id})"
            opacity="1"
          />
          <ellipse
            class="navigation-panel__planet-ring"
            cx="${x}"
            cy="${y - (r / 80)}"
            rx="${r * 1.85}"
            ry="${r / 4.2}"
            mask="url(#planet-ring-mask-${obj.id})"
            opacity=".25"
          />
        `
: ''}
        `
    }
  } else {
    // Draw objects that are not planets or stars using icons
    const CORRECT_FOR_IMAGE_OFFSET = 70

    const r = obj._r

    const x = obj._x - (r / 2) - CLICKABLE_AREA_PADDING
    const y = obj._y - (r / 2) - CLICKABLE_AREA_PADDING
    const height = r + (CLICKABLE_AREA_PADDING * 2)
    const width = r + (CLICKABLE_AREA_PADDING * 2)

    const imageH = r * 2
    const imageW = imageH
    const imageY = (obj._y - (r / 2)) - CORRECT_FOR_IMAGE_OFFSET
    const imageX = (obj._x - (r / 2)) - CORRECT_FOR_IMAGE_OFFSET

    const textNameContents = truncateString(obj.label, (obj.orbitsStar ? 10 : 20))
    const textNameXOffset = textNameContents.length * 120 // Roughly center text

    const textNameXLength = obj.orbitsStar || textNameContents.length <= 10
      ? textNameXOffset * 2 > MAX_LABEL_WIDTH ? MAX_LABEL_WIDTH : false
      : textNameXOffset * 2 > MAX_LABEL_WIDTH ? MAX_LABEL_WIDTH : textNameXOffset * 2

    const textNameX = obj.orbitsStar ? obj._x - textNameXOffset : obj._x + (r * 1) + 200
    const textNameY = obj.orbitsStar ? obj._y - (r * 1) - 700 : obj._y - 100

    const textDistanceContents = `${obj.distanceToArrival.toFixed(0)} Ls`
    const textDistanceXOffset = textDistanceContents.length * 95 // Roughly center text
    const textDistanceX = obj.orbitsStar ? obj._x - textDistanceXOffset : obj._x + (r * 1) + 200
    const textDistanceY = obj.orbitsStar ? obj._y - (r * 1) - 300 : obj._y + 300

    return `
      <!-- Transparent interactive overlay for icon (as transparent SVG parts not clickable) -->
      <circle
        cx="${obj._x}"
        cy="${obj._y}"
        r="${obj._r - 50}"
        onFocus="${onFocus}"
        tabindex="0"
        class="navigation-panel__station"
        data-type="${obj.type}"
        data-detail="${encodeURI(JSON.stringify(obj))}"
      />
      <!-- Inline SVG icon (loaded from string so can be easily styled) -->
      <svg class="navigation-panel__station-icon icon" x="${imageX}" y="${imageY}" h="${imageH * 10}" w="${imageW * 10}">
        ${Icons[obj.type]}
      </svg>
      ${SHOW_LABELS === true
? `
        <text
          class="navigation-panel__planet-name-text"
          x="${textNameX}"
          y="${textNameY}"
          ${textNameXLength !== false ? `textLength="${textNameXLength}px"` : ''}
          lengthAdjust="spacingAndGlyphs"
          >${textNameContents}</text>
        <text
          class="navigation-panel__planet-distance-text"
          x="${textDistanceX}"
          y="${textDistanceY}"
          >${textDistanceContents}</text>`
        : ''}
    `
  }
}

function truncateString (string, maxLength) {
  if (string.length > maxLength) {
    return `${string.substring(0, maxLength - 1)}…`
  }
  return string
}
