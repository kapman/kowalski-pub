# Kowalski

Generative art for a Pimoroni Inky Impression 7.3-inch e-ink display, driven by a Raspberry Pi Zero 2 W.

![Generated formula-grid demo](assets/demo/formula-grid.png)

The project renders an 800×480 Three.js scene, captures it as a PNG with headless Chromium, and sends it to the Inky display. A systemd timer refreshes the display every 10 minutes.

## Hardware

- Raspberry Pi Zero 2 W
- Pimoroni Inky Impression 7.3-inch display
  - 800×480 pixels
  - seven-color e-ink panel
  - SPI for display data
  - I2C for display detection
- microSD card and power supply
- Network access for the initial setup and remote development loop

See the [Inky Impression guide](https://learn.pimoroni.com/article/getting-started-with-inky-impression) and the [Inky Python library](https://github.com/pimoroni/inky) for hardware details.

## Architecture

1. `art/src/scenes/formula-grid.ts` creates a randomized Three.js scene at the panel resolution.
2. Vite builds the scene to `art/dist/`.
3. `art/src/render.mjs` opens the build in headless Chromium through Puppeteer and captures an 800×480 PNG.
4. `display/show_generative.py` starts that renderer and opens the resulting image with Pillow.
5. `display/show.py` sends the image to `inky.auto()`. The Inky driver performs the panel-specific palette conversion and dithering before updating the display.
6. `systemd/kowalski.service` renders one frame; `systemd/kowalski-render.timer` runs it at boot and every 10 minutes afterward.

The display entrypoint also supports `display/show_image.py` for testing with a local image.

## Raspberry Pi setup

Prerequisites: Raspberry Pi OS, a connected Inky Impression, network access, and a cloned copy of this repository.

```sh
git clone https://github.com/kapman/kowalski-pub.git ~/kowalski
cd ~/kowalski
./scripts/pi/bootstrap.sh
```

The bootstrap script:

- enables SPI and I2C;
- installs Python, Chromium, and build dependencies;
- installs Node.js 22 through fnm;
- builds the art renderer;
- creates `.venv` and installs Inky and Pillow; and
- installs and enables the systemd service and timer.

Run the script as the Pi user from the repository checkout. It generates the systemd service paths from that checkout, so the repository can live anywhere.

## Local art development

```sh
cd art
npm ci
npm run dev
```

Open the Vite URL printed by the command. The scene is sized to 800×480 so the browser preview matches the display. Build and capture a frame with:

```sh
npm run build
node src/render.mjs --out images
```

Generated captures in `art/images/` are ignored by Git.

## Remote development loop

Set the SSH target for your own Pi; it is intentionally not stored in the repository:

```sh
export PI_HOST=pi@raspberrypi.local
./scripts/dev/push.sh
```

This syncs the checkout to `~/kowalski-dev` and runs the generative renderer using the Python environment from `~/kowalski`. Use `./scripts/dev/push.sh --main` when deploying changes that affect the bootstrap script or systemd units.

To shut down the Pi remotely:

```sh
./scripts/dev/down.sh
```

## Repository layout

```text
art/                  Three.js scenes and headless renderer
display/              Python display entrypoints and renderers
assets/images/        Sample images for the image renderer
scripts/dev/           Local-to-Pi sync and shutdown helpers
scripts/pi/            One-time Pi bootstrap script
systemd/               Service and timer templates
```
