# Things to check

1. **GitHub Actions first run** — After the next scheduled run (Friday 4am AEST), check the Actions tab on GitHub to confirm the workflow completes cleanly. R package install and fitzRoy fetch are the most likely failure points.

2. **McClelland Trophy 2026** — Verify the 2026 season loads correctly from the Squiggle API once a few more rounds are in. The page pulls live data so it should just work, but worth a look.

3. ~~**Round 0 labelling in Worm Similarity**~~ ✅ Done.

4. **topPairs staleness** — The 50 most similar pairs were computed against the corpus at the time each game was added. They are never re-ranked from scratch. Once the 2026 season has 10+ games, run a full recompute: `node server/scripts/mergeRawWorms.js` after a fresh `fetch_worms_year.R` will handle new games, but the existing pairs won't be re-evaluated against each other.

5. ~~**AFL API auth is broken**~~ ✅ Done — `buildWormCache.js` and `build:worms` removed.

6. **GameEvolution provisional footnote** — The "† 2026 figures are provisional" note appears when `gamesPlayed < 50`. Confirm it renders correctly in the browser and disappears once the season is complete.

7. **Attendance sparkline for 2026** — The trend sparklines in the "All time" attendance view now have a 2026 data point at the far right. Check a few clubs to make sure it looks right (particularly new clubs like Gold Coast/GWS which have shorter histories).

8. **AEDT vs AEST offset** — The Actions workflow runs at 18:00 UTC, which is 4am AEST (UTC+10) but 5am AEDT (UTC+11). March–April the run will land an hour late. Not a problem, just worth knowing.

9. **git commit author warning** — Every local commit shows a "configured automatically" author warning (`manning@Mannings-MacBook-Air.local`). Fix once with: `git config --global user.email "manningclifford@outlook.com"` and `git config --global user.name "Manning Clifford"`.

10. **Worm cache size** — `public/worm_cache.json` is a large static asset loaded on every visit to the Worm Similarity page. Once the 2026 season is complete it'll hold ~2950 matches. Worth checking load time and considering lazy-loading or compression if it becomes slow.

11. **Rich home page** — Add live data callouts from each section to the home page: current Shield holder, best/most similar worm pair, McClelland Trophy leader, etc. Make it visual rather than just a list of links.
