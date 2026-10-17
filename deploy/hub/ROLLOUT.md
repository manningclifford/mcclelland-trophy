# Sherrin Spreadsheets — hub rollout checklist

Move the data **pipeline** + add **season simulation** onto the always-on `hub`
(Ubuntu 24.04, CPU-only). The public Vercel site stays exactly as-is (no login).
The hub scrapes → recomputes → commits `public/*.json` → GitHub → Vercel redeploys.

Everything below runs as user `manning`. The **only** sudo step is `setup.sh`.

> Nothing here has been committed or deployed. These are new, staged files:
> ```
> deploy/hub/…                       # pipeline scripts, systemd units, this file
> scripts/pollLive.js                # P2 live ladders + shield
> scripts/simulateSeason.js          # P3 Monte Carlo simulator
> scripts/recomputeWorms.js          # P4 full worm-similarity recompute
> src/components/Predictions.jsx     # P3 UI (not yet wired — see Step 8)
> public/live_mcclelland.json        # sample output from tonight's test run
> public/live_shield.json            # "
> public/predictions.json            # "  (50,000-sim run, 2026)
> ```
> The three `public/*.json` are real sample outputs (so you can preview locally);
> the hub overwrites them on its first run.

---

## Step 1 — One-time hub setup (the single sudo step)

Clone the repo on the hub (SSH remote recommended so pushes work — see Step 2), then:

```bash
cd ~/mcclelland-trophy
sudo deploy/hub/setup.sh
```

Installs: R + `fitzRoy` + `jsonlite` (Posit PPM binaries), Node 20, the system libs
fitzRoy needs, sets git identity, runs `npm ci`. Takes a few minutes. It prints
`fitzRoy OK` on success.

> The systemd units assume the repo is at `~/mcclelland-trophy`. If you cloned it
> elsewhere, edit the `WorkingDirectory=` / `ExecStart=` paths in
> `deploy/hub/systemd/*.service` first.

## Step 2 — Confirm the hub can push to GitHub

The pipeline commits and pushes. Give the hub push access (once):

```bash
git -C ~/mcclelland-trophy remote -v          # should be your repo
# Recommended: switch to SSH and add the hub's key to GitHub
git -C ~/mcclelland-trophy remote set-url origin git@github.com:manningclifford/mcclelland-trophy.git
ssh -T git@github.com                          # verify auth
```
(Or configure a PAT credential helper if you prefer HTTPS.)

## Step 3 — Test the pipeline manually

