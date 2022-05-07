# Location Event

Note: Similar to FSDJump.

When written: at startup, or when being resurrected at a station

Parameters:

 * StarSystem: name of destination starsystem
 * SystemAddress
 * StarPos: star position, as a Json array [x, y, z], in light years
 * Body: star or planet’s body name
 * BodyID
 * BodyType 
 * DistFromStarLS: (unless close to main star)
 * Docked: (bool)
 * Latitude (If landed)
 * Longitude (if landed)
 * StationName: station name, (if docked)
 * StationType: (if docked)
 * MarketID: (if docked)
 * SystemFaction: star system controlling faction
   * Name
   * FactionState
 * SystemAllegiance
 * SystemEconomy
 * SystemSecondEconomy
 * SystemGovernment
 * SystemSecurity
 * Wanted
 * Factions: an array with info on local minor factions (similar to FSDJump)
 * Conflicts: an array with info on local conflicts (similar to FSDJump)

If the player is pledged to a Power in Powerplay, and the star system is involved in powerplay:

 * Powers: a json array with the names of any powers contesting the system, or the name of the controlling power
 * PowerplayState: the system state – one of ("InPrepareRadius", "Prepared", "Exploited", "Contested", "Controlled", "Turmoil", "HomeSystem")

The faction data includes happiness info, and can include multiple active states

If starting docked in a station, also include:

 * StationFaction
   * Name
   * FactionState
 * StationGovernment
 * StationAllegiance
 * StationServices
 * StationEconomies (Array of (Name,Proportion) pairs )

New in Odyssey:

 * Taxi: bool
 * Multicrew: bool
 * InSRV: bool
 * OnFoot: bool 