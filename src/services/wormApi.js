// Client-side worm data — fetches static JSON, no backend needed

const teamNameMap = {
  'Adelaide Crows': 'adelaide', 'Adelaide': 'adelaide',
  'Brisbane Lions': 'brisbane', 'Brisbane': 'brisbane',
  'Carlton': 'carlton',
  'Collingwood': 'collingwood',
  'Essendon': 'essendon',
  'Fremantle': 'fremantle',
  'Geelong Cats': 'geelong', 'Geelong': 'geelong',
  'Gold Coast Suns': 'goldcoast', 'Gold Coast': 'goldcoast', 'Gold Coast SUNS': 'goldcoast',
  'GWS Giants': 'gws', 'GWS GIANTS': 'gws', 'GWS': 'gws', 'Greater Western Sydney': 'gws',
  'Hawthorn': 'hawthorn',
  'Melbourne': 'melbourne',
  'North Melbourne': 'northmelbourne',
  'Port Adelaide': 'portadelaide',
  'Richmond': 'richmond',
  'St Kilda': 'stkilda',
  'Sydney Swans': 'sydney', 'Sydney': 'sydney',
  'West Coast Eagles': 'westcoast', 'West Coast': 'westcoast',
  'Western Bulldogs': 'westernbulldogs',
};

function getTeamKey(name) {
  return teamNameMap[name] || name.toLowerCase().replace(/\s+/g, '');
}

let cache = null;

async function loadCache() {
  if (cache) return cache;
  const res = await fetch(`${import.meta.env.BASE_URL}worm_cache.json`);
  if (!res.ok) throw new Error('Failed to load worm data');
  const data = await res.json();

  // Index matches by ID
  const byId = new Map();
  for (const m of data.matches) byId.set(m.matchId, m);

  cache = { matches: data.matches, topPairs: data.topPairs, byId };
  return cache;
}

function formatMatch(m) {
  return {
    matchId: m.matchId,
    season: m.season,
    round: m.round,
    homeTeam: getTeamKey(m.homeTeam),
    awayTeam: getTeamKey(m.awayTeam),
    homeTeamName: m.homeTeam,
    awayTeamName: m.awayTeam,
    homeScore: m.homeScore ?? null,
    awayScore: m.awayScore ?? null,
    worm: m.margins.map((margin, i) => ({ time: i, margin })),
    maxAbsMargin: m.maxAbsMargin,
  };
}

export async function fetchSeasons() {
  const { matches } = await loadCache();
  const seasons = [...new Set(matches.map(m => m.season))].sort((a, b) => b - a);
  return seasons;
}

export async function fetchRounds(season) {
  const { matches } = await loadCache();
  const rounds = [...new Set(
    matches.filter(m => m.season === season).map(m => m.round)
  )].sort((a, b) => a - b);
  return rounds;
}

export async function fetchMatches(season, round) {
  const { matches } = await loadCache();
  const filtered = matches.filter(m => m.season === season && m.round === round);
  return filtered.map(m => ({
    id: m.matchId,
    homeTeam: getTeamKey(m.homeTeam),
    awayTeam: getTeamKey(m.awayTeam),
    homeTeamName: m.homeTeam,
    awayTeamName: m.awayTeam,
    homeScore: null,
    awayScore: null,
    finalMargin: m.margins[m.margins.length - 1] ?? null,
  }));
}

export async function fetchWorm(matchId) {
  const { byId } = await loadCache();
  const m = byId.get(matchId);
  if (!m) throw new Error('No worm data for this match');
  return formatMatch(m);
}

export async function fetchSimilar(matchId) {
  const { byId } = await loadCache();
  const m = byId.get(matchId);
  if (!m || !m.mostSimilar) {
    return { matchId: null, similarity: 0, message: 'No similar match found.' };
  }
  const sim = byId.get(m.mostSimilar.matchId);
  if (!sim) {
    return { matchId: null, similarity: 0, message: 'No similar match found.' };
  }
  return {
    ...formatMatch(sim),
    similarity: m.mostSimilar.score,
  };
}

export async function fetchRandom() {
  const { matches } = await loadCache();
  const pick = matches[Math.floor(Math.random() * matches.length)];
  return { matchId: pick.matchId, season: pick.season, round: pick.round };
}

export async function fetchMostSimilar(limit = 50) {
  const { topPairs, byId } = await loadCache();
  return topPairs.slice(0, limit).map(p => {
    const a = byId.get(p.matchA);
    const b = byId.get(p.matchB);
    return {
      score: p.score,
      matchA: {
        matchId: p.matchA,
        season: a?.season,
        round: a?.round,
        homeTeam: getTeamKey(a?.homeTeam || ''),
        awayTeam: getTeamKey(a?.awayTeam || ''),
        homeTeamName: a?.homeTeam,
        awayTeamName: a?.awayTeam,
        homeScore: a?.homeScore ?? null,
        awayScore: a?.awayScore ?? null,
        worm: a?.margins?.map((margin, i) => ({ time: i, margin })) || [],
        finalMargin: a?.margins?.[a.margins.length - 1] ?? null,
      },
      matchB: {
        matchId: p.matchB,
        season: b?.season,
        round: b?.round,
        homeTeam: getTeamKey(b?.homeTeam || ''),
        awayTeam: getTeamKey(b?.awayTeam || ''),
        homeTeamName: b?.homeTeam,
        awayTeamName: b?.awayTeam,
        homeScore: b?.homeScore ?? null,
        awayScore: b?.awayScore ?? null,
        worm: b?.margins?.map((margin, i) => ({ time: i, margin })) || [],
        finalMargin: b?.margins?.[b.margins.length - 1] ?? null,
      },
    };
  });
}
