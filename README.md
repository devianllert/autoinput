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

The release command asks for a version, builds the app, creates and pushes the version commit and
`vX.Y.Z` tag, and lets electron-builder publish the generated Windows artifacts to a public GitHub
Release.

Before releasing, use a clean branch that is synchronized with its upstream and provide a
fine-grained GitHub token with **Contents: Read and write** permission:

```powershell
$env:GITHUB_RELEASE_TOKEN = 'github_pat_...'
pnpm release
```

Enter a stable version such as `0.2.0` when prompted. The token is read only from the environment
and must not be committed. If publishing fails after the tag has already been pushed, retry the
electron-builder publish step without creating another version:

```powershell
pnpm build:win:publish
```
