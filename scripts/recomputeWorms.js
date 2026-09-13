/**
 * recomputeWorms.js  —  P4: nightly/weekly FULL worm-similarity recompute
 *
 * Fixes TODO #4 ("The 50 most similar pairs ... are never re-ranked from scratch").
 * The GitHub Action's mergeRawWorms.js only APPENDS: each new match is compared to
 * the then-current corpus and the global topPairs is topped up incrementally, so
 * early matches never get re-evaluated against later ones. This script does the true
 * O(n^2) all-pairs pass over EVERY match in public/worm_cache.json and rewrites:
 *   - each match's `mostSimilar` = its exact nearest neighbour, and
 *   - the global `topPairs` = the correct 50 most-similar pairs.
 *
 * The similarity metric is identical to server/services/wormCache.js /
 * server/scripts/mergeRawWorms.js: per-minute margins normalised to [-1,1] by the
 * match's max-abs margin, then summed L1 distance with a length-mismatch penalty
 * (the shorter worm is treated as holding its final value). Lower score = more similar.
 *
 * Run:  node scripts/recomputeWorms.js   (a step in deploy/hub/refresh.sh; no-op if unchanged)
 * Cost: ~2,800 matches => ~4M pairs. Seconds to low tens of seconds in Node.
 */

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, '..', 'public', 'worm_cache.json');
const TOP_N = 50;

function normalise(margins, maxAbs) {
  const d = maxAbs || 1;
  return margins.map((m) => m / d);
}

// Identical metric to server/services/wormCache.js similarityScore().
function similarityScore(a, b) {
  const len = Math.min(a.length, b.length);
  if (len < 2) return Infinity;
  let sum = 0;
  for (let i = 0; i < len; i++) sum += Math.abs(a[i] - b[i]);
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const last = shorter[shorter.length - 1];
  for (let i = len; i < longer.length; i++) sum += Math.abs(longer[i] - last);
  return sum;
}

function main() {
  const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
  const matches = cache.matches || [];
  const n = matches.length;
  const before = JSON.stringify([matches.map((m) => m.mostSimilar), cache.topPairs]);
  console.log(`recomputeWorms: ${n} matches — running full O(n^2) recompute...`);

  // Precompute normalised worms once.
  const norms = new Array(n);
  for (let i = 0; i < n; i++) norms[i] = normalise(matches[i].margins, matches[i].maxAbsMargin);

  // Per-match nearest neighbour + a running global top-N of pairs.
  const bestScore = new Array(n).fill(Infinity);
  const bestIdx = new Array(n).fill(-1);
  let top = []; // { i, j, score }, kept sorted ascending once full
  let worst = Infinity;

  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const ni = norms[i];
    for (let j = i + 1; j < n; j++) {
      const score = similarityScore(ni, norms[j]);
      if (score === Infinity) continue;

      if (score < bestScore[i]) { bestScore[i] = score; bestIdx[i] = j; }
      if (score < bestScore[j]) { bestScore[j] = score; bestIdx[j] = i; }

      if (top.length < TOP_N) {
        top.push({ i, j, score });
        if (top.length === TOP_N) { top.sort((a, b) => a.score - b.score); worst = top[TOP_N - 1].score; }
      } else if (score < worst) {
        top[TOP_N - 1] = { i, j, score };
        top.sort((a, b) => a.score - b.score);
        worst = top[TOP_N - 1].score;
      }
    }
    if (i % 250 === 0 && i > 0) process.stdout.write(`\r  ${i}/${n} rows...`);
  }
  if (top.length < TOP_N) top.sort((a, b) => a.score - b.score);
  process.stdout.write(`\r  ${n}/${n} rows.   \n`);

  // Write nearest neighbour back onto each match.
  let withNN = 0;
  for (let i = 0; i < n; i++) {
    if (bestIdx[i] >= 0) {
      matches[i].mostSimilar = {
        matchId: matches[bestIdx[i]].matchId,
        score: Math.round(bestScore[i] * 100) / 100,
      };
      withNN++;
    } else {
      matches[i].mostSimilar = null;
    }
  }

  cache.topPairs = top.map((p) => ({
    matchA: matches[p.i].matchId,
    matchB: matches[p.j].matchId,
    score: Math.round(p.score * 100) / 100,
  }));
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  // Skip the write when nothing moved, so the hub doesn't commit (and redeploy) a no-op.
  if (JSON.stringify([matches.map((m) => m.mostSimilar), cache.topPairs]) === before) {
    console.log(`  no similarity changes (${elapsed}s) — cache left untouched`);
    return;
  }
  cache.wormSimilarityRecomputedAt = new Date().toISOString();
  writeFileSync(CACHE_PATH, JSON.stringify(cache));
  console.log(`  nearest-neighbour set for ${withNN}/${n} matches`);
  console.log(`  best pair: ${cache.topPairs[0]?.matchA} ~ ${cache.topPairs[0]?.matchB} (score ${cache.topPairs[0]?.score})`);
  console.log(`  done in ${elapsed}s — written to public/worm_cache.json`);
}

main();
