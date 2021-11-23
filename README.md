# <img src="https://user-images.githubusercontent.com/595695/142777841-975d2279-eb6f-47fc-99c2-f024d949268a.png" width="50" align="left"> ICARUS Terminal

ICARUS Terminal is a second screen interface for the game [Elite Dangerous](https://www.elitedangerous.com/).

_This documentation is intended for developers. This is pre-release software and not yet ready for general release._

[You can download the latest release here.](https://github.com/iaincollins/icarus/releases/latest)

_There is no pre-release channel, pre-releases are being published as full releases (and this will remain the case until the release of 1.0)._

<img src="https://user-images.githubusercontent.com/595695/137490706-4772ba94-904e-47f4-8bf0-759d3ca51287.png">

ICARUS is a Windows (Win32) application built primarily in JavaScript, using Node.js + WebSockets and Go with a fork of custom [Edge/WebView2 abstraction in C/C++](https://github.com/iaincollins/webview).

This inital public release is focused on sharing the application scaffolding, following development of an earlier (unreleased) proof of concept created in Electron. In comparison to the Electron version, this implementation has a smaller memory footprint and a much smaller package size (~20 MB vs ~200 MB).

This approach means the functionality from the previous version can be ported into this version and that it is easier to leverage existing third party libraries. The trade off is includes additional complexity in the build process and that it required development of custom launcher / application shell in Go/C++ and custom software update mechaism (using NSIS and GitHub Releases).

This release does not currently include the logic or assests developed for the prototype. The intention is to port the existing functionality that has been developed over to this codebase and to publish a public beta when there is minimum viable level of functionality. The first thing to be ported willl be the event handling logic.

## Getting Started

The codebase is split up into three parts:

* `src/app` — "ICARUS Terminal.exe", a Win32 application written in Go
* `src/service` — "ICARUS Service.exe", a Win32 application written in Node.js
* `src/web` — A web based interface developed in Next.js/React

### ICARUS Terminal.exe

"ICARUS Terminal.exe" serves as both a launcher and a shell to render the graphical interface. It creates new terminal windows by spawing itself with the `--terminal` and `--port` flags). All terminal processes exit when the launcher terminates. 

"ICARUS Terminal.exe" uses [a fork of a webview wrapper for Go/C++](https://github.com/iaincollins/webview) which uses the Microsoft Edge/Chromium engine to render the interface. This library has been manually bundled with this project in `resources/dll`, along with a suitable loader from Microsoft.

There can be multiple instances of "ICARUS Terminal.exe" running. It designed to allow you to pin multiple windows to a single screen, or run multiple windows across different screens. The first instance will be designated as the "launcher" window. The launcher will have a different interface to the terminal windows and is responsible for starting and stopping the background service, for checking for updates and for shutting down terminal windows when the main window (the launcher) is closed.

### ICARUS Service.exe

"ICARUS Service.exe" is a self contained service, websocket server and a static webserver. The service interfaces with the game, broadcasts events to terminals and allows the graphical interface to be accessed remotely. It is invoked automatically by "ICARUS Terminal.exe" and stops when "ICARUS Terminal.exe" terminates.

The web interface is written in Next.js/React and is statically exported and the assets bundled inside "ICARUS Service.exe", making it a self contained service that can be used without "ICARUS Terminal.exe", by connecting to the service via a web browser - an approach which makes the codebase highly portable, as "ICARUS Terminal.exe" only needs to handle native OS Window management and the software updating mechanism.

All terminals (and any web clients) connect to the same single instance of service which receives and broadcasts messages to all of them using a websocket interface, there should only ever one instance of "ICARUS Service.exe" running at a time

### Requirements

To build the entire application you need to be running Microsoft Windows and have the following dependencies installed:

* [Go Lang](https://golang.org/) to build the Win32 app (ICARUS Terminal)
* [Node.js](https://nodejs.org/en/download/)  to build the socket service (ICARUS Service) and React UI
* [NSIS (Nullsoft Scriptable Install System)](https://nsis.sourceforge.io/) to build the Windows installer (can install with `winget install NSIS.NSIS`)

If you are only working on the service and/or the Next.js/React UI then you may only need Node.js installed, allowing for easy cross platform development on Windows/Mac/Linux.

Currently Elite Dangerous is only offically supported on Windows (and consoles) and there are not native Mac or Linux build steps for this application, though the codebase is highly portable and is technically possible. The service is already able to cross-compiled; with modifications to the Window and process handling routines the app shell could be ported to other platforms fairly easily if there is demand.

Currently the intent is to focus on providing option for Elite Dangerous for Windows, though there is an OAuth secured API that could be used to provide some level of functionality to XBox and PlayStation users (in which case something like a Mac version would make more sense).

You may also need the following dependancies, depending on the build steps you wish to run (e.g. if you are building assets):

* [Python 3](https://www.python.org/downloads/) for building assets and binaries
* [Visual Studio](https://visualstudio.microsoft.com/downloads/) or MS Build Tools with "Desktop development with C++" for working with Windows APIs

There are no dependancies required to install and use the application.

### Building

With the required build tools and dependencies installed (`npm install`) you can build the application in a single step:

* `npm run build`

This will output a standalone installer "ICARUS Setup.exe" in `dist/` directory.

Intermediate builds can be found in `build/` directory. See `build/bin` for the final binaries, these can be run in place without having to run the installer. If you run "ICARUS Terminal.exe" it will start the "ICARUS Service.exe" automatically in the background (and shut it down again when the main Terminal window is closed).

You can also run each build step independently:

* `npm run build:app` builds only the GUI app (ICARUS Terminal.exe)
* `npm run build:service` builds only the service (ICARUS Service.exe)
* `npm run build:package` builds only the Windows installer (ICARUS Setup.exe)
* `npm run build:web` builds only the web interface; required to build the service as is an embedded resource
* `npm run build:assets` builds assets (icons, fonts, etc); assets are commited the repository and only rebuilt when this is expicitly run
* `npm run build:clean` resets the build environment

You can also generate fast, unoptimized builds to test executables without building an installable package:

* `npm run build:debug` build ICARUS Terminal.exe and ICARUS Service.exe with debug output and no optimization
* `npm run build:debug:app` build ICARUS Terminal.exe with debug output and no optimization
* `npm run build:debug:service` build ICARUS Service.exe with debug output and no optimization

A debug build displays debug information on the console and builds very quickly (1-2 seconds). The functionality should be the same, however builds may be slower and binary sizes are significantly larger.

Notes:

* "ICARUS Terminal.exe" depends on "ICARUS Service.exe" being in the same directory to run, or it will exit on startup with a message indicating unable to start the ICARUS Terminal Service, so you must build the service at least before you can launch "ICARUS Terminal.exe" directly.
* You can also run the service in development mode with `npm run dev:service` together with the web interface started from another terminal with `npm run dev:web`. Both must be running at the same time. You can then interact with the application via browser on `http://localhost:3300`. You can use this to do feature development and testing on any platform (e.g. Mac, Linux).

## Contributing

I'm not currently taking code contributions or able to provide support right now. Please do not raise pull requests at this time.

Please feel free to ask questions or float ideas in Discussions. It's helpful to raise issues if there are problems running the software, but it's probably not best to expect a solution anytime soon.

You can fork this codebase and use it for your own apps! See the LICENSE file for details.

## Credits

The name ICARUS was suggested by [SpaceNinjaBear](https://www.reddit.com/user/SpaceNinjaBear).

I'd like to express appreciation to [Serge Zaitsev](https://github.com/zserge) for his work on the WebView library.

The loading animation is by James Panter (http://codepen.io/jpanter/pen/PWWQXK).

Thank you to all those who have written libraries on which this software depends.

A full list of credits will be in place before the release of v1.0.0.
