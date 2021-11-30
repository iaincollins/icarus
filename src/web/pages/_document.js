import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps (ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render () {
    return (
      <Html lang='en' data-fx-crt='false' data-fx-crt-text='false' data-fx-crt-text-animated='false'>
        <Head />
        <script dangerouslySetInnerHTML={{
          __html: `
            document.oncontextmenu = (e) => e.preventDefault()
        `
        }}
        />
        <body className='not-selectable'>
          <div className='layout__background' />
          <div className='layout__overlay' />
          <Main />
          <NextScript />
          <div dangerouslySetInnerHTML={{
            __html: `
            <!-- SVG filters and effects used for styling icons (e.g. sytem map) -->
    <svg style="position: absolute; height: 0; margin: 0; padding: 0; top: -100px;">
      <defs>
        <!-- For star icon (TODO: create new icon using path that doesn't need this) -->
        <mask id="svg-mask__star-icon">
          <circle r="600" cy="455" cx="470" fill="white" />
          <circle r="415" cy="50" cx="60" fill="black" />
          <circle r="415" cy="50" cx="880" fill="black" />
          <circle r="415" cy="870" cx="60" fill="black" />
          <circle r="415" cy="870" cx="880" fill="black" />
        </mask>
        <!-- For planet icons in system map -->
        <clipPath id="svg-clip-path__planet">
          <rect x="400" y="0" width="500" height="1000" />
        </clipPath>
        <!-- Unknown system objects (eg stations, megaships)-->
        <linearGradient id="svg-gradient__unknown">
          <stop offset="0%" stop-color="#ccc" />
          <stop offset="100%" stop-color="#aaa" />
        </linearGradient>
        <!-- Planets -->
        <linearGradient id="svg-gradient__planet-ring" gradientTransform="rotate(90)"  gradientUnits="userSpaceOnUse">
          <stop offset="0%" />
          <stop offset="100%" />
        </linearGradient>
        <linearGradient id="svg-gradient__planet" gradientTransform="rotate(10)">
          <stop offset="0%" />
          <stop offset="100%" />
        </linearGradient>
        <linearGradient id="svg-gradient__planet--gas-giant">
          <stop offset="0%" />
          <stop offset="100%" />
        </linearGradient>
        <linearGradient id="svg-gradient__planet--gas-giant-ammonia">
          <stop offset="0%" />
          <stop offset="100%" />
        </linearGradient>
        <linearGradient id="svg-gradient__planet--rocky">
          <stop offset="0%" />
          <stop offset="100%" />
        </linearGradient>
        <linearGradient id="svg-gradient__planet--rocky-icy">
          <stop offset="0%" />
          <stop offset="100%" />
        </linearGradient>
        <linearGradient id="svg-gradient__planet--icy">
          <stop offset="0%" />
          <stop offset="100%" />
        </linearGradient>
        <linearGradient id="svg-gradient__planet--high-metal">
          <stop offset="0%" />
          <stop offset="100%" />
        </linearGradient>
        <linearGradient id="svg-gradient__planet--metal-rich">
          <stop offset="0%" />
          <stop offset="100%" />
        </linearGradient>
        <linearGradient id="svg-gradient__planet--earth-like">
          <stop offset="0%" />
          <stop offset="100%" />
        </linearGradient>
        <linearGradient id="svg-gradient__planet--landable">
          <stop offset="0%" />
          <stop offset="100%" />
        </linearGradient>
        <radialGradient id="svg-gradient__planet--atmosphere--radial">
          <stop offset="25%" />
          <stop offset="50%" />
          <stop offset="100%" />
        </radialGradient>
        <linearGradient id="svg-gradient__planet--atmosphere" gradientTransform="rotate(10)">
          <stop offset="50%" />
          <stop offset="100%" />
        </linearGradient>
        <!-- Shadows on planets  -->
        <filter id="svg-filter__planet-shadow">
          <feOffset dx="-500" dy="-500"/>
          <feGaussianBlur stdDeviation="200" result="offset-blur"/>
          <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
          <feFlood flood-color="black" flood-opacity="1" result="color"/>
          <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
          <feComponentTransfer in="shadow" result="shadow"><feFuncA type="linear" slope=".7"/></feComponentTransfer>
          <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
        </filter>
        <filter id="svg-filter__planet-shadow--small">
          <feOffset dx="-200" dy="-200"/>
          <feGaussianBlur stdDeviation="100" result="offset-blur"/>
          <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
          <feFlood flood-color="black" flood-opacity="1" result="color"/>
          <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
          <feComponentTransfer in="shadow" result="shadow"><feFuncA type="linear" slope=".7"/></feComponentTransfer>
          <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
        </filter>
        <!-- Cloud patterns on planets with atmosphere -->
        <pattern id="svg-pattern__planet--clouds" x="0" y="0" width="1" height="1">
          <image href="images/clouds.jpg" />
        </pattern>
      </defs>
    </svg>
    <script>
    const isChromium = window.chrome
    const isSafari = navigator.vendor.match(/apple/i) &&
                      !navigator.userAgent.match(/crios/i) &&
                      !navigator.userAgent.match(/fxios/i) &&
                      !navigator.userAgent.match(/Opera|OPT\\//)
    const isOpera = typeof window.opr !== "undefined"
    const isIEedge = window.navigator.userAgent.indexOf("Edg") > -1
    const isIOSChrome = window.navigator.userAgent.match("CriOS")
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1

    // Google Chrome support filters on SVG textures in this way but not all
    // imitation Chrome browsers do and some look terrible as a result because
    // of how the fail at rendering.
    // 
    // Firefox supports this feature too, though doesn't support focus events
    // on the SVGs so the map view isn't actually interactive on Firefox.
    //
    // This is all so that the map doesn't look bad on cheap tablets, like the
    // Amazon Fire, which Amazon recently forceably purged side loaded Google
    // Chrome from and replaced it with less capeable version of Amazon's 
    // Silk browser which uses Google Inc. as the vendor name but isn't
    // actually from Google.
    let ENABLE_PLANET_TEXTURES = false
    if (isIOSChrome || isSafari || isIEedge || isFirefox) {
      ENABLE_PLANET_TEXTURES = true
    } else if (
      // Check is Google Chrome (and not impostor)
      isChromium !== null &&
      typeof isChromium !== "undefined" &&
      window.navigator.vendor === "Google Inc." &&
      !window.navigator.userAgent.match("like Chrome") && // Browsers like Amazon Fire's Silk Browsers use the Google Inc. vendor name, but that's a lie and it doesn't support this feature
      isOpera === false &&
      isIEedge === false
    ) {
      ENABLE_PLANET_TEXTURES = true
    }

    if (ENABLE_PLANET_TEXTURES) {
      document.write(\`
      <svg style="position: absolute; height: 0; margin: 0; padding: 0; top: -100px;">
        <defs>
          <pattern id="svg-pattern__planet-surface" x="0" patternUnits="userSpaceOnUse" preserveAspectRatio="none" width="7280" height="7040">
            <image href="images/rock.png" x="0" y="0" width="7280" height="7040"/>
          </pattern>
          <pattern id="svg-pattern__planet-surface-animated" x="0" patternUnits="userSpaceOnUse" preserveAspectRatio="none" width="7280" height="7040">
            <image href="images/rock.png" x="0" y="0" width="7280" height="7040"/>
            <animate attributeName="x" values="0;7280" dur="30s" repeatCount="indefinite" />
          </pattern>
        </defs>
      </svg>
      \`)
    }
  </script>
          `
          }}
          />
        </body>
      </Html>
    )
  }
}

export default MyDocument
