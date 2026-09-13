// Server-side fetches for current-season data. These can't run in the browser:
// Squiggle rejects cross-origin requests (forbidden_origin), the AFL API rejects
// CORS requests, and corsproxy.io now requires a paid API key.

const SQUIGGLE_API = 'https://api.squiggle.com.au';
const AFL_API = 'https://aflapi.afl.com.au/afl/v2';
const AFLW_COMPETITION_ID = 3;
// Squiggle bans generic user agents — identify the site.
const USER_AGENT = 'SherrinSpreadsheets (afl.clifford.works; github.com/manningclifford/mcclelland-trophy)';

export const ALL_TEAMS = [
  'adelaide', 'brisbane', 'carlton', 'collingwood', 'essendon', 'fremantle',
  'geelong', 'goldcoast', 'gws', 'hawthorn', 'melbourne', 'northmelbourne',
  'portadelaide', 'richmond', 'stkilda', 'sydney', 'westcoast', 'westernbulldogs',
];

const NAME_MAP = {
  'Adelaide Crows': 'adelaide', 'Adelaide': 'adelaide',
  'Brisbane Lions': 'brisbane', 'Brisbane': 'brisbane',
  'Carlton': 'carlton', 'Collingwood': 'collingwood', 'Essendon': 'essendon',
  'Fremantle': 'fremantle', 'Geelong Cats': 'geelong', 'Geelong': 'geelong',
  'Gold Coast Suns': 'goldcoast', 'Gold Coast SUNS': 'goldcoast', 'Gold Coast': 'goldcoast',
  'GWS Giants': 'gws', 'GWS GIANTS': 'gws', 'GWS': 'gws', 'Greater Western Sydney': 'gws',
  'Hawthorn': 'hawthorn', 'Melbourne': 'melbourne',
  'North Melbourne': 'northmelbourne', 'Kangaroos': 'northmelbourne',
  'Port Adelaide': 'portadelaide', 'Richmond': 'richmond', 'St Kilda': 'stkilda',
  'Sydney Swans': 'sydney', 'Sydney': 'sydney',
  'West Coast Eagles': 'westcoast', 'West Coast': 'westcoast',
  'Western Bulldogs': 'westernbulldogs',
};

export function teamKey(name) {
  return NAME_MAP[name] || (name || '').toLowerCase().replace(/\s+/g, '');
}

async function getJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

async function fetchMensLadder(year) {
  const { standings = [] } = await getJson(`${SQUIGGLE_API}/?q=standings;year=${year}`);
  const ladder = {};
  for (const row of standings) {
    ladder[teamKey(row.name)] = {
      wins: row.wins || 0,
      losses: row.losses || 0,
      draws: row.draws || 0,
      percentage: typeof row.percentage === 'number' ? row.percentage : 100,
    };
  }
  return Object.keys(ladder).length ? ladder : null;
}

// The AFL API keys seasons by numeric compSeason id (e.g. 96 = AFLW 2026), not by year.
async function fetchWomensLadder(year) {
  const { compSeasons = [] } = await getJson(
    `${AFL_API}/competitions/${AFLW_COMPETITION_ID}/compseasons?pageSize=50`
  );
  const season = compSeasons.find((s) => s.name?.includes(String(year)));
  if (!season) return null;

  const { ladders = [] } = await getJson(`${AFL_API}/compseasons/${season.id}/ladders`);
  const ladder = {};
  // Early AFLW seasons were split into conferences, so merge every ladder.
  for (const entry of ladders.flatMap((l) => l.entries || [])) {
    const record = entry.thisSeasonRecord || {};
    ladder[teamKey(entry.team?.name)] = {
      wins: record.winLossRecord?.wins ?? 0,
      losses: record.winLossRecord?.losses ?? 0,
      draws: record.winLossRecord?.draws ?? 0,
      percentage: record.percentage ?? 100,
    };
  }
  return Object.keys(ladder).length ? ladder : null;
}

// Per-club AFL + AFLW records. Points and sorting stay in src/data/historical.js.
export async function getMcClellandRecords(year) {
  const [afl, aflw] = await Promise.all([
    fetchMensLadder(year),
    fetchWomensLadder(year).catch((err) => {
      console.warn(`AFLW ladder unavailable for ${year}: ${err.message}`);
      return null;
    }),
  ]);
  if (!afl) throw new Error(`No ${year} AFL ladder available from Squiggle`);

  const empty = { wins: 0, losses: 0, draws: 0, percentage: 0 };
  const teams = ALL_TEAMS.map((key) => {
    const a = afl[key] || empty;
    const w = aflw?.[key] || empty;
    return {
      team: key,
      aflWins: a.wins, aflLosses: a.losses, aflDraws: a.draws, aflPct: a.percentage,
      aflwWins: w.wins, aflwLosses: w.losses, aflwDraws: w.draws, aflwPct: w.percentage,
    };
  });

  return { year, aflwAvailable: Boolean(aflw), teams, generatedAt: new Date().toISOString() };
}

// Brunswick St Belt holder's most recent completed game and next scheduled game.
export async function getShieldSchedule(holderKey, year) {
  const { games = [] } = await getJson(`${SQUIGGLE_API}/?q=games;year=${year}`);
  const holderGames = games.filter(
    (g) => g.hteam && g.ateam && (teamKey(g.hteam) === holderKey || teamKey(g.ateam) === holderKey)
  );

  const summarise = (g) => {
    const isHome = teamKey(g.hteam) === holderKey;
    return {
      round: g.round,
      roundName: g.roundname || `Round ${g.round}`,
      isHome,
      opponentKey: teamKey(isHome ? g.ateam : g.hteam),
      opponentName: isHome ? g.ateam : g.hteam,
    };
  };

  const last = holderGames
    .filter((g) => g.complete === 100)
    .sort((a, b) => (b.unixtime || 0) - (a.unixtime || 0))[0];
  const next = holderGames
    .filter((g) => g.complete < 100)
    .sort((a, b) => (a.unixtime || 0) - (b.unixtime || 0))[0];

  let lastDefense = null;
  if (last) {
    const summary = summarise(last);
    lastDefense = {
      ...summary,
      holderScore: summary.isHome ? last.hscore : last.ascore,
      opponentScore: summary.isHome ? last.ascore : last.hscore,
    };
  }

  const nextGame = next
    ? { ...summarise(next), date: next.date || null, venue: next.venue || null }
    : null;

  return { nextGame, lastDefense };
}
