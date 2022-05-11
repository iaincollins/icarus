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

## More Information

ICARUS Terminal is free, open-source software.
 
Windows 10 or newer is required. All releases are signed with a code signing certificate. ICARUS Terminal checks for new releases and will give you the option to install updates when they available. 

ICARUS Terminal does not record Personally Identifiable Information (PII). ICARUS Terminal includes integrations with services like [EDSM](https://www.edsm.net), [EDDB](https://eddb.io/) and [INARA](https://inara.cz/). Data such as your current in-game location, cargo, etc. may be sent to them order to render information in the interface. ICARUS Terminal does not expose or send information about you or your in game character (e.g. your name, user name, commander name or ship name) but any requests made to a third party will include your IP address.
 
Instructions for a one-step build process for native versions on Linux and MacOS X (or older versions of Windows) can be found in the documentation for developers below.

Elite Dangerous is copyright Frontier Developments plc. This software is not endorsed by nor reflects the views or opinions of Frontier Developments and no employee of Frontier Developments was involved in the making of it.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.

----

## Developer Documentation

_This documentation is intended for developers._

ICARUS is a Windows (Win32) application built primarily in JavaScript, using Node.js + WebSockets and Go with a fork of custom [Edge/WebView2 abstraction in C/C++](https://github.com/iaincollins/webview).

The self-contained installer is around 20 MB and has no dependancies. If you are running an older but supported release of Windows, any missing run time dependancies will be automatically and transparently installed by the bundled Microsft installer.

## Getting Started

The codebase is split up into three parts:

* `src/app` — "ICARUS Terminal.exe", a Win32 application written in Go
* `src/service` — "ICARUS Service.exe", a Win32 application written in Node.js
* `src/web` — A web based interface developed in Next.js/React

### ICARUS Terminal.exe

"ICARUS Terminal.exe" serves as both a launcher and a shell to render the graphical interface. It creates new terminal windows by spawing itself with the `--terminal` and `--port` flags). All terminal processes exit when the launcher terminates. 

"ICARUS Terminal.exe" uses [a fork of a webview wrapper for Go/C++](https://github.com/iaincollins/webview) which uses the Microsoft Edge/Chromium engine included in Windows to render the interface. This library has been manually bundled with this project in `resources/dll`, along with a suitable loader from Microsoft. This project does not install it's own webview rendering engine and uses the one built into Windows.

There can be multiple instances of "ICARUS Terminal.exe" running. ICARUS Terminal is designed to allow you to pin multiple windows to a single screen, or run multiple windows across different screens. The first instance will be designated as the "launcher" window. The launcher will have a different interface to the terminal windows and is responsible for starting and stopping the background service, for checking for updates and for shutting down terminal windows when the main window (the launcher) is closed.

### ICARUS Service.exe

"ICARUS Service.exe" is a self contained service, websocket server and a static webserver. The service interfaces with the game, broadcasts events to terminals (using a two way socket based API) and allows the graphical interface to be accessed remotely from computers, tablets and phones. ICARUS Service is invoked automatically by "ICARUS Terminal.exe" and is stopped when "ICARUS Terminal.exe" is quit.

The user interface is written in Next.js/React and is statically exported and the assets bundled inside "ICARUS Service.exe", making it an entirely self contained service that can be used without "ICARUS Terminal.exe", by connecting to the service via a web browser - an approach which makes the codebase highly portable, as it leaves "ICARUS Terminal.exe" to handle interactions with native OS APIs for things like window management and software updates.

All terminals (and any web clients) connect to the same single instance of service which receives and broadcasts messages to all of them using a websocket interface. There should only ever one instance of "ICARUS Service.exe" running at a time. It defaults to runnning on port 3300, although this is configurable at run time using command line flags.

## Building

### Requirements

To build the entire application you need to be running Microsoft Windows and have the following dependencies installed:

* [Go Lang](https://golang.org/) to build the Win32 app (ICARUS Terminal)
* [Node.js](https://nodejs.org/en/download/)  to build the socket service (ICARUS Service) and React UI
* [NSIS](https://nsis.sourceforge.io/) to build the Windows installer (can install with `winget install NSIS.NSIS`)

You may also need the following dependancies, depending on the build steps you wish to run (e.g. if you are building assets):

* [Python 3](https://www.python.org/downloads/) for building assets and binaries
* [Visual Studio](https://visualstudio.microsoft.com/downloads/) or MS Build Tools with "Desktop development with C++" for working with Windows APIs

Currently Elite Dangerous is only offically supported on Windows however you can build and run the core cross platform on Windows, Mac and Linux. ICARUS Terminal does not currently support integration with console platforms (XBox and PlayStation) as they use a different implementation of the API. As the console version of Elite Dangerous is now in maintenance mode (as of March 2022) plans to support the console releases have been deprioritized.

### Building on Windows

With the required build tools and dependencies installed (`npm install`) you can build the application in a single step:

* `npm run build`

This will output a standalone installer "ICARUS Setup.exe" in `dist/` directory.

Intermediate builds can be found in `build/` directory. See `build/bin` for the final binaries, these can be run in place without having to run the installer. If you run "ICARUS Terminal.exe" it will start the "ICARUS Service.exe" automatically in the background (and shut it down again when the main Terminal window is closed).

You can also run each build step independently:

* `npm run build:app` builds only the GUI app (ICARUS Terminal.exe)
* `npm run build:service` builds only the service (ICARUS Service.exe)
* `npm run build:package` builds only the Windows installer (ICARUS Setup.exe)
* `npm run build:web` builds only the web interface; required to build the service as is an embedded resource
* `npm run build:assets` builds assets (icons, fonts, etc) - e.g. used to update the icon font
* `npm run build:clean` resets the build environment

You can also generate fast, unoptimized builds to test executables without building an installable package:

* `npm run build:debug` build ICARUS Terminal.exe and ICARUS Service.exe with debug output and no optimization
* `npm run build:debug:app` build ICARUS Terminal.exe with debug output and no optimization
* `npm run build:debug:service` build ICARUS Service.exe with debug output and no optimization

A debug build displays debug information on the console and builds very quickly (1-2 seconds). The functionality should be the same, however builds may be slower and binary sizes are significantly larger.

Note:

"ICARUS Terminal.exe" depends on "ICARUS Service.exe" being in the same directory to run, or it will exit on startup with a message indicating unable to start the ICARUS Terminal Service, so you must build the service at least once before you can launch "ICARUS Terminal.exe" directly.

### Building cross platform (Win/Mac/Linux)

ICARUS Terminal can also be run as a native, standalone application (without an installer) on Windows, Mac and Linux. Elite Dangerous is not offically supported on Linux or Mac and neither is ICARUS Terminal. I strongly recommend running the Windows version of ICARUS Terminal under the same emulation/compatibility layer as you are using for Elite Dangerous, but this option is provided for completeness.

The only requirement for building the core service is [Node.js](https://nodejs.org/en/download/).

You can easily build a native standalone binary for Windows, Mac and Linux with:

* `npm install`
* `npm run build:standalone`

This will build cross platform binaries for Windows (x86), Mac (x64) and Linux (x64) in the `dist/` directory.

For usage information run the binary with the `--help` flag.

Notes:

* The standalone binary does not feature auto-update notifications.
* The standalone binary does not have a native UI, you must connect via a browser.
* Features that depend on native UI (e.g. always on top, borderless) are not supported.
* If you wish to build for other architure (e.g. arm64) edit the target value for your platform in `scripts\build-standalone.js`.
* On Linux, due to what seems to bug in the complier not bundling resources correctly, the binary needs to be executed from the dist directory (i.e. `dist/icaurs-terminal-service-linux`) and it may not work correctly if it is moved to another location.

As the game itself is not supported by the developers on Mac or Linux I do not plan to aim for feature parity on these platforms.

## Development mode (cross platform)

You can run ICARUS Terminal in development mode without building a native binary, all you need installed is Node.js.

* `npm install`
* `npm run dev`

You can access the UI via http://localhost:3300

Note: You may also need to create a `.env` file with a `LOG_DIR` entry so it can find your game data, see `.env-example`.

## Contributing / Feedback

Please feel free to ask questions or float ideas in Discussions. 

I'm not currently taking code contributions, looking for bug reports or able to provide support. 

It's helpful to raise issues if there are problems actually running the software, however I'm not looking for bug reports relating to game data or application state. This software is still in early access and as such as there are many known issues as lots of functionality is incomplete.

You are free to fork this codebase and use it to make your own app. See the LICENSE file for details.

Please do not raise pull requests against this repo.

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
