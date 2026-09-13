#!/usr/bin/env bash
#
# AFL data refresh pipeline for the always-on hub.
#
# Replaces the scheduled GitHub Action (.github/workflows/update-worms.yml, now
# manual-only) with a local run on systemd timers. Runs the same scripts in the same
# order, then commits + pushes changed public/*.json, which triggers a Vercel redeploy.
#
# Differences from the Action:
#   - R/fitzRoy are installed once (setup.sh), not reinstalled on every run.
#   - Steps are soft-fail: one flaky scraper (e.g. AFL Tables for style taxonomy)
#     doesn't discard the others' output; we commit whatever did update.
#   - buildStyleTaxonomy.js is passed the current season explicitly (the Action let
#     it default to a hard-coded 2025).
#   - recomputeWorms.js re-ranks worm similarity across every match (TODO #4).
#
# Usage:
#   deploy/hub/refresh.sh              # in-season only (March–October)
#   deploy/hub/refresh.sh --force      # run even in the off-season
#   deploy/hub/refresh.sh 2026         # target a specific season
#
set -o pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

FORCE=0
YEAR=""
for a in "$@"; do
  case "$a" in
    --force) FORCE=1 ;;
    *[!0-9]*) : ;;          # ignore non-numeric flags
    "" ) : ;;
    * ) YEAR="$a" ;;         # a bare number = season year
  esac
done

if ! is_in_season && [ "$FORCE" -ne 1 ]; then
  log "Off-season (Melbourne month $(current_au_month)) — skipping. Use --force to run anyway."
  exit 0
fi

SEASON="${YEAR:-$(current_au_year)}"
acquire_lock
sync_repo
cd "$REPO_DIR" || exit 1
log "Refresh starting for season $SEASON at $(git rev-parse --short HEAD)"

FAILURES=()
run_step() {
  local name="$1"; shift
  log "→ $name"
  if "$@"; then
    log "  ok: $name"
  else
    log "  FAILED: $name (rc=$?)"
    FAILURES+=("$name")
  fi
}

# --- Pipeline (order mirrors the GitHub Action) ---------------------------------
run_step "fetch_worms_year.R"      Rscript server/scripts/fetch_worms_year.R "$SEASON"
run_step "mergeRawWorms.js"        node    server/scripts/mergeRawWorms.js
run_step "patchWormScores.js"      node    server/scripts/patchWormScores.js
run_step "recomputeWorms.js"       node    scripts/recomputeWorms.js
run_step "patch_game_evolution.R"  Rscript server/scripts/patch_game_evolution.R
run_step "patchAttendanceYear.js"  node    server/scripts/patchAttendanceYear.js
run_step "patchLinearTitle.js"     node    server/scripts/patchLinearTitle.js "$SEASON"
run_step "patchAlltimeAFL.js"      node    server/scripts/patchAlltimeAFL.js  "$SEASON"
run_step "buildStyleTaxonomy.js"   node    server/scripts/buildStyleTaxonomy.js "$SEASON"

# --- Publish --------------------------------------------------------------------
git_commit_paths "chore: data refresh (hub) $(TZ='Australia/Melbourne' date '+%Y-%m-%d %H:%M')" \
  public/worm_cache.json \
  public/game_evolution.json \
  public/attendance.json \
  public/linear_title.json \
  public/alltime_afl.json \
  public/style_taxonomy.json \
  || FAILURES+=("publish")

if [ "${#FAILURES[@]}" -gt 0 ]; then
  log "Refresh finished with ${#FAILURES[@]} failed step(s): ${FAILURES[*]}"
  exit 1
fi
log "Refresh complete — all steps ok."
