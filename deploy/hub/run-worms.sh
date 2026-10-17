#!/usr/bin/env bash
#
# P4 — weekly full worm-similarity recompute (true O(n^2)), commit on change.
# See scripts/recomputeWorms.js. Fixes the append-only topPairs staleness (TODO #4).
# Safe to run year-round (operates on the static cache, no upstream calls).
#
# Usage: deploy/hub/run-worms.sh
#
set -o pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

cd "$REPO_DIR" || exit 1
if node scripts/recomputeWorms.js; then
  git_commit_paths "chore: worm similarity recompute $(TZ='Australia/Melbourne' date '+%Y-%m-%d')" \
    public/worm_cache.json
else
  log "recomputeWorms.js failed."
  exit 1
fi
