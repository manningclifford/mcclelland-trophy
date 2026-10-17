#!/usr/bin/env bash
#
# P3 — overnight Monte Carlo season simulation, commit on change.
# See scripts/simulateSeason.js. Off-season this is a cheap no-op.
#
# Usage: deploy/hub/run-simulate.sh [--force]
#
set -o pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

if ! is_in_season && [ "${1:-}" != "--force" ]; then
  log "Off-season — simulation skipped."
  exit 0
fi

cd "$REPO_DIR" || exit 1
if node scripts/simulateSeason.js; then
  git_commit_paths "chore: season simulation $(TZ='Australia/Melbourne' date '+%Y-%m-%d %H:%M')" \
    public/predictions.json
else
  log "simulateSeason.js failed."
  exit 1
fi
