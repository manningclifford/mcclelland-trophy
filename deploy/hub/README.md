# Hub data pipeline

The site itself is static on Vercel. The always-on hub (`manning-surface`, Ubuntu 24.04)
refreshes its data: `refresh.sh` runs the scrapers, commits any changed `public/*.json`
and pushes, which makes Vercel redeploy. The GitHub Action
(`.github/workflows/update-worms.yml`) runs the same scripts and is kept as a
manual fallback.

Current-season live data (the McClelland ladder and the Brunswick St Belt's next game)
does not go through here — the `api/` functions fetch it on request.

## What runs

| Timer | When (Melbourne time) | Runs |
|---|---|---|
| `afl-refresh.timer` | daily 04:30 | `afl-refresh.service` → `deploy/hub/refresh.sh` |
| `afl-refresh-gameday.timer` | Fri–Mon 18:15, 20:15, 22:15 | the same service |

`refresh.sh` does nothing outside March–October unless given `--force`. Each step is
soft-fail: one broken scraper doesn't stop the rest from publishing. A lock stops
overlapping runs, and every run starts by rebasing onto `origin/main` (discarding
unpushed data commits if that conflicts, since the run regenerates them).

## Layout on the hub

- Repo: `~/mcclelland-trophy`, used only by the pipeline — don't edit it by hand.
- Push access: a deploy key scoped to this repo, `~/.ssh/afl_hub_deploy`, used via the
  `github-afl` host alias in `~/.ssh/config`.
- Units: `~/.config/systemd/user/afl-refresh.{service,timer}` and
  `afl-refresh-gameday.timer`. Lingering is enabled for `manning`, so they run
  without a login session.
- R 4.3 (apt) with fitzRoy + jsonlite in `/usr/local/lib/R/site-library`; Node 22 LTS
  (NodeSource).

## Operating

```bash
systemctl --user list-timers 'afl-*'                 # next/last runs
journalctl --user -u afl-refresh.service -n 100      # last run's log
systemctl --user start afl-refresh.service           # run now
~/mcclelland-trophy/deploy/hub/refresh.sh --force    # run by hand, even off-season
ssh -T github-afl                                    # check push access
```

To fall back to GitHub: Actions → "Update worm cache" → Run workflow.

## Rebuilding from scratch

```bash
git clone git@github-afl:manningclifford/mcclelland-trophy.git ~/mcclelland-trophy  # after step 2
sudo ~/mcclelland-trophy/deploy/hub/setup.sh            # 1. R, fitzRoy, Node

# 2. Deploy key: add the .pub to GitHub → repo Settings → Deploy keys, "Allow write access"
ssh-keygen -t ed25519 -f ~/.ssh/afl_hub_deploy -N '' -C afl-hub@manning-surface
printf 'Host github-afl\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/afl_hub_deploy\n  IdentitiesOnly yes\n' >> ~/.ssh/config

# 3. Timers
mkdir -p ~/.config/systemd/user
cp ~/mcclelland-trophy/deploy/hub/systemd/afl-refresh* ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now afl-refresh.timer afl-refresh-gameday.timer
sudo loginctl enable-linger manning
```
