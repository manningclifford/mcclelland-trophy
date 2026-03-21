/**
 * mergeRawWorms.js
 *
 * Reads server/worms_raw.json (output of fetch_worms_year.R),
 * computes mostSimilar + topPairs, and merges into public/worm_cache.json.
 *
 * Usage: node server/scripts/mergeRawWorms.js
 */

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, '../../public/worm_cache.json');
const RAW_PATH   = path.join(__dirname, '../worms_raw.json');

function normalise(margins, maxAbs) {
  return margins.map(m => m / (maxAbs || 1));
}

function similarityScore(aNorm, bNorm) {
  const len = Math.min(aNorm.length, bNorm.length);
  if (len < 2) return Infinity;
  let sum = 0;
  for (let i = 0; i < len; i++) sum += Math.abs(aNorm[i] - bNorm[i]);
  const longer  = aNorm.length > bNorm.length ? aNorm : bNorm;
  const shorter = aNorm.length <= bNorm.length ? aNorm : bNorm;
  const last = shorter.at(-1);
  for (let i = len; i < longer.length; i++) sum += Math.abs(longer[i] - last);
  return Math.round(sum * 100) / 100;
}

function findMostSimilar(targetNorm, allMatches, excludeId) {
  let bestId = null, bestScore = Infinity;
  for (const m of allMatches) {
    if (m.matchId === excludeId) continue;
    const score = similarityScore(targetNorm, normalise(m.margins, m.maxAbsMargin));
    if (score < bestScore) { bestScore = score; bestId = m.matchId; }
  }
  return bestId ? { matchId: bestId, score: bestScore } : null;
}

const rawNew = JSON.parse(readFileSync(RAW_PATH, 'utf-8'));
const cache  = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));

const existingIds = new Set(cache.matches.map(m => m.matchId));
const toAdd = rawNew.filter(m => !existingIds.has(m.matchId));

console.log(`Raw worms: ${rawNew.length} | already cached: ${rawNew.length - toAdd.length} | to add: ${toAdd.length}`);

if (toAdd.length === 0) {
  console.log('Nothing new to add.');
  process.exit(0);
}

// Compute mostSimilar for each new match against the full corpus
const allForSim = [...cache.matches, ...toAdd];
console.log('Computing similarity...');
for (const m of toAdd) {
  const norm = normalise(m.margins, m.maxAbsMargin);
  m.mostSimilar = findMostSimilar(norm, allForSim, m.matchId);
}

cache.matches.push(...toAdd);

// Update topPairs: keep existing pairs + add pairs involving new matches
const existingPairs = (cache.topPairs || []).map(p => ({ matchA: p.matchA, matchB: p.matchB, score: p.score }));
const candidatePairs = [];
for (const newM of toAdd) {
  const newNorm = normalise(newM.margins, newM.maxAbsMargin);
  for (const other of cache.matches) {
    if (other.matchId === newM.matchId) continue;
    const score = similarityScore(newNorm, normalise(other.margins, other.maxAbsMargin));
    if (score !== Infinity) candidatePairs.push({ matchA: newM.matchId, matchB: other.matchId, score });
  }
}

const allPairs = [...existingPairs, ...candidatePairs];
allPairs.sort((a, b) => a.score - b.score);
cache.topPairs = allPairs.slice(0, 50);

writeFileSync(CACHE_PATH, JSON.stringify(cache));
console.log(`Done. Cache now has ${cache.matches.length} matches.`);
console.log(`Written to public/worm_cache.json`);
