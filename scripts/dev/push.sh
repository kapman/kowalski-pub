#!/usr/bin/env bash
# Syncs local changes to the Pi and optionally runs the display.
# Default: syncs to ~/kowalski-dev (separate from the git clone) and runs
# display/show.py. Pass --main to sync directly to ~/kowalski (e.g. after
# updating bootstrap.sh or systemd units).
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/pi_host.sh"

DEST="~/kowalski-dev"
RUN_SHOW=true

for arg in "$@"; do
  if [ "$arg" = "--main" ]; then
    DEST="~/kowalski"
    RUN_SHOW=false
  fi
done

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "==> Syncing to $PI_HOST:$DEST"
rsync -avz --delete --exclude='.git' --filter=":- $REPO_DIR/.gitignore" "$REPO_DIR/" "$PI_HOST:$DEST/"

if [ "$RUN_SHOW" = true ]; then
  # shellcheck disable=SC2029,SC2088
  ssh "$PI_HOST" '
    if [ ! -x ~/kowalski/.venv/bin/python ]; then
      echo "~/kowalski/.venv not found - run scripts/pi/bootstrap.sh on the Pi first" >&2
      exit 1
    fi
    ~/kowalski/.venv/bin/python ~/kowalski-dev/display/show.py
  '
fi
