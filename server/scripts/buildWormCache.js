/**
 * buildWormCache.js
 *
 * Fetches worm data for completed AFL games and appends to public/worm_cache.json.
 * Constructs AFL match IDs from the canonical pattern: CD_M{year}014{round:02d}{game:02d}
 *
 * Usage: node server/scripts/buildWormCache.js [year]
 *        year defaults to current year
 *
 * Requires: public/worm_cache.json to already exist (run the R scripts first for initial build)
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, '../../public/worm_cache.json');

const AFL_API_BASE = 'https://api.afl.com.au';
const SQUIGGLE_API = 'https://api.squiggle.com.au';
const USER_AGENT = 'TheSherrinSpreadsheets/WormCache (github.com/manning/mcclelland-trophy)';

const TARGET_YEAR = parseInt(process.argv[2] || new Date().getFullYear(), 10);

// ─── AFL API auth ─────────────────────────────────────────────────────────────

let cachedToken = null;

async function getToken() {
  if (cachedToken) return cachedToken;
  const res = await fetch(`${AFL_API_BASE}/cfs/afl/WMCTok`, {
    method: 'POST',
    headers: { 'x-media-mis-token': 'dummy', 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  const data = await res.json();
  cachedToken = data.token;
  return cachedToken;
}

async function fetchScoreWorm(matchId) {
  const token = await getToken();
  const res = await fetch(`${AFL_API_BASE}/cfs/afl/matchItem/${matchId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const scoreWorm = data?.score?.scoreWorm;
  if (!scoreWorm || !Array.isArray(scoreWorm) || scoreWorm.length === 0) return null;
  return scoreWorm.map(p => ({
    time: (p.periodSeconds ?? p.time ?? 0) / 60,
    margin: (p.homeTotal ?? 0) - (p.awayTotal ?? 0),
  }));
}

// ─── Squiggle ─────────────────────────────────────────────────────────────────

let lastSquiggleRequest = 0;

async function squiggleFetch(url) {
  const elapsed = Date.now() - lastSquiggleRequest;
  if (elapsed < 1100) await new Promise(r => setTimeout(r, 1100 - elapsed));
  lastSquiggleRequest = Date.now();
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Squiggle error: ${res.status}`);
  return res.json();
}

async function getCompletedGames(year) {
  const data = await squiggleFetch(`${SQUIGGLE_API}/?q=games;year=${year}`);
  return (data.games || []).filter(g => g.complete === 100 && g.hscore != null);
}

// ─── Worm processing ──────────────────────────────────────────────────────────

function processWorm(rawWorm) {
  // Sort by time
  const sorted = [...rawWorm].sort((a, b) => a.time - b.time);

  // Deduplicate by integer minute (keep last value)
  const byMinute = new Map();
  for (const p of sorted) {
    byMinute.set(Math.round(p.time), Math.round(p.margin));
  }

  const maxTime = Math.max(...byMinute.keys());
  if (maxTime < 1) return null;

  // Interpolate to integer minutes 0..maxTime
  const minuteKeys = [...byMinute.keys()].sort((a, b) => a - b);
  const margins = [];
  for (let m = 0; m <= maxTime; m++) {
    if (byMinute.has(m)) {
      margins.push(byMinute.get(m));
    } else {
      // Linear interpolation between surrounding minutes
      const prev = minuteKeys.filter(k => k < m).at(-1);
      const next = minuteKeys.find(k => k > m);
      if (prev == null || next == null) {
        margins.push(margins.at(-1) ?? 0);
      } else {
        const t = (m - prev) / (next - prev);
        margins.push(Math.round(byMinute.get(prev) * (1 - t) + byMinute.get(next) * t));
      }
    }
  }

  const maxAbs = Math.max(...margins.map(Math.abs));
  return { margins, maxAbsMargin: maxAbs > 0 ? maxAbs : 1 };
}

// ─── Similarity ───────────────────────────────────────────────────────────────

function normalise(margins, maxAbs) {
  return margins.map(m => m / (maxAbs || 1));
}

function similarityScore(aNorm, bNorm) {
  const len = Math.min(aNorm.length, bNorm.length);
  if (len < 2) return Infinity;
  let sum = 0;
  for (let i = 0; i < len; i++) sum += Math.abs(aNorm[i] - bNorm[i]);
  const longer = aNorm.length > bNorm.length ? aNorm : bNorm;
  const shorter = aNorm.length <= bNorm.length ? aNorm : bNorm;
  const last = shorter.at(-1);
  for (let i = len; i < longer.length; i++) sum += Math.abs(longer[i] - last);
  return Math.round(sum * 100) / 100;
}

function findMostSimilar(targetNorm, allMatches, excludeId) {
  let bestId = null;
  let bestScore = Infinity;
  for (const m of allMatches) {
    if (m.matchId === excludeId) continue;
    const norm = normalise(m.margins, m.maxAbsMargin);
    const score = similarityScore(targetNorm, norm);
    if (score < bestScore) { bestScore = score; bestId = m.matchId; }
  }
  return bestId ? { matchId: bestId, score: bestScore } : null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Building worm cache for ${TARGET_YEAR}...`);

  // Load existing cache
  const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
  const existingIds = new Set(cache.matches.map(m => m.matchId));
  console.log(`Existing matches: ${cache.matches.length}`);

  // Get completed games from Squiggle
  const games = await getCompletedGames(TARGET_YEAR);
  console.log(`Squiggle: ${games.length} completed games in ${TARGET_YEAR}`);

  // Group by round to assign sequential game numbers within each round
  const byRound = new Map();
  for (const g of games) {
    if (!byRound.has(g.round)) byRound.set(g.round, []);
    byRound.get(g.round).push(g);
  }

  // Sort games within each round by date then Squiggle id (proxy for scheduling order)
  const gamesWithAflId = [];
  for (const [round, roundGames] of [...byRound.entries()].sort((a, b) => a[0] - b[0])) {
    roundGames.sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.id - b.id);
    roundGames.forEach((g, i) => {
      const roundPad = String(round).padStart(2, '0');
      const gamePad = String(i + 1).padStart(2, '0');
      const matchId = `CD_M${TARGET_YEAR}014${roundPad}${gamePad}`;
      gamesWithAflId.push({ ...g, matchId });
    });
  }

  // Filter to games not already in cache
  const toFetch = gamesWithAflId.filter(g => !existingIds.has(g.matchId));
  console.log(`Games to fetch: ${toFetch.length}`);

  if (toFetch.length === 0) {
    console.log('Nothing to update.');
    return;
  }

  const newMatches = [];
  let succeeded = 0;
  let failed = 0;

  for (const g of toFetch) {
    process.stdout.write(`\r  ${g.matchId} (${g.hteam} v ${g.ateam})...`);
    await new Promise(r => setTimeout(r, 300)); // gentle rate limit

    const rawWorm = await fetchScoreWorm(g.matchId).catch(() => null);
    if (!rawWorm) {
      failed++;
      process.stdout.write(' no worm data\n');
      continue;
    }

    const processed = processWorm(rawWorm);
    if (!processed) {
      failed++;
      continue;
    }

    newMatches.push({
      matchId: g.matchId,
      season: TARGET_YEAR,
      round: g.round,
      homeTeam: g.hteam,
      awayTeam: g.ateam,
      margins: processed.margins,
      maxAbsMargin: processed.maxAbsMargin,
      mostSimilar: null, // computed below
    });
    succeeded++;
  }

  process.stdout.write('\n');
  console.log(`Fetched: ${succeeded} succeeded, ${failed} failed`);

  if (newMatches.length === 0) {
    console.log('No new worm data retrieved.');
    return;
  }

  // Compute mostSimilar for each new match against the full corpus
  console.log('Computing similarity for new matches...');
  const allMatchesForSim = [...cache.matches, ...newMatches];
  for (const m of newMatches) {
    const norm = normalise(m.margins, m.maxAbsMargin);
    m.mostSimilar = findMostSimilar(norm, allMatchesForSim, m.matchId);
  }

  // Append new matches to cache
  cache.matches.push(...newMatches);

  // Recompute topPairs from ALL matches (just re-score existing pairs + add new)
  // For efficiency, only update pairs involving new matches
  const newIds = new Set(newMatches.map(m => m.matchId));
  const existingTopPairs = cache.topPairs || [];

  // Find new pairs: each new match vs all others
  const candidatePairs = [];
  for (const newM of newMatches) {
    const newNorm = normalise(newM.margins, newM.maxAbsMargin);
    for (const other of cache.matches) {
      if (other.matchId === newM.matchId) continue;
      const otherNorm = normalise(other.margins, other.maxAbsMargin);
      const score = similarityScore(newNorm, otherNorm);
      if (score === Infinity) continue;
      candidatePairs.push({
        matchA: newM.matchId,
        matchB: other.matchId,
        score,
      });
    }
  }

  // Merge with existing pairs and keep top 50
  const allPairs = [...existingTopPairs.map(p => ({
    matchA: p.matchA, matchB: p.matchB, score: p.score,
  })), ...candidatePairs];
  allPairs.sort((a, b) => a.score - b.score);
  cache.topPairs = allPairs.slice(0, 50);

  writeFileSync(CACHE_PATH, JSON.stringify(cache));
  console.log(`\nDone. Cache now has ${cache.matches.length} matches.`);
  console.log(`Written to public/worm_cache.json`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
