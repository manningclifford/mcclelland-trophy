#!/usr/bin/env bash
#
# P2 — poll live ladders + shield, commit on change. Runs every ~10 min in-season.
# See scripts/pollLive.js. Off-season this is a cheap no-op.
#
# Usage: deploy/hub/run-live.sh [--force]
#
set -o pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

if ! is_in_season && [ "${1:-}" != "--force" ]; then
  log "Off-season — live poll skipped."
  exit 0
fi

cd "$REPO_DIR" || exit 1
if node scripts/pollLive.js; then
  git_commit_paths "chore: live data $(TZ='Australia/Melbourne' date '+%Y-%m-%d %H:%M')" \
    public/live_mcclelland.json public/live_shield.json
else
  log "pollLive.js failed."
  exit 1
fi
