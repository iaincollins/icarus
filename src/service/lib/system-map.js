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
const NORMALIZE_VIEWBOX_WIDTH = true
const MIN_VIEWBOX_WIDTH = 10000

const SOLAR_RADIUS = 696340 // Size of Sol in km

function escapeRegExp (text) {
  return text.replace(/[[\]{}()*+?.,\-\\^$|#\s]/g, '\\$&')
}

class SystemMap {
  constructor (system) {
    this.detail = system
    const { name = '', bodies: _bodies, stations = [] } = this.detail
    this.name = name

    // On the map, we draw a system view for each Star in a system, as that's
    // a great way to organise the information to make it easy to read.
    //
    // However, for this to work we need to to treat "Stars" that are more like
    // Planets (e.g. Class Y Brown Dawrf Stars or Class T Tauri Stars) that 
    // orbit other stars as if they were regular planets.
    //
    // We use our own classification system (stored in ._type) for the purpose
    // of deciding how we want to treat them for the purposes of the system map
    let bodies = this.#findStarsOrbitingOtherStarsLikePlanets(_bodies || [])

    // Squash duplicate entries (e.g. Rhea system, where Rhea 4 is now Forsyth),
    // or you end up with two planets with different names and the same body id
    // on the map
    bodies = this.#getUniqueObjectsByProperty(bodies, 'bodyId')

    this.stars = bodies.filter(body => body?._type === 'Star')
    this.planets = bodies.filter(body => body?._type === 'Planet')
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
      _type: 'Null',
      _children: []
    })

    this.init()
  }

  #getUniqueObjectsByProperty(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
  }

  #findStarsOrbitingOtherStarsLikePlanets (_bodies) {
    const bodies = JSON.parse(JSON.stringify(_bodies))

    const starsOrbitingStarsLikePlanets = []

    bodies.forEach((body, i) => {
      body._type = body.type

      // Only applies to stars
      if (body.type !== 'Star') return

      // Never applies to main stars (the Mizar or Castor systems are listed as
      // having a parent object that doesn't actually exist, this check catches
      // that exception).
      if (body.isMainStar === true) return

      // If Star doesn't have any non-null parent objects (i.e. it's not 
      // orbiting a planet or star) then we still treat it as one of the
      // "main stars" and don't reclassify it as a Planet for the system map
      if (this.#getNearestNotNullParent(body) === null) return

      // Change each _type from 'Star' to 'Planet')
      body._type = 'Planet'

      // Add a standard radius property (based on it's Solar radius)
      // This property is required to be able to draw the body on a map
      body.radius = body.solarRadius * SOLAR_RADIUS

      // Save the ID of this Body for the loop below...
      starsOrbitingStarsLikePlanets.push(body.bodyId)
    })

    // Update the 'parent' reference to each object orbiting 'star' from
    // orbiting a 'Star' to a 'Planet' so it's plotted correctly.
    bodies.forEach((body, i) => {
      (body?.parents ?? []).forEach((parent, i) => {
        const [k, v] = Object.entries(parent)[0]
        if (starsOrbitingStarsLikePlanets.includes(v)) {
          body.parents[i] = { Planet: v }
        }
      })
    })
    
    return bodies
  }

  #getNearestNotNullParent(body) {
    let nonNullParent = null
    ;(body?.parents || []).every(parent => {
      const [k, v] = Object.entries(parent)[0]
      if (k !== 'Null') {
        nonNullParent = v
        return false
      }
      return true
    })
    return nonNullParent
  }

  init () {
    for (const systemObject of this.objectsInSystem) {
      if (!systemObject._type) systemObject._type = systemObject.type
      
      // Attach name to system name
      // alert(escapeRegExp(this.detail.name))
      systemObject.label = this.getSystemObjectLabel(systemObject)
      // Loop through and find all stations / ships / etc and assign parents
      // value based on whatever planet they are nearest to (before calculating
      // co-ordiantes for values, which are used to draw the map). The approach
      // here may not always be technically correct, but it's good enough for
      // our map and should render meaningfully.
      if (!systemObject.parents && systemObject.type && STARPORTS.concat(PLANETARY_BASES).concat(MEGASHIPS).includes(systemObject.type)) {
        // Find planet with closest similar distance to sun
        // This could be the wrong choice in edge cases, but is good enough.
        const nearestPlanet = this.getNearestPlanet(systemObject)
        const nearestPlanetParentType = nearestPlanet?.parents?.[0] ? Object.keys(nearestPlanet.parents[0])[0] : null
        const nearestStar = this.getNearestStar(systemObject)

        // If parent of planet is a star (or null - for rogue planets) then make
        // it the main body this station orbits. However, if the nearest planet
        // is a orbiting another larger planet, make the target the larger planet
        const parentBodyId = (nearestPlanetParentType === 'Star' || nearestPlanetParentType === 'Null')
          ? nearestPlanet.bodyId
          : nearestPlanet?.parents?.[0]?.[nearestPlanetParentType] ?? null

        // If the object doesn't have a nearby planet it's orbiting, then assume
        // it's orbiting a star (e.g. like in Asterope which has 3 stars, no 
        // planets but a Mega Ship and Coriolis Starport).
        // 
        // FIXME reduce this to one check of 'Nearest Body Type' that returns 
        // nearest body regardless of if it is a Star or Planet, so that if 
        // the star is closer but there is a far away planet, that it doesn't 
        // show the object as orbiting the planet.
        systemObject.parents = parentBodyId === null
          ? nearestStar ? [{ Star: nearestStar.bodyId }] : [{ Null: 0 }]
          : [{ Planet: parentBodyId }]
        
        systemObject.radius = 1000

        const shipServices = []
        const otherServices = []
      
        if (systemObject.otherServices.includes('Repair')) shipServices.push('Repair')
        if (systemObject.otherServices.includes('Refuel')) shipServices.push('Refuel')
        if (systemObject.otherServices.includes('Restock')) shipServices.push('Restock')
        if (systemObject.otherServices.includes('Tuning')) shipServices.push('Tuning')
        if (systemObject.haveShipyard) shipServices.push('Shipyard')
        if (systemObject.haveOutfitting) shipServices.push('Outfitting')
        if (systemObject.haveMarket) otherServices.push('Market')

        systemObject.otherServices.forEach(service => {
          if (!shipServices.includes(service)) otherServices.push(service)
        })

        systemObject._shipServices = shipServices.sort()
        systemObject._otherServices = otherServices.sort()

        // If this object is any time of planetry port, outpost or settlement
        // then add it as a planetary base of the parent body
        if (PLANETARY_BASES.includes(systemObject.type) && systemObject?.body?.id) {
          for (const systemObjectParent of this.objectsInSystem) {
            if (systemObjectParent.id === systemObject.body.id) {
              if (!systemObjectParent._planetaryBases) systemObjectParent._planetaryBases = []
              systemObjectParent._planetaryBases.push(systemObject)
            }
          }
        }

        // Plot megaships
        // I think is is redundant now (seems to work without it after refactor)
        // but not verified for edge cases.
        /*
        if (MEGASHIPS.includes(systemObject.type)) {
          if (systemObject?.parents?.[0]?.['Planet']) {
            for (const systemObjectParent of this.objectsInSystem) {
              if (systemObjectParent.bodyId === nearestPlanet?.bodyId) {
                if (!systemObjectParent._megaships) systemObjectParent._megaships = []
                systemObjectParent._megaships.push(systemObject)
              }
            }
          } else {
            for (const systemObjectParent of this.objectsInSystem) {
              if (systemObjectParent.bodyId === nearestPlanet?.bodyId) {
                if (!systemObjectParent._megaships) systemObjectParent._megaships = []
                systemObjectParent._megaships.push(systemObject)
              }
            }
          }
        }
        */
      }
    }

    // Calculate position to draw items on map
    let maxViewBoxWidth = MIN_VIEWBOX_WIDTH
    this.stars.forEach(star => {
      this.plotObjectsAroundStar(star)
      if (star._viewBox[2] > maxViewBoxWidth) maxViewBoxWidth = star._viewBox[2]
    })

    if (NORMALIZE_VIEWBOX_WIDTH) {
      this.stars.forEach(star => {
        star._viewBox[2] = maxViewBoxWidth
      })
    }
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
    star.numberOfPlanets = star._children.filter(x => x._type === 'Planet').length
    star._children.forEach(child => {
      star.numberOfPlanets += child._children.filter(x => x._type === 'Planet').length
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
    star._viewBox = [
      0,
      parseInt(`-${star._yOffset}`),
      star._xMax + star._xOffset + 1500,
      star._yMax + star._yOffset
    ]
    return star
  }

  getBodyById (bodyId) {
    return this?.objectsInSystem?.filter(body => body.bodyId === bodyId)
  }

  getNearestPlanet (systemObject) {
    const targetDistanceToArrival = systemObject.distanceToArrival
    const planets = this.objectsInSystem.filter(body => body._type === 'Planet')
    if (planets.length === 0) return null
    return planets.reduce((ob1, ob2) => {
        return Math.abs(targetDistanceToArrival - ob2.distanceToArrival) < Math.abs(targetDistanceToArrival - ob1.distanceToArrival)
          ? ob2
          : ob1
      })
  }

  getNearestLandablePlanet (systemObject) {
    const targetDistanceToArrival = systemObject.distanceToArrival
    const landablePlanets = this.objectsInSystem.filter(body => body._type === 'Planet' && body.isLandable)
    if (landablePlanets.length === 0) return null
    return landablePlanets.reduce((ob1, ob2) => {
        return Math.abs(targetDistanceToArrival - ob2.distanceToArrival) < Math.abs(targetDistanceToArrival - ob1.distanceToArrival)
          ? ob2
          : ob1
      })
  }

  getNearestStar(systemObject) {
    const targetDistanceToArrival = systemObject.distanceToArrival
    const stars = this.objectsInSystem.filter(body => body._type === 'Star')
    if (stars.length === 0) return null
    if (stars.length === 1) return stars[0]
    return stars.reduce((ob1, ob2) => {
        return Math.abs(targetDistanceToArrival - ob2?.distanceToArrival ?? 0) < Math.abs(targetDistanceToArrival - ob1?.distanceToArrival ?? 0)
          ? ob2
          : ob1
      })
  }

  getChildren (targetBody, immediateChildren = true, filter = ['Planet'].concat(STARPORTS).concat(MEGASHIPS)) {
    const children = []
    if (!targetBody?._type) return []

    for (const systemObject of this.objectsInSystem) {
      // By default only get Planets and Starports
      if (filter?.length && !filter.includes(systemObject?._type)) continue

      const inOrbitAroundStars = []
      const inOrbitAroundPlanets = []
      const inOrbitAroundNull = []
      let primaryOrbit = null
      let primaryOrbitType = null

      if (systemObject.parents) {
        for (const parent of systemObject.parents) {
          for (const key of Object.keys(parent)) {
            if (primaryOrbit === null) primaryOrbit = parent[key]
            if (primaryOrbitType === null) primaryOrbitType = key

            if (key === 'Star') inOrbitAroundStars.push(parent[key])
            if (key === 'Planet') inOrbitAroundPlanets.push(parent[key])
            if (key === 'Null') inOrbitAroundNull.push(parent[key])
          }
        }
      }

      if (!systemObject.parents) continue

      const nearestNonNullParent = this.#getNearestNotNullParent(systemObject)
      
      // Some systems to have multiple Null points round which bodies orbit.
      // We noramlize these all into one Null orbit (Body ID 0) to allow the map
      // to better visualize bodies that are not orbiting any specific star.
      // This ONLY applies to bodies that are not also orbiting another body.
      if ( primaryOrbitType === 'Null' && nearestNonNullParent === null) {
        primaryOrbit = 0
      }

      if (targetBody._type === 'Star' && inOrbitAroundStars.includes(targetBody.bodyId)) {
        if (immediateChildren === true && nearestNonNullParent === targetBody.bodyId) {
          children.push(systemObject)
        } else if (immediateChildren === false) {
          children.push(systemObject)
        }
      } else if (targetBody._type === 'Planet' && inOrbitAroundPlanets.includes(targetBody.bodyId)) {
        if (immediateChildren === true && nearestNonNullParent === targetBody.bodyId) {
          children.push(systemObject)
        } else if (immediateChildren === false) {
          children.push(systemObject)
        }
      } else if (targetBody._type === 'Null' && primaryOrbitType === 'Null') {
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
    if (systemObject._type && systemObject._type === 'Planet') {
      return systemObject.name.replace(new RegExp(`^${escapeRegExp(this.name)} `, 'i'), '')
    } else {
      return systemObject.name
    }
  }
}

module.exports = SystemMap
