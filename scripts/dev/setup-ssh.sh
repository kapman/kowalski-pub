#!/usr/bin/env bash
# Configures passwordless SSH access to the Pi: generates a key if needed,
# installs it on the Pi, and verifies the connection.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=pi_host.sh
source "$SCRIPT_DIR/pi_host.sh"

KEY_FILE="$HOME/.ssh/id_ed25519"

if [ ! -f "$KEY_FILE" ]; then
  echo "==> Generating SSH key $KEY_FILE"
  ssh-keygen -t ed25519 -N "" -f "$KEY_FILE"
fi

echo "==> Installing key on $PI_HOST (enter the Pi's password once)"
ssh-copy-id "$PI_HOST"

echo "==> Verifying passwordless login"
ssh "$PI_HOST" 'echo ok'