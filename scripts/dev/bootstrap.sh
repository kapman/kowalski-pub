#!/usr/bin/env bash
# Sets up the dev machine for art development: checks for Node.js and rsync,
# installs the artwork dependencies, and configures SSH access to the Pi.
set -euo pipefail

NODE_VERSION="22.22.3"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if ! command -v node >/dev/null 2>&1; then
	echo "Node.js v$NODE_VERSION is required" >&2
	exit 1
fi
if [[ "$(node -v)" != "v$NODE_VERSION" ]]; then
	echo "Node.js v$NODE_VERSION is required, found $(node -v)." >&2
	exit 1
fi
if ! command -v rsync >/dev/null 2>&1; then
	echo "rsync is required - install it first (e.g. 'brew install rsync' or 'apt install rsync')." >&2
	exit 1
fi

echo "==> Installing artwork dependencies"
npm ci --prefix "$REPO_DIR/art"

if [ -n "${PI_HOST:-}" ]; then
  "$REPO_DIR/scripts/dev/setup-ssh.sh"
else
  echo "==> Skipping Pi setup: export PI_HOST and re-run this script"
fi

echo "==> Done. Try: npm run preview ./art/scenes/formula-grid.ts"
