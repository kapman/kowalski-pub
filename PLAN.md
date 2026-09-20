# E-Ink Generative Art Project

## Overview
- Hardware: Raspberry Pi Zero 2 W + Inky Impression 7.3" (800x480, 7-color e-ink)
- Goal: randomly generate art with three.js, render to a static image, display on the e-ink screen, updating every 10 minutes.
- Links:
  - https://shop.pimoroni.com/products/inky-impression
  - https://learn.pimoroni.com/article/getting-started-with-inky-impression
  - https://github.com/pimoroni/inky

## Pipeline
generate art (three.js) → render to static image → quantize to 7-color palette → push to Inky → repeat every 10 min

## Priority

1. **Three.js first.** Get a fast local loop for iterating on the generative art itself (Milestones 3–4) before touching the Pi again.
2. **Pi rendering second.** Only once the art is worth automating, decide where it renders and wire it into the display pipeline (Milestones 5–9).

## Open decisions
- [x] Repository checkout location and hosting are configured by the user
- [x] Confirm SSH access to the Pi is set up using the user's configured host
- [x] How to run/preview the three.js scene locally while iterating (Milestone 3)? — **Vite + three.js + `lil-gui`** (no React/R3F — not needed for a single non-interactive scene). `lil-gui` is a `devDependency`: it's only mounted by the dev-preview entry point for live parameter tweaking, and must never be imported by the eventual headless-render entry point (Milestone 6) — keep those two entry points separate so that stays true.
- [ ] Where does three.js render for the *automated* Pi pipeline? Deferred until Milestone 5 — it's the biggest architectural fork (second machine + network dependency vs. none) and affects the deploy loop in Milestone 7, but there's no point deciding it before the scene itself exists.
  - **Option A — on-device (Pi):** headless Chromium/Puppeteer on the Zero 2 W. Simplest architecture, but Zero 2 W (512MB, no GPU accel) may be slow/unstable. Tolerable since only 1 frame every 10 min is needed — needs a real hardware spike to confirm. Timebox: ~30 min to render one frame and check it doesn't OOM/hang.
  - **Option B — off-device:** render service on another machine, push PNG to Pi over network. More reliable/fast, adds a second machine + network dependency.

## Milestones

1. **Pi setup + hardware sanity check** — ✅ done. SSH, SPI, I2C all confirmed working. Ran Pimoroni's own `clean.py` and `image.py` examples to isolate hardware/driver issues from our code before writing any of our own — display renders correctly (colors, orientation).
2. **Static image → display pipeline** — mostly done. `display/show.py` is a stable entrypoint (called by the dev loop and the boot service) that currently calls `display/show_image.py`: picks a random image from `assets/images/` (or a given path), resizes/pads it to fit 800x480, and displays it via `inky.set_image()`/`inky.show()` (quantization/dithering handled by the Inky driver itself). `display/show_date_time.py` was the earlier placeholder used as a real-content sanity check before this existed. Still need the "keep last image on failure" behavior (write to temp file, atomic rename over last-good image) — build this in here, not deferred to Milestone 9.
3. **Three.js iteration workflow** — baseline done. `art/` uses Vite, Three.js, and `lil-gui` for local scene development. `art/src/scenes/formula-grid.ts` renders an 800x480 scene matching the Inky panel. The scene can be iterated locally with `npm run dev` and captured with the headless renderer.
4. **Random art generation** — build the actual generative scene inside the Milestone 3 workflow: randomization/seeding of geometry, colors, camera, lighting. Verify N runs produce N visually distinct outputs.
5. **Rendering location spike** — timebox Option A vs B (see Open decisions). First Pi-side milestone; only start once Milestone 4 produces something worth automating.
6. **Three.js → static image rendering** — using the decided rendering location, get a single deterministic frame out as a PNG (800x480).
7. **Wire it together** — generate → render → quantize → display, end to end. Pure integration of Milestones 2/4/6, no new logic. `show.py` swaps to call this instead of `show_image.py`.
8. **Automate on a timer** — systemd *timer* (separate from the boot service in Milestone 1) running `show.py` every 10 minutes. Verify unattended operation over an hour+.
9. **Hardening** — logging, save history of generated art.

## Setup steps (Milestone 1) — done

- [x] Repository cloned onto the development machine
- [x] SSH access to the Pi confirmed using the user's configured host
- [x] SPI + I2C enabled
- [x] `git clone` the repo onto the Pi at `~/kowalski`
- [x] `scripts/pi/bootstrap.sh` — idempotent Pi setup script: enables SPI/I2C, installs OS packages (`python3-venv`, `python3-dev`), creates venv + `pip install inky`, installs+enables the systemd boot service
- [x] Verified hardware with Pimoroni's own example scripts (`clean.py`, `image.py`) before running our own code

## Tooling

- **Three.js dev loop** — `cd art && npm run dev` starts the Vite dev server (`http://localhost:5173`); edit a scene under `art/src/scenes/` and it hot-reloads.
- **Boot autorun** — `systemd/kowalski.service` runs `display/show.py` once on every boot (installed/enabled by `bootstrap.sh`). `Type=oneshot`, `WantedBy=multi-user.target`.
- **Dev loop** — `scripts/dev/push.sh` (run from your dev machine): rsyncs the repo into `~/kowalski-dev` on the Pi (kept separate from the git clone at `~/kowalski` to avoid `git pull` conflicts with synced-but-uncommitted files), then runs `display/show.py` there using the venv from `~/kowalski`. One command, no manual SSH/pull/run.
- **Shutdown** — `scripts/dev/down.sh` (run from your dev machine): `ssh`-triggered `sudo shutdown now`. Requires passwordless sudo on the Pi (already the case for the current user).
