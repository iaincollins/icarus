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

<img alt="System Map" src="https://user-images.githubusercontent.com/595695/167961147-92ad4d3e-0126-47ac-afff-f811c1f399d6.png" height="auto" width="100%"/>

<img alt="System List" src="https://user-images.githubusercontent.com/595695/167961230-20034e53-7d86-4d73-8f20-120b6ccf9d91.png" height="auto" width="50%"/><img alt="Ship Status" src="https://user-images.githubusercontent.com/595695/167961307-ad4c3085-62f6-4c53-877d-04522af2e81d.png" height="auto" width="50%"/>
<img alt="Engineering" src="https://user-images.githubusercontent.com/595695/167961222-03a2b9f1-597d-407a-93af-e00998f2aabc.png" height="auto" width="50%"/><img alt="Navigation Route" src="https://user-images.githubusercontent.com/595695/167961304-17582ca6-9f91-4259-9d17-e366d5d90209.png" height="auto" width="50%"/>

## Requirements

* Windows 10 or newer is required. All releases are signed.
* ICARUS Terminal works with both the latest expansion (Odyssey) and the classic client (Horizons), but is currently explicitly designed for use with Odyssey and will display Odyssey specific information regardless of what version of the client you are using.
* ICARUS Terminal loads the most recent game session data in to memory when run and does not persist or cache the data to disk.
* You do not need to sign in, link accounts or do any manual configuration to use ICARUS Terminal.
* ICARUS Terminal is distributed as a native Win32 application and has no additional dependancies not handled by the installer (dependancies are limited to Microsoft provided DLLs and will be automatically installed during setup).
* ICARUS Terminal will check for new releases when it is run and will give you the option to install updates from the Launcher as soon as they are available.
* The web frontend - which allows access to the UI from devices other than the PC ICARUS Terminal is running on - relies on advanced browser functionality for rendering and works best on native Chrome browsers (e.g. Chrome for Windows/Mac/ChromeOS/Android). Other browsers (e.g. Safari, Firefox) may lack required features for full compatbility / optimal user experience.

## Developer Documenation
 
Code contributions, pull requests and bug reports are not currently being accepted for this repository.

See [CONTRIB.md](CONTRIB.md) for developer documenation, including one-step build instructions for Linux.

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
