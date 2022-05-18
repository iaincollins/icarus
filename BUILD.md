# Developer Documentation

_This documentation is intended for developers who want to build from source._

ICARUS is a Windows (Win32) application built primarily in JavaScript, using Node.js + WebSockets and Go with a fork of custom [Edge/WebView2 abstraction in C/C++](https://github.com/iaincollins/webview).

The self-contained installer is around 20 MB and has no dependancies. If you are running an older but supported release of Windows, any missing run time dependancies will be automatically and transparently installed by the bundled Microsft installer.

## Getting Started

The codebase is split up into three parts:

* `src/app` — "ICARUS Terminal.exe", a Win32 application written in Go
* `src/service` — "ICARUS Service.exe", a Win32 application written in Node.js
* `src/client` — A web based client interface, developed in Next.js/React

The web client is bundled into the service, and you can use web browser to connect directly to the service instead of (or as well as ) using "ICARUS Terminal.exe" to launch a native window to display the UI.

The service uses sockets to interact with clients on the local network and is able to as many terminals on as many devices as you may wish to access it from.

"ICARUS Terminal.exe" is still required for platform specific functionality, such as installing updates, creating always-on-top (pinned) windows and reliable save game detection as these rely on OS calls which are handled by the application.

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

### One-step cross platform build (Win/Mac/Linux)

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

## Development mode

You can run ICARUS Terminal in development mode without building a native binary, all you need installed is Node.js and a web browser to access the client.

* `npm install`
* `npm run dev`

You can access the web client at http://localhost:3300

Note: You may also need to create a `.env` file with a `LOG_DIR` entry so it can find your game data, see `.env-example`.