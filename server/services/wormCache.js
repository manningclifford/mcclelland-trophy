import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, '..', 'worm_cache.json');

let worms = []; // Array of worm entries from the R script
let wormsByMatch = new Map(); // matchId -> worm entry
let normalisedByMatch = new Map(); // matchId -> normalised array

export function loadWormCache() {
  if (!existsSync(CACHE_PATH)) {
    console.warn('worm_cache.json not found — run the R script first');
    return;
  }

  const raw = readFileSync(CACHE_PATH, 'utf-8');
  worms = JSON.parse(raw);
  wormsByMatch.clear();
  normalisedByMatch.clear();

  for (const w of worms) {
    wormsByMatch.set(w.matchId, w);
    normalisedByMatch.set(w.matchId, w.normalised);
  }

  console.log(`Loaded ${worms.length} worms from cache`);
}

export function getAllWorms() {
  return worms;
}

export function getWorm(matchId) {
  return wormsByMatch.get(matchId) || null;
}

/**
 * Find the most similar match by summing per-minute residuals
 * between normalised worms. Lower score = more similar.
 *
 * Both worms are normalised to [-1, 1] by their max absolute margin.
 * We compare at each shared minute, summing |a[t] - b[t]|.
 */
export function findMostSimilar(matchId) {
  const target = normalisedByMatch.get(matchId);
  if (!target) return null;

  let bestId = null;
  let bestScore = Infinity;

  for (const [candidateId, candidateNorm] of normalisedByMatch) {
    if (candidateId === matchId) continue;

    const len = Math.min(target.length, candidateNorm.length);
    if (len < 2) continue;

    let sum = 0;
    for (let i = 0; i < len; i++) {
      sum += Math.abs(target[i] - candidateNorm[i]);
    }

    // Penalise length mismatch: if one worm is longer, add residual
    // for the extra minutes (as if the other stayed at its last value)
    const longer = target.length > candidateNorm.length ? target : candidateNorm;
    const shorter = target.length > candidateNorm.length ? candidateNorm : target;
    const lastShorter = shorter[shorter.length - 1];
    for (let i = len; i < longer.length; i++) {
      sum += Math.abs(longer[i] - lastShorter);
    }

    if (sum < bestScore) {
      bestScore = sum;
      bestId = candidateId;
    }
  }

  if (!bestId) return null;

  return {
    matchId: bestId,
    score: Math.round(bestScore * 100) / 100,
    match: wormsByMatch.get(bestId),
  };
}

/**
 * Get seasons available in the worm cache.
 */
export function getSeasons() {
  const seasons = new Set();
  for (const w of worms) seasons.add(w.season);
  return [...seasons].sort((a, b) => b - a);
}

/**
 * Get rounds for a season from the worm cache.
 */
export function getRounds(season) {
  const rounds = new Set();
  for (const w of worms) {
    if (w.season === season && w.round != null) rounds.add(w.round);
  }
  return [...rounds].sort((a, b) => a - b);
}

/**
 * Get matches for a season/round from the worm cache.
 */
export function getMatches(season, round) {
  return worms.filter((w) => w.season === season && w.round === round);
}

/**
 * Compute similarity score between two normalised worm arrays.
 */
function similarityScore(a, b) {
  const len = Math.min(a.length, b.length);
  if (len < 2) return Infinity;

  let sum = 0;
  for (let i = 0; i < len; i++) {
    sum += Math.abs(a[i] - b[i]);
  }

  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const lastShorter = shorter[shorter.length - 1];
  for (let i = len; i < longer.length; i++) {
    sum += Math.abs(longer[i] - lastShorter);
  }

  return sum;
}

let cachedTopPairs = null;

/**
 * Get the top N most similar pairs across all worms.
 * Precomputed on first call and cached.
 */
export function getTopSimilarPairs(limit = 50) {
  if (cachedTopPairs && cachedTopPairs.length >= limit) {
    return cachedTopPairs.slice(0, limit);
  }

  console.log('Computing top similar pairs across all worms...');
  const start = Date.now();

  const ids = [...normalisedByMatch.keys()];
  const pairs = [];

  for (let i = 0; i < ids.length; i++) {
    const aId = ids[i];
    const aNorm = normalisedByMatch.get(aId);

    for (let j = i + 1; j < ids.length; j++) {
      const bId = ids[j];
      const bNorm = normalisedByMatch.get(bId);

      const score = similarityScore(aNorm, bNorm);
      if (score === Infinity) continue;

      // Keep a running top-N using insertion
      if (pairs.length < limit) {
        pairs.push({ matchA: aId, matchB: bId, score });
        if (pairs.length === limit) {
          pairs.sort((a, b) => a.score - b.score);
        }
      } else if (score < pairs[limit - 1].score) {
        pairs[limit - 1] = { matchA: aId, matchB: bId, score };
        // Re-sort to keep worst at end
        pairs.sort((a, b) => a.score - b.score);
      }
    }
  }

  if (pairs.length < limit) {
    pairs.sort((a, b) => a.score - b.score);
  }

  cachedTopPairs = pairs.map((p) => ({
    ...p,
    score: Math.round(p.score * 100) / 100,
    matchA: wormsByMatch.get(p.matchA),
    matchB: wormsByMatch.get(p.matchB),
  }));

  console.log(`Computed top ${limit} similar pairs in ${Date.now() - start}ms`);
  return cachedTopPairs.slice(0, limit);
}
