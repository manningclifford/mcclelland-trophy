// McClelland standings: hardcoded data for past seasons, /api/mcclelland for live ones
import { getHistoricalStandings, calculateLegacyPoints, calculateCombinedPercentage } from '../data/historical';

// Cache for API responses
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

async function fetchLiveRecords(year) {
  const cached = cache.get(year);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await fetch(`/api/mcclelland?year=${year}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  cache.set(year, { data, timestamp: Date.now() });
  return data;
}

// Combine AFL and AFLW data into McClelland standings
export async function getMcClellandStandings(year) {
  // First check if we have historical/hardcoded data for this year
  const historical = getHistoricalStandings(year);
  if (historical) {
    return { standings: historical, isLive: false, error: null };
  }

  try {
    const { teams } = await fetchLiveRecords(year);

    // For 2025+, we would use the new ranking system if available
    // For now, fall back to legacy calculation
    const standings = teams.map(team => ({
      ...team,
      mcClellandPoints: calculateLegacyPoints(team),
      combinedPct: calculateCombinedPercentage(team),
    }));

    // Sort by points, then percentage
    standings.sort((a, b) => {
      if (b.mcClellandPoints !== a.mcClellandPoints) {
        return b.mcClellandPoints - a.mcClellandPoints;
      }
      return b.combinedPct - a.combinedPct;
    });

    return { standings, isLive: true, error: null };
  } catch (error) {
    console.error('Failed to fetch live McClelland standings:', error);
    return {
      standings: null,
      isLive: false,
      error: 'Unable to fetch live data. Please try again later.',
    };
  }
}

// Force refresh (clear cache and refetch)
export function clearCache() {
  cache.clear();
}
