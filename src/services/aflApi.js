// AFL API service for fetching live ladder data
import { getTeamKey } from '../data/teams';
import { getHistoricalStandings, calculateLegacyPoints, calculateCombinedPercentage } from '../data/historical';

const AFL_API_BASE = 'https://aflapi.afl.com.au';
const CORS_PROXY = 'https://corsproxy.io/?';

// Cache for API responses
const cache = {
  data: {},
  timestamp: {},
  TTL: 5 * 60 * 1000, // 5 minutes
};

function getCached(key) {
  if (cache.data[key] && Date.now() - cache.timestamp[key] < cache.TTL) {
    return cache.data[key];
  }
  return null;
}

function setCache(key, data) {
  cache.data[key] = data;
  cache.timestamp[key] = Date.now();
}

async function fetchWithProxy(url) {
  const proxyUrl = CORS_PROXY + encodeURIComponent(url);

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API fetch failed:', error);
    throw error;
  }
}

// Fetch AFL (men's) ladder
async function fetchAFLLadder(year) {
  const cacheKey = `afl-${year}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // AFL API endpoint for standings
    const url = `${AFL_API_BASE}/afl/v2/compseasons/${year}/standings`;
    const data = await fetchWithProxy(url);

    const standings = data.standings || [];
    const teamStandings = {};

    for (const entry of standings) {
      const teamName = entry.team?.name || entry.teamName;
      const teamKey = getTeamKey(teamName);

      teamStandings[teamKey] = {
        wins: entry.thisSeasonRecord?.winLossRecord?.wins || entry.won || 0,
        losses: entry.thisSeasonRecord?.winLossRecord?.losses || entry.lost || 0,
        draws: entry.thisSeasonRecord?.winLossRecord?.draws || entry.drawn || 0,
        percentage: entry.thisSeasonRecord?.percentage || entry.percentage || 100,
      };
    }

    setCache(cacheKey, teamStandings);
    return teamStandings;
  } catch (error) {
    console.error('Failed to fetch AFL ladder:', error);
    return null;
  }
}

// Fetch AFLW ladder
async function fetchAFLWLadder(year) {
  const cacheKey = `aflw-${year}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // AFLW uses different competition season IDs
    // The AFLW season typically starts in the second half of the year
    const url = `${AFL_API_BASE}/aflw/v2/compseasons/${year}/standings`;
    const data = await fetchWithProxy(url);

    const standings = data.standings || [];
    const teamStandings = {};

    for (const entry of standings) {
      const teamName = entry.team?.name || entry.teamName;
      const teamKey = getTeamKey(teamName);

      teamStandings[teamKey] = {
        wins: entry.thisSeasonRecord?.winLossRecord?.wins || entry.won || 0,
        losses: entry.thisSeasonRecord?.winLossRecord?.losses || entry.lost || 0,
        draws: entry.thisSeasonRecord?.winLossRecord?.draws || entry.drawn || 0,
        percentage: entry.thisSeasonRecord?.percentage || entry.percentage || 100,
      };
    }

    setCache(cacheKey, teamStandings);
    return teamStandings;
  } catch (error) {
    console.error('Failed to fetch AFLW ladder:', error);
    return null;
  }
}

// Get all 18 teams
function getAllTeams() {
  return [
    'adelaide', 'brisbane', 'carlton', 'collingwood', 'essendon', 'fremantle',
    'geelong', 'goldcoast', 'gws', 'hawthorn', 'melbourne', 'northmelbourne',
    'portadelaide', 'richmond', 'stkilda', 'sydney', 'westcoast', 'westernbulldogs'
  ];
}

// Combine AFL and AFLW data into McClelland standings
export async function getMcClellandStandings(year) {
  // First check if we have historical/hardcoded data for this year
  const historical = getHistoricalStandings(year);
  if (historical) {
    return { standings: historical, isLive: false, error: null };
  }

  // For years without historical data, try to fetch live data
  try {
    const [aflData, aflwData] = await Promise.all([
      fetchAFLLadder(year),
      fetchAFLWLadder(year)
    ]);

    if (!aflData && !aflwData) {
      return {
        standings: null,
        isLive: false,
        error: 'Unable to fetch live data. Please try again later.'
      };
    }

    // Combine data for all teams
    const allTeams = getAllTeams();
    const combined = allTeams.map(teamKey => {
      const afl = aflData?.[teamKey] || { wins: 0, losses: 0, draws: 0, percentage: 0 };
      const aflw = aflwData?.[teamKey] || { wins: 0, losses: 0, draws: 0, percentage: 0 };

      const teamData = {
        team: teamKey,
        aflWins: afl.wins,
        aflLosses: afl.losses,
        aflDraws: afl.draws,
        aflPct: afl.percentage,
        aflwWins: aflw.wins,
        aflwLosses: aflw.losses,
        aflwDraws: aflw.draws,
        aflwPct: aflw.percentage,
      };

      // For 2025+, we would use the new ranking system if available
      // For now, fall back to legacy calculation
      return {
        ...teamData,
        mcClellandPoints: calculateLegacyPoints(teamData),
        combinedPct: calculateCombinedPercentage(teamData),
      };
    });

    // Sort by points, then percentage
    combined.sort((a, b) => {
      if (b.mcClellandPoints !== a.mcClellandPoints) {
        return b.mcClellandPoints - a.mcClellandPoints;
      }
      return b.combinedPct - a.combinedPct;
    });

    return {
      standings: combined,
      isLive: true,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching standings:', error);
    return {
      standings: null,
      isLive: false,
      error: 'Failed to fetch live data: ' + error.message,
    };
  }
}

// Force refresh (clear cache and refetch)
export function clearCache() {
  cache.data = {};
  cache.timestamp = {};
}
