# Status File

In addition to the journal file, which is written incrementally, there is now (in v3.0) a new file
Status.json which is updated every few seconds, with some information about the current state of
the game.

This has a similar format to a line in the journal, but the whole file is replaced every time. It has a
timestamp like the journal, and "event":"Status"
Parameters:
o Flags: multiple flags encoded as bits in an integer (see below)
o Flags2: more flags, mainly for when on foot
o Pips: an array of 3 integers representing energy distribution (in half-pips)
o Firegroup: the currently selected firegroup number
o GuiFocus: the selected GUI screen
o Fuel: { FuelMain, FuelReservoir} – both mass in tons
o Cargo: mass in tons
o LegalState
o Latitude (if on or near a planet)
o Altitude
o Longitude
o Heading
o BodyName
o PlanetRadius

LegalState: one of:
"Clean",
"IllegalCargo",
"Speeding",
"Wanted",
"Hostile",
"PassengerWanted",
"Warrant"

Additional values when on foot:
 Oxygen: (0.0 .. 1.0)
 Health: (0.0 .. 1.0)
 Temperature (kelvin)
 SelectedWeapon: name
 Gravity: (relative to 1G) 


Bit Value Hex Meaning
0 1 0000 0001 Docked, (on a landing pad)
1 2 0000 0002 Landed, (on planet surface)
2 4 0000 0004 Landing Gear Down
3 8 0000 0008 Shields Up
4 16 0000 0010 Supercruise
5 32 0000 0020 FlightAssist Off
6 64 0000 0040 Hardpoints Deployed
7 128 0000 0080 In Wing 
8 256 0000 0100 LightsOn
9 512 0000 0200 Cargo Scoop Deployed
10 1024 0000 0400 Silent Running,
11 2048 0000 0800 Scooping Fuel
12 4096 0000 1000 Srv Handbrake
13 8192 0000 2000 Srv using Turret view
14 16384 0000 4000 Srv Turret retracted (close to ship)
15 32768 0000 8000 Srv DriveAssist
16 65536 0001 0000 Fsd MassLocked
17 131072 0002 0000 Fsd Charging
18 262144 0004 0000 Fsd Cooldown
19 524288 0008 0000 Low Fuel ( < 25% )
20 1048576 0010 0000 Over Heating ( > 100% )
21 2097152 0020 0000 Has Lat Long
22 4194304 0040 0000 IsInDanger
23 8388608 0080 0000 Being Interdicted
24 16777216 0100 0000 In MainShip
25 33554432 0200 0000 In Fighter
26 67108864 0400 0000 In SRV
27 134217728 0800 0000 Hud in Analysis mode
28 268435456 1000 0000 Night Vision
29 536870912 2000 0000 Altitude from Average radius
30 1073741824 4000 0000 fsdJump
31 2147483648 8000 0000 srvHighBeam

Flags2 bits:
Bit value hex meaning
0 1 0001 OnFoot
1 2 0002 InTaxi (or dropship/shuttle)
2 4 0004 InMulticrew (ie in someone else’s ship)
3 8 0008 OnFootInStation
4 16 0010 OnFootOnPlanet
5 32 0020 AimDownSight
6 64 0040 LowOxygen
7 128 0080 LowHealth
8 256 0100 Cold
9 512 0200 Hot
10 1024 0400 VeryCold
11 2048 0800 VeryHot
12 4096 1000 Glide Mode
13 8192 2000 OnFootInHangar
14 16384 4000 OnFootSocialSpace
15 32768 8000 OnFootExterior
16 65536 0001 0001 BreathableAtmosphere

Examples:
{ "timestamp":"2017-12-07T10:31:37Z", "event":"Status", "Flags":16842765, "Pips":[2,8,2], "FireGroup":0,
"Fuel":{ "FuelMain":15.146626, "FuelReservoir":0.382796 }, "GuiFocus":5 }
{ "timestamp":"2017-12-07T12:03:14Z", "event":"Status", "Flags":18874376, "Pips":[4,8,0], "FireGroup":0,
"Fuel":{ "FuelMain":15.146626, "FuelReservoir":0.382796 }, "GuiFocus":0, "Latitude":-28.584963,
"Longitude":6.826313, "Heading":109, "Altitude": 404 }
In the first example above 16842765 (0x0101000d) has flags 24, 16, 3, 2, 0: In main ship, Mass
locked, Shields up, Landing gear down, Docked 

GuiFocus values:
 0 NoFocus
 1 InternalPanel (right hand side)
 2 ExternalPanel (left hand side)
 3 CommsPanel (top)
 4 RolePanel (bottom)
 5 StationServices
 6 GalaxyMap
 7 SystemMap
 8 Orrery
 9 FSS mode
 10 SAA mode
 11 Codex
The latitude or longitude need to change by 0.02 degrees to trigger an update when flying, or by
0.0005 degrees when in the SRV
If the bit29 is set, the altitude value is based on the planet’s average radius (used at higher altitudes)
If the bit29 is not set, the Altitude value is based on a raycast to the actual surface below the
ship/srv 

