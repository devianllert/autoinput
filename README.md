# autoinput

Automation tool that lets you automate mouse clicks and keyboard keys.

## Features

- Can be limited to a selected foreground app window (currently windows only)

## Why cps is lower with more keys

CPS is how many times per second the app repeats the selected action. One key or mouse button is a single press and release; a combo like `Ctrl + Shift + A` needs several presses and releases per repeat.

More keys means more work per repeat, so the maximum achievable CPS usually drops. This also depends on Windows and the app receiving the input. CPS counts full combo repeats per second, not individual key presses — `500 CPS` with one key is easier to reach than with many keys.

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

### Release to GitHub

The release command asks for a version, creates and pushes the version commit and `vX.Y.Z` tag.
The tag starts GitHub Actions jobs on native Windows and macOS runners. Electron-builder uploads
both platform artifacts to the same public GitHub Release.

Before releasing, use a clean branch that is synchronized with its upstream:

```powershell
pnpm release
```

Enter a stable version such as `0.2.0` when prompted. Build and publishing progress is available in
the repository's **Actions** tab. The workflow uses GitHub's built-in token with `Contents: write`
permission, so a local `GH_TOKEN` is not required.
