# ICARUS

ICARUS Terminal is a second screen interface for the game [Elite Dangerous](https://www.elitedangerous.com/).

<img src="https://user-images.githubusercontent.com/595695/137490706-4772ba94-904e-47f4-8bf0-759d3ca51287.png">

ICARUS is a Windows (Win32) application built primarily in JavaScript, using Node.js + WebSockets and Go with a fork of custom [Edge/WebView2 abstraction in C/C++](https://github.com/iaincollins/webview).

This inital public release is focused on sharing the application scaffolding, following development of an early proof of concept in Electron. In comparison to the Electron prototype, this implementation has a smaller memory footprint and a much smaller package size (~20 MB vs ~200 MB) while still being able to leverage an existing codebase (and third party libraries) developed in JavaScript. The trade off for this includes additional complexity in the build process and the development of custom launcher / application shell in Go/C++.

This release does not currently include the logic or assests developed for the prototype. The intention is to port the existing functionality that has been developed over to this codebase and to publish a public beta when there is minimum viable level of functionality. The first thing to be ported willl be the event handling logic.

## Getting Started

_This documentation is intended for developers._

### Requirements

To build this application you need to be running Microsoft Windows and have the following dependencies installed:

* [Go Lang](https://golang.org/) for the Win32 UI
* [Node.js](https://nodejs.org/en/download/) for the backend socket service
* [NSIS (Nullsoft Scriptable Install System)](https://nsis.sourceforge.io/) to build the Windows installer (e.g. `winget install NSIS.NSIS`)
* [Visual Studio](https://visualstudio.microsoft.com/downloads/) or MS Build Tools with "Desktop development with C++"

To run the application you need to have the [Microsoft Edge Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) installed. 

Notes:

* Run `npm install` to install/update dependencies before building.
* The Edge Runtime is the only runtime dependancy.
* A dependancy check and loader for the Edge Runtime installer will likely be bundled with the installer for release.

### Building

With dependencies installed, you can build the application in a single step:

* `npm run build`

This will output a standalone installer "ICARUS Setup.exe" in `dist/` directory.

Intermediate builds can be found in `build/` directory. See `build/bin` for the final binaries, these can be run in place without having to run the installer. If you run "ICARUS Terminal.exe" it will start the "ICARUS Service.exe" automatically in the background (and shut it down again when the main Terminal window is closed).

You can also run each build step independently:

* `npm run build:app` builds only the GUI app (ICARUS Terminal)
* `npm run build:service` builds only the service (ICARUS Terminal Service)
* `npm run build:package` builds only the Windows installer
* `npm run build:web` builds only the web interface
* `npm run build:clean` resets the build environment

You can enable/disable debugging and skip build optimization using constants defined in `scripts/lib/build-options.js`.

Notes:

* "ICARUS Terminal.exe" depends on "ICARUS Service.exe" being in the same directory to run, or it will exit on startup with a message indicating unable to start the ICARUS Terminal Service.
* For development purposes, you can also run the service in development mode with `npm run dev` and start the Terminal in headless mode with `ICARUS Terminal.exe -terminal -port 3300`.
