const {
  MEGASHIPS,
  STARPORTS,
  SURFACE_PORTS,
  PLANETARY_OUTPOSTS,
  SETTLEMENTS,
  PLANETARY_BASES
} = require('./consts')

const USE_ICONS_FOR_PLANETS = false
const SHOW_LABELS = true

function escapeRegExp (text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

class SystemMap {
  constructor (system) {
    this.detail = system
    const { name = '', bodies = [], stations = [] } = this.detail
    this.name = name

    this.stars = bodies.filter(body => body.type === 'Star')
    this.planets = bodies.filter(body => body.type === 'Planet')
    this.starports = stations.filter(station => STARPORTS.includes(station.type))
    this.planetaryPorts = stations.filter(station => SURFACE_PORTS.includes(station.type))
    this.planetaryOutposts = stations.filter(station => PLANETARY_OUTPOSTS.includes(station.type))
    this.settlements = stations.filter(station => SETTLEMENTS.includes(station.type))
    this.megaships = stations.filter(station => MEGASHIPS.includes(station.type))
    this.objectsInSystem = bodies.concat(stations).sort((a, b) => (a.distanceToArrival - b.distanceToArrival))

    // This object will be used to contain all on the map not directly oribiting
    // a star. There can be multiple 'Null' objects around which planets orbit
    // but we consolodate them all around one Null object with ID 0.
    this.stars.push({
      bodyId: 0,
      name: 'Additional Objects',
      description: 'Rogue // Extrasolar // Circumbinary Orbit',
      type: 'Null',
      _children: []
    })

    this.init()
  }

  init () {
    for (const systemObject of this.objectsInSystem) {
      // Attach name to system name
      // alert(escapeRegExp(this.detail.name))
      systemObject.label = this.getSystemObjectLabel(systemObject)
      // Loop through and find all stations / ships / etc and assign parents
      // value based on whatever planet they are nearest to (before calculating
      // co-ordiantes for values, which are used to draw the map). The approach
      // here may not always be technically correct, but it's good enough for
      // our map and should render meaningfully.
      if (!systemObject.parents && systemObject.type && STARPORTS.concat(MEGASHIPS).concat(PLANETARY_BASES).includes(systemObject.type)) {
        // Find planet with closest similar distance to sun
        // This could be the wrong choice in edge cases, but is good enough.
        const nearestPlanet = this.getNearestPlanet(systemObject)
        const nearestLandablePlanet = this.getNearestLandablePlanet(systemObject)
        const nearestPlanetParentType = Object.keys(nearestPlanet.parents[0])[0]

        // If parent of planet is a star (or null - for rogue planets) then make
        // it the main body this station orbits. However, if the nearest planet
        // is a orbiting another larger planet, make the target the larger planet
        const parentBodyId = (nearestPlanetParentType === 'Star' || nearestPlanetParentType === 'Null')
          ? nearestPlanet.bodyId
          : nearestPlanet.parents[0][nearestPlanetParentType]

        systemObject.parents = [{ Planet: parentBodyId }]
        systemObject.radius = 1000

        const services = []
        if (systemObject.haveMarket) services.push('Market')
        if (systemObject.haveShipyard) services.push('Shipyard')
        if (systemObject.haveOutfitting) services.push('Outfitting')
        if (systemObject.otherServices) services.concat(systemObject.otherServices)
        systemObject._services = services

        // If this object is any time of planetry port, outpost or settlement
        // then add it as a planetary base of the parent body
        if (PLANETARY_BASES.includes(systemObject.type)) {
          for (const systemObjectParent of this.objectsInSystem) {
            if (systemObjectParent.bodyId === nearestLandablePlanet.bodyId) {
              if (!systemObjectParent._planetaryBases) systemObjectParent._planetaryBases = []
              systemObjectParent._planetaryBases.push(systemObject)
            }
          }
        }

        // If this object is any time of planetry port, outpost or settlement
        // then add it as a planetary base of the parent body
        if (MEGASHIPS.includes(systemObject.type)) {
          for (const systemObjectParent of this.objectsInSystem) {
            if (systemObjectParent.bodyId === nearestPlanet.bodyId) {
              if (!systemObjectParent._megaships) systemObjectParent._megaships = []
              systemObjectParent._megaships.push(systemObject)
            }
          }
        }
      }
    }

    // Calculate position to draw items on map
    this.stars.map(star => this.plotObjectsAroundStar(star))
  }

  plotObjectsAroundStar (star) {
    // If USE_ICONS_FOR_PLANETS is set, use alternate metrics
    const MIN_R = USE_ICONS_FOR_PLANETS ? 800 : 800
    const MAX_R = USE_ICONS_FOR_PLANETS ? 800 : 2000
    const SUB_MIN_R = USE_ICONS_FOR_PLANETS ? 800 : 800
    const SUB_MAX_R = USE_ICONS_FOR_PLANETS ? 800 : 2000
    const R_DIVIDER = USE_ICONS_FOR_PLANETS ? 1 : 10
    const X_SPACING = USE_ICONS_FOR_PLANETS ? 1 : 600
    const Y_SPACING = USE_ICONS_FOR_PLANETS ? 1 : 600
    const MIN_LABEL_X_SPACING = SHOW_LABELS ? 5000 : 0
    const RING_X_SPACING_FACTOR = 0.8
    const Y_LABEL_OFFSET = SHOW_LABELS ? 800 : 0

    star._xMax = 0
    star._yMax = 0
    star._xOffset = 0
    star._yOffset = 0

    // let previousItemInOrbit = null
    // Get each objects directly oribitng star (already sorted by distance)
    star._children = this.getChildren(star, true).map((itemInOrbit, i) => {
      // Ensure planets are always drawn slightly larger than their moons
      const MAIN_PLANET_MIN_R = MIN_R

      itemInOrbit._children = this.getChildren(itemInOrbit, false)

      itemInOrbit._r = itemInOrbit.radius / R_DIVIDER
      if (itemInOrbit._r < MAIN_PLANET_MIN_R) itemInOrbit._r = MAIN_PLANET_MIN_R
      if (itemInOrbit._r > MAX_R) itemInOrbit._r = MAX_R

      // Set attribute on smaller planets so we can select a different setting
      // on front end that will render them better
      if (itemInOrbit._r <= MAIN_PLANET_MIN_R) itemInOrbit._small = true

      itemInOrbit._y = 0
      itemInOrbit.orbitsStar = true

      // If this item (or the previous object) has rings, account for that
      // by makign sure there is more horizontal space between objects so that
      // the rings won't overlap when drawn.
      const itemXSpacing = (itemInOrbit.rings && !USE_ICONS_FOR_PLANETS) ? itemInOrbit._r / RING_X_SPACING_FACTOR : X_SPACING
      itemInOrbit._x = star._xMax + itemXSpacing + itemInOrbit._r

      const newYmax = itemInOrbit._r + X_SPACING
      if (newYmax > star._yOffset) star._yOffset = newYmax

      // If object has children,
      let newXmax = (itemInOrbit.rings) ? itemInOrbit._x + itemInOrbit._r + itemXSpacing : itemInOrbit._x + itemInOrbit._r
      if (itemInOrbit._children.length > 0 && (newXmax - star._xMax) < MIN_LABEL_X_SPACING) newXmax = star._xMax + MIN_LABEL_X_SPACING
      if (newXmax > star._xMax) star._xMax = newXmax

      // Initialize Y max with planet radius
      itemInOrbit._yMax = itemInOrbit._r + (Y_SPACING / 2)

      // Get every object that directly or indirectly orbits this item
      itemInOrbit._children
        .sort((a, b) => (a.distanceToArrival - b.distanceToArrival))
        .map(subItemInOrbit => {
          subItemInOrbit._r = subItemInOrbit.radius / R_DIVIDER
          if (subItemInOrbit._r < SUB_MIN_R) subItemInOrbit._r = SUB_MIN_R
          if (subItemInOrbit._r > SUB_MAX_R) subItemInOrbit._r = SUB_MAX_R

          // Set attribute on smaller planets so we can select a different setting
          // on front end that will render them better
          if (subItemInOrbit._r <= SUB_MIN_R) subItemInOrbit._small = true

          // Use parent X co-ords to plot on same vertical plane as parent
          subItemInOrbit._x = itemInOrbit._x

          // Use radius of current object to calclulate cumulative Y pos
          subItemInOrbit._y = itemInOrbit._yMax + subItemInOrbit._r + Y_SPACING

          // New Y max is  previous Y max plus current object radius plus spacing
          itemInOrbit._yMax = subItemInOrbit._y + subItemInOrbit._r

          subItemInOrbit.orbitsStar = false

          return subItemInOrbit
        })

      if (itemInOrbit._yMax > star._yMax) star._yMax = itemInOrbit._yMax

      // previousItemInOrbit = itemInOrbit
      return itemInOrbit
    })
    // Used by UI
    // TODO Add number of stations orbiting star and outposts on surfaces
    star.numberOfPlanets = star._children.filter(x => x.type === 'Planet').length
    star._children.forEach(child => {
      star.numberOfPlanets += child._children.filter(x => x.type === 'Planet').length
    })

    // If last item had rings, add padding to avoid clipping them on the edge
    // star._xMax += previousItemInOrbit?.rings ? previousItemInOrbit._r / RING_X_SPACING_FACTOR : X_SPACING
    star._xMax += X_SPACING
    star._yMax += Y_SPACING

    // This will be used to track the maxium number number of objects orbiting
    // it that any planet in the system has. This is useful for knowing how
    // to constrain the height (or not) when drawning maps.
    star._maxObjectsInOrbit = 0
    star._children.forEach(objectInOrbit => {
      if (objectInOrbit._children.length > star._maxObjectsInOrbit) { star._maxObjectsInOrbit = objectInOrbit._children.length }
    })

    star._yOffset += Y_LABEL_OFFSET
    star._viewBox = `0 -${star._yOffset} ${star._xMax + star._xOffset + 1500} ${star._yMax + star._yOffset}`

    return star
  }

  getBodyById (bodyId) {
    return this?.objectsInSystem?.filter(body => body.bodyId === bodyId)
  }

  getNearestPlanet (systemObject) {
    const targetDistanceToArrival = systemObject.distanceToArrival
    return this.objectsInSystem
      .filter(body => body.type === 'Planet')
      .reduce((ob1, ob2) => {
        return Math.abs(targetDistanceToArrival - ob2.distanceToArrival) < Math.abs(targetDistanceToArrival - ob1.distanceToArrival)
          ? ob2
          : ob1
      })
  }

  getNearestLandablePlanet (systemObject) {
    const targetDistanceToArrival = systemObject.distanceToArrival
    return this.objectsInSystem
      .filter(body => body.type === 'Planet' && body.isLandable)
      .reduce((ob1, ob2) => {
        return Math.abs(targetDistanceToArrival - ob2.distanceToArrival) < Math.abs(targetDistanceToArrival - ob1.distanceToArrival)
          ? ob2
          : ob1
      })
  }

  getChildren (targetBody, immediateChildren = true, filter = ['Planet'].concat(STARPORTS)) {
    const children = []
    if (!targetBody?.type) return []

    for (const systemObject of this.objectsInSystem) {
      // By default only get Planets and Starports
      if (filter?.length && !filter.includes(systemObject?.type)) continue

      const inOrbitAroundStars = []
      const inOrbitAroundPlanets = []
      const inOrbitAroundNull = []
      let primaryOrbit = null

      if (systemObject.parents) {
        for (const parent of systemObject.parents) {
          for (const key of Object.keys(parent)) {
            if (primaryOrbit === null) primaryOrbit = parent[key]
            if (key === 'Star') inOrbitAroundStars.push(parent[key])
            if (key === 'Planet') inOrbitAroundPlanets.push(parent[key])
            if (key === 'Null') inOrbitAroundNull.push(parent[key])
          }
        }
      }

      if (!systemObject.parents) continue

      // The most immediate body this object is orbiting
      systemObject._immediateOrbitBodyId = systemObject.parents.reverse()
        .map(parents => {
          const [keys] = Object.keys(parents)
          return parents[keys]
        })[0]

      // The first item in the list of primaries is the immediate primary orbit.
      // It's possible for some systems to have multiple Null points that
      // various bodies orbit around. We collabse these all into one Null orbi
      // (Body ID 0), which always exists anyway, to better visualise rogue
      // bodies that are not orbiting a specific star.
      if (primaryOrbit !== 0 && inOrbitAroundNull.includes(primaryOrbit)) {
        if (inOrbitAroundPlanets.length > 0) {
          primaryOrbit = inOrbitAroundPlanets[0]
        } else {
          // FIXME: Handles edge cases - e.g. where orbiting both a star
          // (or more than one star) and also another body. If that
          // is the case then we regard them as only orbiting the nearest star.
          //
          // The system map in Elite Dangerous view draws planets like this
          // with a square line to the planet they are orbiting, but our map
          // view doesn't support that currently, we just draw them as if they
          // are just another planet.
          //
          // NB: _immediateOrbitBodyId contains immediate body we are orbiting

          const planetsInOrbitAround = systemObject.parents.reverse().filter(parents => {
            const [keys] = Object.keys(parents)
            return (keys === 'Planet')
          }).map(parents => {
            const [keys] = Object.keys(parents)
            return parents[keys]
          })

          const starsInOrbitAround = systemObject.parents.reverse().filter(parents => {
            const [keys] = Object.keys(parents)
            return (keys === 'Star')
          }).map(parents => {
            const [keys] = Object.keys(parents)
            return parents[keys]
          })

          if (planetsInOrbitAround.length > 0) {
            primaryOrbit = planetsInOrbitAround[planetsInOrbitAround.length - 1]
          } else if (starsInOrbitAround.length > 0) {
            primaryOrbit = starsInOrbitAround[starsInOrbitAround.length - 1]
          } else {
            primaryOrbit = 0
          }
        }
      }

      // We should be able to skip all the above nonsense as _primaryOrbitBodyId
      // and _immediateOrbitBodyId should be the same, but the map view
      // doesn't seem to work well for this so leaving in the above logic
      // until we can list, cater for and test all the edge cases.
      // systemObject._primaryOrbitBodyId = systemObject._immediateOrbitBodyId
      systemObject._primaryOrbitBodyId = primaryOrbit

      if (targetBody.type === 'Star' && inOrbitAroundStars.includes(targetBody.bodyId)) {
        if (immediateChildren === true && primaryOrbit === targetBody.bodyId) {
          children.push(systemObject)
        } else if (immediateChildren === false) {
          children.push(systemObject)
        }
      } else if (targetBody.type === 'Planet' && inOrbitAroundPlanets.includes(targetBody.bodyId)) {
        if (immediateChildren === true && primaryOrbit === targetBody.bodyId) {
          children.push(systemObject)
        } else if (immediateChildren === false) {
          children.push(systemObject)
        }
      } else if (targetBody.type === 'Null' && inOrbitAroundNull.includes(targetBody.bodyId) && inOrbitAroundStars.length === 0 && inOrbitAroundPlanets.length === 0) {
        if (immediateChildren === true && primaryOrbit === targetBody.bodyId) {
          children.push(systemObject)
        } else if (immediateChildren === false) {
          children.push(systemObject)
        }
      } else if (immediateChildren === false) {
        // Stations / Outposts do not specify which body they orbit / are on.
        // Possible to guess which stations orbit which planets based on
        // which planets directy orbit the star have a similar distance, as
        // stations *do* have a distance from the arrival point.
      }
    }
    return children
  }

  // For planets, don't include the system name in the (informal) label to save
  // screen space, but do include still include it in things like station names.
  // e.g "Colonia 5" is fine with the label "5" in the system map, but the name
  // "Colonia Outpost" should not be truncated to "Outpost".
  getSystemObjectLabel (systemObject) {
    if (systemObject.type && systemObject.type === 'Planet') {
      return systemObject.name.replace(new RegExp(`^${escapeRegExp(this.name)} `), '')
    } else {
      return systemObject.name
    }
  }
}

module.exports = SystemMap
