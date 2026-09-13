# Shared helpers for the AFL "Sherrin Spreadsheets" hub pipeline. Sourced by refresh.sh.
# NOTE: sourced (not executed) — no shebang, callers set their own options.

# Resolve repo root. This file lives at <repo>/deploy/hub/common.sh
HUB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$HUB_DIR/../.." && pwd)"
LOCK_FILE="$REPO_DIR/.git/afl-hub.lock"

log() { printf '[%s] %s\n' "$(TZ='Australia/Melbourne' date '+%Y-%m-%d %H:%M:%S')" "$*"; }

# Current month in Melbourne time, regardless of the host's timezone.
current_au_month() { TZ='Australia/Melbourne' date +%-m; }
current_au_year()  { TZ='Australia/Melbourne' date +%Y; }

# AFL season window: March (3) through October (10) covers home-and-away + finals.
is_in_season() {
  local m; m="$(current_au_month)"
  [ "$m" -ge 3 ] && [ "$m" -le 10 ]
}

# Hold the pipeline lock for the rest of the calling script, so overlapping timer
# runs (nightly + match-day) never race on the working tree or git index.
acquire_lock() {
  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    log "Another pipeline run holds the lock — exiting."
    exit 0
  fi
}

# Rebase onto origin/main before running, so scripts and data are current and any
# commit left behind by an earlier failed push goes out with the next one.
sync_repo() {
  if ! git -C "$REPO_DIR" fetch -q origin; then
    log "Could not fetch origin — aborting run."
    exit 1
  fi
  if ! git -C "$REPO_DIR" rebase -q --autostash origin/main; then
    git -C "$REPO_DIR" rebase --abort 2>/dev/null
    # This clone only holds pipeline output, which this run regenerates anyway.
    log "Rebase onto origin/main conflicted — discarding unpushed local data commits."
    git -C "$REPO_DIR" reset -q --hard origin/main
  fi
}

# git_commit_paths "commit message" path1 [path2 ...]
# Stages the paths and, if anything changed, commits, rebases onto origin and pushes.
# Returns non-zero on push failure; the commit stays local for the next run.
git_commit_paths() {
  local msg="$1"; shift
  cd "$REPO_DIR" || return 1
  git add -- "$@"
  if git diff --staged --quiet; then
    log "No changes to commit."
    return 0
  fi
  git -c user.name="afl-hub" -c user.email="hub@clifford.works" commit -q -m "$msg"
  # A manual workflow run or a code push may have landed since sync_repo.
  if ! git pull -q --rebase; then
    git rebase --abort 2>/dev/null
    log "WARNING: rebase onto origin failed — commit is local only."
    return 1
  fi
  if git push -q; then
    log "Pushed: $msg"
  else
    log "WARNING: git push failed — commit is local only. Check the hub's deploy key (ssh -T github-afl)."
    return 1
  fi
}
