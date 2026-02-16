/**
 * Extract quarter margins from worm data.
 * Worm data is an array of { time, margin } points.
 * Quarter boundaries are roughly at 20, 40, 60, 80 minutes (AFL quarters).
 * For quarter-only data (4 points), use them directly.
 */
export function extractQuarterMargins(wormData) {
  if (!wormData || wormData.length === 0) return null;

  // If we only have 4-5 points (quarter data), return margins directly
  if (wormData.length <= 5) {
    return wormData.map((p) => p.margin);
  }

  // For richer time-series data, sample at quarter boundaries
  const quarterTimes = [20, 40, 60, 80]; // approximate quarter end times in minutes
  const margins = [];

  for (const qt of quarterTimes) {
    // Find the closest point to each quarter time
    let closest = wormData[0];
    let minDist = Math.abs(wormData[0].time - qt);

    for (const point of wormData) {
      const dist = Math.abs(point.time - qt);
      if (dist < minDist) {
        minDist = dist;
        closest = point;
      }
    }
    margins.push(closest.margin);
  }

  return margins;
}

/**
 * Compute Euclidean distance between two quarter-margin vectors.
 * Returns a similarity score 0–100 (100 = identical).
 */
export function quarterSimilarity(marginsA, marginsB) {
  if (!marginsA || !marginsB) return 0;

  const len = Math.min(marginsA.length, marginsB.length);
  let sumSq = 0;
  for (let i = 0; i < len; i++) {
    const diff = marginsA[i] - marginsB[i];
    sumSq += diff * diff;
  }
  const distance = Math.sqrt(sumSq);

  // Normalize: max realistic distance ~200 (4 quarters, each ±100 margin)
  // Use exponential decay for a nicer similarity curve
  const similarity = Math.exp(-distance / 40) * 100;
  return Math.round(similarity);
}

/**
 * Find the most similar match from a set of candidates.
 * Returns { matchId, score } or null.
 */
export function findMostSimilar(targetMargins, candidates) {
  if (!targetMargins || candidates.length === 0) return null;

  let bestMatch = null;
  let bestScore = -1;

  for (const { matchId, margins } of candidates) {
    const score = quarterSimilarity(targetMargins, margins);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { matchId, score };
    }
  }

  return bestMatch;
}
