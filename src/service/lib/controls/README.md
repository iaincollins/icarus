# Control layer

The controls service connects remote UI actions to Elite Dangerous keyboard
bindings. It is intentionally split into two parts:

- `binding-resolver.js` reads the active Elite Dangerous `.binds` file and
  exposes dashboard-safe controls by Elite binding name.
- `input-backends/` contains the platform-specific code that sends keyboard
  input to the game.

The existing ship switches use the same path that a future configurable control
panel can use:

```text
UI action
-> Controls.tapControl(controlName)
-> BindingResolver resolves controlName to a keyboard binding
-> platform input backend sends the key
```

`controlName` should be the Elite binding name, for example:

```text
ShipSpotLightToggle
NightVisionToggle
ToggleCargoScoop
LandingGearToggle
DeployHardpointToggle
```

## Current platform support

Linux is currently implemented through `xdotool` in
`input-backends/linux-xdotool.js`.

This requires:

- `ICARUS_ENABLE_CONTROLS=true`
- `xdotool`
- an X11 session, or an environment where `xdotool` can send input to the game

Other platforms intentionally use `input-backends/unsupported.js`.

## Adding another backend

Add a file under `input-backends/` that implements this interface:

```js
class SomeInputBackend {
  async tapKey (key) {}
  async keyDown (key) {}
  async keyUp (key) {}
}
```

Then register it in `input-backends/index.js` by checking `process.platform`.

For Windows, the expected implementation would be a native input backend using
`SendInput`. For Wayland, the backend should use a mechanism that is explicit
about the compositor/security requirements rather than pretending `xdotool`
works universally.

The request handlers should not contain platform-specific input logic; they
should keep calling the `Controls` service.
