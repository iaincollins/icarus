<img alt="ICARUS Terminal" src="https://user-images.githubusercontent.com/595695/156449445-855d12f5-4f91-4a6f-ab24-a137572df4f7.svg" height="100" width="auto"/>

![GitHub Version](https://img.shields.io/github/v/release/iaincollins/icarus??display_name=tag&include_prereleases&sort=semver&color=cf7500&style=for-the-badge)
![GitHub License](https://img.shields.io/github/license/iaincollins/icarus?color=cf7500&style=for-the-badge)
![GitHub Downloads](https://img.shields.io/github/downloads/iaincollins/icarus/total?color=cf7500&style=for-the-badge)

_ICARUS Terminal is currently in early access._

## About ICARUS Terminal

_ICARUS Terminal is a free, immersive, context-sensitive companion app and second screen interface for the game [Elite Dangerous](https://www.elitedangerous.com/)._

You can run ICARUS Terminal in a native window, on multiple windows/displays, as an overlayed window in top of the game if playing with a VR headset or on an ultra-wide display or connect remotely in a browser from another computer/tablet/phone/other devices (e.g. Chromebook, Android Phone/Tablet, Amazon Fire Tablet); the UI is specifically designed with touch screen devices in mind and to adapt the layout of panels to both landscape and portrait displays, both large and small.

<p align="center">&nbsp;</p>

<p align="center">
  <a href="https://github.com/iaincollins/icarus/releases">
    <img alt="Download" src="https://user-images.githubusercontent.com/595695/156449436-a2452073-ca27-4916-b21f-6eb1e7370bf2.svg" height="80" width="auto"/>
  </a>
</p>

## Screenshots

<img alt="System Map" src="https://user-images.githubusercontent.com/595695/174604534-3ab2bb75-073b-4dfa-b7b3-3973d1c77b7b.png" height="auto" width="98.5%"/>

<img alt="System List" src="https://user-images.githubusercontent.com/595695/173226427-d7eec44b-6566-41b1-8b27-b971ed02cfc3.png" height="auto" width="49%"/> <img alt="Ship Status" src="https://user-images.githubusercontent.com/595695/174604547-a26b0c18-dc37-4bc6-9e82-05a5cd8c250b.png" height="auto" width="49%"/>
<img alt="Engineering" src="https://user-images.githubusercontent.com/595695/173226377-6f18a869-dadf-43c5-80d1-874d7fc53d0c.png" height="auto" width="49%"/> <img alt="Navigation Route" src="https://user-images.githubusercontent.com/595695/173226433-0c6da8b9-009d-4e19-9296-05a4b42e7d9f.png" height="auto" width="49%"/>

## Requirements

The self-contained installer is around 20 MB and has no dependancies. If you are running an older but supported release of Windows, any missing run time dependancies will be automatically and transparently installed by the bundled Microsft installer.

* Windows 10 or newer is required.
* No dependancies are required to install the application.
* No manual configuration or setup is required to use the application.
* No additional diskspace is required to store game data. Recent game data is loaded in to memory when launched and streamed in real time when the game is active, it is not persisted or cached to disk.

### Notes

* This software is in early access. All releases are pre-releases and contain known defects.
* The launcher will indicate when a new release is available. Updating is optional.
* All releases are code signed and verified. If you have a conflict with your anti-virus or firewall software, please contact the vendor responsible for that software.
* The application will run against the latest version of Elite Dangerous (Odyssey) and older releases (e.g. Horizons), but it is currently explicitly designed for use with the latest versions. Changes to the game API may impact functionality when using ICARUS Terminal with older versions of the game.
* The application includes a web interface allows access the client from devices other than the PC the application is running on. This is enabled by default while the application is running.

The web interface relies on advanced browser functionality for rendering and works best on native Google Chrome browsers (e.g. Google Chrome for Windows, Mac, ChromeOS, Android). Other browsers (e.g. Safari, Firefox, Chromium) may use fallback rendering and/or lack required features for full compatbility / optimal user experience.

## Developer Documentation
 
Code contributions, pull requests and bug reports are not currently being accepted for this repository. See [CONTRIB.md](CONTRIB.md) for more information.

For developer documenation, including one-step build instructions for Windows/Mac/Linux, see [BUILD.md](BUILD.md).

## Legal

ICARUS Terminal is free, open-source software released under the ISC License.

ICARUS Terminal does not record Personally Identifiable Information (PII). ICARUS Terminal includes integrations with services like [EDSM](https://www.edsm.net), [EDDB](https://eddb.io/) and [INARA](https://inara.cz/). Data such as your current in-game location, cargo, etc. may be sent to them order to render information in the interface. ICARUS Terminal does not expose or send information about you or your in game character (e.g. your name, user name, commander name or ship name) but any requests made to a third party will include your IP address.

Elite Dangerous is copyright Frontier Developments plc. This software is not endorsed by nor reflects the views or opinions of Frontier Developments and no employee of Frontier Developments was involved in the making of it.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.

## Credits

_ICARUS Terminal would not be possible without work from dozens of enthusiasts and hundreds of open source contributors._

* The name ICARUS was suggested by [SpaceNinjaBear](https://www.reddit.com/user/SpaceNinjaBear) on Reddit.
* Loading animation by [James Panter](http://codepen.io/jpanter/pen/PWWQXK).
* Includes origional icons, icons inspired by those found in Elite Dangerous and icons based on those from [edassets.org](https://edassets.org).
* Uses stellar cartography data from the wonderful [EDSM API](https://www.edsm.net).
* Includes game data collated and provided by [EDCD](https://github.com/EDCD/FDevIDs).
* The [Jura font](https://fonts.google.com/specimen/Jura#glyphs) is included under the Open Font License.
* Thank you to [Serge Zaitsev](https://github.com/zserge) for his work on the WebView library.

ICARUS Terminal uses imagery from/inspired by Elite Dangerous, which is copyright Frontier Developments plc. This software is not endorsed by nor reflects the views or opinions of Frontier Developments and no employee of Frontier Developments was involved in the making of it.

Thank you to all those who have created and supported libraries on which this software depends and to Frontier Developments plc for supporting third party tools.
