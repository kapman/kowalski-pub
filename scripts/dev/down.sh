#!/usr/bin/env bash
# Shuts down the Pi over SSH
set -euo pipefail

# shellcheck source=scripts/dev/pi_host.sh
source "$(dirname "${BASH_SOURCE[0]}")/pi_host.sh"
ssh "$PI_HOST" 'sudo shutdown now'
