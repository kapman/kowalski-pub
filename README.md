# Kowalski

Generative art for a Pimoroni Inky Impression 7.3-inch e-ink display, driven by a Raspberry Pi Zero 2 W. The panel is driven by the [Inky Python library](https://github.com/pimoroni/inky); the [Inky Impression guide](https://learn.pimoroni.com/article/getting-started-with-inky-impression) covers display setup.

![Generated formula-grid demo](assets/demo/formula-grid.png)

![Alternate noise-lines demo](assets/demo/noise-lines-dark.png)

The project renders a randomized Three.js scene, captures it as a PNG with headless Chromium, and sends it to the Inky display. A systemd timer refreshes the display every 10 minutes, picking a random scene each time.

## Architecture

- **Artwork** (`art/scenes/`) — each module is one scene: a self-contained Three.js program that draws one randomized 800×480 frame. The seed changes per run, so no two refreshes match.
- **Capture** (`art/capture.mjs`) — takes a scene name and an optional seed, captures the scene in headless Chromium, and saves the canvas as a PNG. Every scene ships in the bundle, so selection is a runtime choice with no rebuild; a repeated scene/seed pair reproduces the exact frame.
- **Display** (`display/`) — a Python module, called a mode, produces the image for each refresh:
  - **generative** (default) — picks a random Three.js scene and runs the capture
  - **image** — shows a local file
  - **date/time** — shows the clock

  `show.py` runs one mode and sends the image it returns to the Inky display.
- **Scheduling** (`systemd/`) — a systemd service performs one refresh; a timer fires it at boot and every 10 minutes.

## Raspberry Pi setup

Prerequisites: Raspberry Pi OS flashed with Raspberry Pi Imager (enable SSH under Services), with a connected Inky Impression.

```sh
ssh pi@raspberrypi.local
git clone https://github.com/kapman/kowalski-pub.git ~/kowalski
cd ~/kowalski
./scripts/pi/bootstrap.sh
```

## Local development

### Bootstrap

One-time; requires Node.js 22.22.3 and npm. Set `PI_HOST` to also configure passwordless SSH to the Pi:

```sh
export PI_HOST=pi@raspberrypi.local   # optional; use the Pi's IP if the hostname doesn't resolve
./scripts/dev/bootstrap.sh
```

### Preview and capture a scene

```sh
npm run preview ./art/scenes/formula-grid.ts  # browser preview of that scene
npm run capture ./art/scenes/formula-grid.ts  # creates a PNG in art/images/
```

### Test changes on the Pi

```sh
./scripts/dev/push.sh
```

Syncs the checkout to the Pi and refreshes the display. Use `--main` when the changes affect the bootstrap script or systemd units.

```sh
./scripts/dev/down.sh
```

Shuts down the Pi (requires passwordless sudo for the Pi user).

## Repository layout

```text
art/                  Three.js scenes, headless frame capture, and build config
display/              Display entrypoint and modes
assets/images/        Sample images for the image mode
scripts/dev/          Local-to-Pi setup, sync, and shutdown helpers
scripts/pi/           One-time Pi bootstrap script
systemd/              Service and timer templates
```
