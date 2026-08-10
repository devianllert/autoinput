# AutoInput

A cross-platform desktop auto-clicker and input repeater for Windows and macOS. AutoInput
can repeatedly press mouse buttons, keyboard keys, or key combinations at a configurable rate.

## Features

- Windows and macOS support
- Mouse buttons, keyboard keys, and key combinations
- Configurable rate in clicks per second, minute, or hour
- Hotkey modes: **Toggle** to start or stop on press, and **Hold** to run while held
- Input modes: **Press** to repeat taps, and **Hold** to keep the selected input pressed
- Restrict input to a selected foreground app (Windows only)

## FAQ

### Why cps is lower with more keys

CPS is how many times per second the app repeats the selected action. One key or mouse button is a single press and release; a combo like `Ctrl + Shift + A` needs several presses and releases per repeat.

More keys means more work per repeat, so the maximum achievable CPS usually drops. This also
depends on the operating system and the app receiving the input. CPS counts full combo repeats per
second, not individual key presses — `500 CPS` with one key is easier to reach than with many keys.

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
