# Development notes

Some of the features and improvements currently being worked on:

* Add ability to pin Materials and Blueprints
* Blueprint names do not match names show in game
* Windows should restore to their origional position on screen after exiting fullscreen mode
* Windows should go fullscreen on the monitor they are triggered on (not always on the main window)
* Add faction information for remote systems to System Map
* Find somewhere to list all factions present on the System Map
* Show commander location / status / credits / bounties in header
* Show current bounty status in current system
* Show current bounty status at facilities
* Show when docking and limpet controller but no limpets
* Show body types on System Map by class (similar to FSS view)
* Show Bodies Scanned / Not Scanned on System Map
* Move text for number of bodies in system on System Map back to top
* Expand data shown in Navigation List View (planet type, etc)
* Revert vertical centering No System Information text
* Show interesting bodies in system (features, atmospheres, bodies in close orbit, etc)
* Show Route summary and Next/Prev systems on route in the System Map view when in a system that is on a plotted route
* Improve blend of local map data with EDSM data in Navigation panel
* Add labels-on-hover to secondary navigation buttons (as seen in maps in game)
* Improve quality of animation FX on long data tables
* Improve application icon
* Add exit button on bottom left of Map and List views
* Update time in header using ref instead of hook
* Fix for systems like EOL PROU RI-Q C6-9 with (a) multiple Null orbits and (b) stars orbiting Null points http://localhost:3300/nav/map?system=eol+prou+ri-q+c6-9
* Listen for Set User Ship Name event and update name/ident when it changes
* Improve loading apperance (UI scaling, theme application) to reduce jankiness
* Show distance from systems in currently plotted route
* Show distance from remote systems being viewed in System Map
* Use Location event to determine current system, then override with FSD event if newer (other events can come later). Location is fired at startup and after respawning.