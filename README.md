# ICARUS

ICARUS Terminal is a second screen UI for the game Elite Dangerous.

It is Windows (Win32) application, build with Node.js, Go and a custom 
Edge/WebView2 abstraction library in C/C++.

This inital public release is focused on application scaffolding.

_This documentation is intended for developers._

## Requirements

To build the application you will need:

* Go https://golang.org/
* Node.js https://nodejs.org/en/download/
* NSIS https://nsis.sourceforge.io/ / `winget install NSIS.NSIS`
* Visual Studio 2019 (or MS Build Tools with "Desktop development with C++")

To run the application, you will also need the Microsoft Edge Runtime:
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

Note: A version of runtime installer will be likely be bundled for release.

### Building

With these installed, you can build the application in a single step:

* `npm run build`

This will output an working installer in `dist/`.

Intermediate builds can be found in `build/`.

You can also run each build step independently:

* `npm run build:app` builds only the GUI app (ICARUS Terminal)
* `npm run build:service` builds only the service (ICARUS Terminal Service)
* `npm run build:assets` builds only the assets
* `npm run build:package` builds only the Windows installer
* `npm run build:clean` resets the build environment