```bash
deploy/hub/refresh.sh --force
```
Expect each step logged `ok:` and a final `Refresh complete`. If nothing changed
upstream it prints `No changes to commit` (that's fine). If something *did* change,
it commits + pushes → watch Vercel redeploy.

- One flaky scraper no longer kills the whole run (soft-fail); the exit code is
  non-zero if any step failed, but good outputs are still committed.
- `--force` overrides the March–October in-season guard.

## Step 4 — Install the timers

**Option A — user systemd timers (preferred; gives logs + status):**

```bash
mkdir -p ~/.config/systemd/user
cp deploy/hub/systemd/*.service deploy/hub/systemd/*.timer ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now afl-refresh.timer afl-live.timer afl-simulate.timer afl-worms.timer
# optional tighter match-day cadence:
systemctl --user enable --now afl-refresh-gameday.timer

# Make timers run even when you're not logged in (one sudo):
sudo loginctl enable-linger manning

systemctl --user list-timers --all       # verify schedule
journalctl --user -u afl-refresh.service -n 50    # inspect a run
```

**Option B — crontab (simplest; no linger, no unit files):**

```bash
crontab -e     # paste deploy/hub/crontab.example, edit REPO path
```

| Job | systemd | cron | Cadence |
|-----|---------|------|---------|
| Data refresh | `afl-refresh.timer` | `refresh.sh` | nightly 04:30 (+ optional Fri–Mon evenings) |
| Live ladders/shield | `afl-live.timer` | `run-live.sh` | every 10 min (no-op off-season) |
| Season simulation | `afl-simulate.timer` | `run-simulate.sh` | nightly 05:00 |
| Worm recompute | `afl-worms.timer` | `run-worms.sh` | Sundays 05:30 |

## Step 5 — Verify a real run publishes

Trigger once and confirm the commit lands and Vercel redeploys:

```bash
systemctl --user start afl-refresh.service   # or: deploy/hub/refresh.sh --force
git -C ~/mcclelland-trophy log -1 --stat     # should show a data-refresh commit
```

## Step 6 — Retire the GitHub Action (keep as fallback)

Once the hub is publishing reliably, stop the redundant CI runs but keep the file:

- GitHub → repo → **Actions** → "Update worm cache" → **⋯ → Disable workflow**, **or**
- comment out the `schedule:` block in `.github/workflows/update-worms.yml` (leave
  `workflow_dispatch:` so you can still run it by hand if the hub is ever down).

## Step 7 — Test the two new hub jobs manually

```bash
node scripts/pollLive.js        # writes public/live_mcclelland.json + live_shield.json
node scripts/simulateSeason.js  # writes public/predictions.json (50k sims, <1s)
node scripts/recomputeWorms.js  # rewrites public/worm_cache.json nearest-neighbours
```
`pollLive` degrades to men's-only McClelland when the AFLW ladder isn't live yet
(correct during the men's season). `simulateSeason` prints the McClelland favourites
and its calibrated model; sanity: per-team `mcClelland` probabilities sum to ~1.0.

---

## Step 8 — Frontend changes (apply by hand, then commit)

These are the only edits to the React app. Small and reviewable.

### 8a — Add the Predictions page

**`src/App.jsx`** — add the import (near the other component imports):
```jsx
import Predictions from './components/Predictions';
```
…and add the route (next to the other `route === …` blocks):
```jsx
{route === '/predictions' && (
  <main className="max-w-6xl mx-auto py-8 px-4">
    <Predictions />
  </main>
)}
```

**`src/components/Header.jsx`** — add one entry to the `SECTIONS` array:
```jsx
{ path: '/predictions', label: 'Predictions' },
```

### 8b — Retire corsproxy.io for the live McClelland ladder

**`src/services/aflApi.js`** — in `getMcClellandStandings(year)`, after the
`getHistoricalStandings(year)` check, **replace the live-fetch `try { … }` block**
(the `Promise.all([fetchAFLLadder, fetchAFLWLadder])` section) with:

```jsx
  // Current-season data now comes from a static file the hub refreshes every
  // ~10 min (public/live_mcclelland.json) — no more per-visitor corsproxy.io.
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}live_mcclelland.json?v=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.year !== year) {
      return { standings: null, isLive: false, error: `No live data available for ${year}.` };
    }
    return { standings: data.standings, isLive: true, error: null };
  } catch (error) {
    return { standings: null, isLive: false, error: 'Live data temporarily unavailable.' };
  }
```
The `standings` objects have the same shape `LadderTable` already consumes, so no
other change is needed. `fetchAFLLadder`, `fetchAFLWLadder`, `fetchWithProxy` and the
`CORS_PROXY` const become dead code — delete them in the same pass.

### 8c — Retire the client-side Squiggle call for the shield schedule

**`src/services/linearTitleApi.js`** — replace the whole `getShieldSchedule` function with:

```jsx
export async function getShieldSchedule(/* holderKey unused — file already targets the holder */) {
  const res = await fetch(`${import.meta.env.BASE_URL}live_shield.json?v=${Date.now()}`);
  if (!res.ok) return { nextGame: null, lastDefense: null };
  const data = await res.json();
  return { nextGame: data.nextGame, lastDefense: data.lastDefense };
}
```
(The `SQUIGGLE_API` const in that file then becomes unused — remove it.)

### 8d — Verify the frontend

```bash
npm run dev      # visit #/predictions, #/mcclelland, #/linear-title
npm run build    # must succeed (Predictions.jsx already builds clean)
```
Then commit the `src/` edits + the new files together and let Vercel deploy.

---

## Tuning knobs

- **Simulation count:** `SIM_N=100000 node scripts/simulateSeason.js` (50k default runs
  in ~0.1s; go higher freely). For systemd, set `Environment=SIM_N=100000` in
  `afl-simulate.service`.
- **Margin model:** `simulateSeason.js` calibrates `k`, home-ground advantage and
  residual SD from the season's completed games (clamped to sane AFL ranges). Adjust
  the clamps / defaults at the top of the file if you want it more/less confident.
- **Belt scope:** belt probability is "end of the home-and-away season" (finals aren't
  in the fixture mid-year). Noted in the payload + UI.

## Troubleshooting

- `Rscript: command not found` under systemd → the unit's `Environment=PATH=…` must
  include where Node/R live (`/usr/bin`). setup.sh installs both there.
- `git push` fails → Step 2 (SSH remote / credentials). The commit is still made
  locally; the next successful run pushes it.
- Concurrent timers are serialised by an flock on `.git/afl-hub.lock`, so live/refresh/
  sim/worms never collide on the git index.

---

## LATER (optional) — P6: private admin dashboard behind the tunnel

Not needed for the pipeline or simulator. If you later want an internal ops view
(last scrape per dataset, missing rounds, sim status) behind Cloudflare Access +
Google login, mirror the couple-calendar pattern:

- `/Users/manning/couple-calendar/deploy/cloudflared/` — `docker-compose.yml`,
  `set-token.sh`, `cloudflared.env.example` (named tunnel via token).
- `/Users/manning/couple-calendar/deploy/oauth2-proxy/` — Google-login gate
  (`oauth2-proxy.cfg`, `authenticated-emails.txt`).

The existing (currently orphaned) Express app in `server/` is the natural home for
such a dashboard/API. Keep it a separate, later phase — the public pipeline +
simulator are the priority.
