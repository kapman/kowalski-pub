#!/usr/bin/env bash
# Sets up a Pi from scratch: enables SPI/I2C, installs OS packages, fnm +
# Node.js 22, Python venv with Inky deps, and the systemd boot service.
# Idempotent — safe to re-run.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INSTALL_USER="$(id -un)"
INSTALL_HOME="$HOME"
SERVICE_TEMPLATE="$REPO_DIR/systemd/kowalski.service"
NODE_VERSION="22.22.3"
SERVICE_FILE="$(mktemp)"
trap 'rm -f "$SERVICE_FILE"' EXIT

echo "==> Enabling SPI and I2C"
sudo raspi-config nonint do_spi 0
sudo raspi-config nonint do_i2c 0

echo "==> Installing OS packages"
sudo apt update
sudo apt install -y python3-venv python3-dev curl chromium rsync

echo "==> Installing fnm and Node.js $NODE_VERSION"
curl -fsSL https://fnm.vercel.app/install 2>/dev/null | bash
export PATH="$HOME/.local/share/fnm:$PATH"
eval "$(fnm env --shell bash)"
fnm install "$NODE_VERSION"
fnm default "$NODE_VERSION"
echo "Node.js $(node -v)"

echo "==> Installing Node.js dependencies and building frontend"
cd "$REPO_DIR/art"
npm ci
npm run build

echo "==> Setting up venv"
cd "$REPO_DIR"
python3 -m venv --clear .venv
.venv/bin/pip install inky "Pillow>=10.1"

echo "==> Installing systemd units"
sed \
  -e "s|@USER@|$INSTALL_USER|g" \
  -e "s|@HOME@|$INSTALL_HOME|g" \
  -e "s|@REPO_DIR@|$REPO_DIR|g" \
  "$SERVICE_TEMPLATE" > "$SERVICE_FILE"
sudo install -m 0644 "$SERVICE_FILE" /etc/systemd/system/kowalski.service
sudo install -m 0644 "$REPO_DIR/systemd/kowalski-render.timer" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable kowalski.service
sudo systemctl enable --now kowalski-render.timer

echo "==> Done — reboot recommended (SPI/I2C changes take effect on next boot)"
