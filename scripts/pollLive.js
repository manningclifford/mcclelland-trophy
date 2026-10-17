/**
 * pollLive.js  —  P2: server-side live data (retires the corsproxy.io dependency)
 *
 * Writes two small static files the public Vercel site can read directly:
 *   public/live_mcclelland.json  — combined AFL (+AFLW when live) McClelland standings
 *   public/live_shield.json      — Brunswick St Belt: last defence + next contention game
 *
 * WHY: today src/services/aflApi.js fetches the live men's ladder in every visitor's
 * browser via the public https://corsproxy.io proxy — a fragile third-party on the
 * critical path. Running the fetch here (server-to-server, no CORS) and publishing a
 * static JSON removes that dependency entirely.
 *
 * SOURCES:
 *   - Men's ladder:  Squiggle `q=standings;year=` — reliable, no auth, no proxy.
 *                    (Falls back gracefully; AFL API can be added if a token is set.)
 *   - Women's ladder: AFL API (aflapi.afl.com.au) best-effort. If unavailable
 *                    (e.g. during the men's Mar–Sep season, when AFLW hasn't played)
 *                    we publish men's-only, which is the correct McClelland state then.
 *   - Shield:        current holder from public/linear_title.json + Squiggle fixture.
 *
 * The combine maths mirrors src/data/historical.js (calculateLegacyPoints /
 * calculateCombinedPercentage) and src/services/aflApi.js.
 *
 * Run:  node scripts/pollLive.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');
const SQUIGGLE = 'https://api.squiggle.com.au';
const AFL_API = 'https://aflapi.afl.com.au';
const UA = 'SherrinSpreadsheets/pollLive (github.com/manningclifford/mcclelland-trophy)';
const YEAR = parseInt(process.argv[2] || String(new Date().getFullYear()), 10);
const AFL_API_TOKEN = process.env.AFL_API_TOKEN || null; // optional, for AFLW

// ── team key normalisation (matches src/data/teams.js) ──────────────────────
const NAME_MAP = {
  'Adelaide Crows': 'adelaide', 'Adelaide': 'adelaide',
  'Brisbane Lions': 'brisbane', 'Brisbane': 'brisbane',
  'Carlton': 'carlton', 'Collingwood': 'collingwood', 'Essendon': 'essendon',
  'Fremantle': 'fremantle', 'Geelong Cats': 'geelong', 'Geelong': 'geelong',
  'Gold Coast Suns': 'goldcoast', 'Gold Coast': 'goldcoast', 'Gold Coast SUNS': 'goldcoast',
  'GWS Giants': 'gws', 'GWS GIANTS': 'gws', 'GWS': 'gws', 'Greater Western Sydney': 'gws',
  'Hawthorn': 'hawthorn', 'Melbourne': 'melbourne',
  'North Melbourne': 'northmelbourne', 'Kangaroos': 'northmelbourne',
  'Port Adelaide': 'portadelaide', 'Richmond': 'richmond', 'St Kilda': 'stkilda',
  'Sydney Swans': 'sydney', 'Sydney': 'sydney',
  'West Coast Eagles': 'westcoast', 'West Coast': 'westcoast',
  'Western Bulldogs': 'westernbulldogs',
};
function teamKey(name) {
  return NAME_MAP[name] || (name || '').toLowerCase().replace(/\s+/g, '');
}

const ALL_TEAMS = [
  'adelaide', 'brisbane', 'carlton', 'collingwood', 'essendon', 'fremantle',
  'geelong', 'goldcoast', 'gws', 'hawthorn', 'melbourne', 'northmelbourne',
  'portadelaide', 'richmond', 'stkilda', 'sydney', 'westcoast', 'westernbulldogs',
];

// ── McClelland maths (mirrors src/data/historical.js) ───────────────────────
function calculateLegacyPoints(t) {
  return t.aflWins * 4 + t.aflDraws * 2 + t.aflwWins * 8 + t.aflwDraws * 4;
}
function calculateCombinedPercentage(t) {
  const aflGames = t.aflWins + t.aflLosses + t.aflDraws;
  const aflwGames = t.aflwWins + t.aflwLosses + t.aflwDraws;
  const total = aflGames + aflwGames;
  if (total === 0) return 0;
  if (aflwGames === 0) return t.aflPct;
  return (t.aflPct * aflGames + t.aflwPct * aflwGames) / total;
}

// ── fetch helpers ───────────────────────────────────────────────────────────
let lastReq = 0;
async function politeFetch(url, opts = {}, minGapMs = 1000) {
  const gap = Date.now() - lastReq;
  if (gap < minGapMs) await new Promise((r) => setTimeout(r, minGapMs - gap));
  lastReq = Date.now();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json', ...(opts.headers || {}) },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Men's ladder from Squiggle standings.
async function fetchMensLadder(year) {
  const data = await politeFetch(`${SQUIGGLE}/?q=standings;year=${year}`);
  const rows = data.standings || [];
  const out = {};
  for (const r of rows) {
    out[teamKey(r.name)] = {
      wins: r.wins || 0,
      losses: r.losses || 0,
      draws: r.draws || 0,
      percentage: typeof r.percentage === 'number' ? r.percentage : 100,
    };
  }
  return Object.keys(out).length ? out : null;
}

// Women's ladder from the AFL API (best-effort). Returns null if unavailable.
async function fetchWomensLadder(year) {
  try {
    const headers = AFL_API_TOKEN ? { 'x-media-mis-token': AFL_API_TOKEN } : {};
    const data = await politeFetch(`${AFL_API}/aflw/v2/compseasons/${year}/standings`, { headers });
    const rows = data.standings || [];
    const out = {};
    for (const e of rows) {
      const name = e.team?.name || e.teamName;
      if (!name) continue;
      out[teamKey(name)] = {
        wins: e.thisSeasonRecord?.winLossRecord?.wins ?? e.won ?? 0,
        losses: e.thisSeasonRecord?.winLossRecord?.losses ?? e.lost ?? 0,
        draws: e.thisSeasonRecord?.winLossRecord?.draws ?? e.drawn ?? 0,
        percentage: e.thisSeasonRecord?.percentage ?? e.percentage ?? 100,
      };
    }
    return Object.keys(out).length ? out : null;
  } catch (e) {
    console.warn(`  AFLW ladder unavailable (${e.message}) — publishing men's-only McClelland.`);
    return null;
  }
}

async function buildMcClelland(year) {
  const [afl, aflw] = await Promise.all([fetchMensLadder(year), fetchWomensLadder(year)]);
  if (!afl) throw new Error('Could not fetch the men\'s ladder from Squiggle.');

  const standings = ALL_TEAMS.map((key) => {
    const a = afl[key] || { wins: 0, losses: 0, draws: 0, percentage: 0 };
    const w = (aflw && aflw[key]) || { wins: 0, losses: 0, draws: 0, percentage: 0 };
    const t = {
      team: key,
      aflWins: a.wins, aflLosses: a.losses, aflDraws: a.draws, aflPct: a.percentage,
      aflwWins: w.wins, aflwLosses: w.losses, aflwDraws: w.draws, aflwPct: w.percentage,
    };
    return { ...t, mcClellandPoints: calculateLegacyPoints(t), combinedPct: calculateCombinedPercentage(t) };
  }).sort((x, y) =>
    y.mcClellandPoints !== x.mcClellandPoints
      ? y.mcClellandPoints - x.mcClellandPoints
      : y.combinedPct - x.combinedPct
  );

  return {
    generatedAt: new Date().toISOString(),
    year,
    mensSource: 'squiggle',
    aflwAvailable: !!aflw,
    standings,
  };
}

// ── Shield (Brunswick St Belt) next game + last defence ─────────────────────
async function buildShield(year) {
  const ltPath = path.join(PUBLIC, 'linear_title.json');
  if (!existsSync(ltPath)) {
    console.warn('  linear_title.json not found — skipping shield.');
    return null;
  }
  const holderKey = JSON.parse(readFileSync(ltPath, 'utf-8')).currentHolder;
  if (!holderKey) return null;

  const data = await politeFetch(`${SQUIGGLE}/?q=games;year=${year}`);
  const games = (data.games || []).filter((g) => g.hteam && g.ateam);
  const holderGames = games.filter(
    (g) => teamKey(g.hteam) === holderKey || teamKey(g.ateam) === holderKey
  );

  const completed = holderGames
    .filter((g) => g.complete === 100)
    .sort((a, b) => (b.unixtime || 0) - (a.unixtime || 0));
  let lastDefense = null;
  if (completed.length) {
    const g = completed[0];
    const isHome = teamKey(g.hteam) === holderKey;
    lastDefense = {
      round: g.round,
      roundName: g.roundname || `Round ${g.round}`,
      isHome,
      opponentKey: teamKey(isHome ? g.ateam : g.hteam),
      opponentName: isHome ? g.ateam : g.hteam,
      holderScore: isHome ? g.hscore : g.ascore,
      opponentScore: isHome ? g.ascore : g.hscore,
      held: (isHome ? g.hscore : g.ascore) >= (isHome ? g.ascore : g.hscore),
    };
  }

  const upcoming = holderGames
    .filter((g) => g.complete < 100)
    .sort((a, b) => (a.unixtime || 0) - (b.unixtime || 0));
  let nextGame = null;
  if (upcoming.length) {
    const g = upcoming[0];
    const isHome = teamKey(g.hteam) === holderKey;
    nextGame = {
      round: g.round,
      roundName: g.roundname || `Round ${g.round}`,
      date: g.date || null,
      venue: g.venue || null,
      isHome,
      opponentKey: teamKey(isHome ? g.ateam : g.hteam),
      opponentName: isHome ? g.ateam : g.hteam,
    };
  }

  return { generatedAt: new Date().toISOString(), year, holder: holderKey, lastDefense, nextGame };
}

// ── main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`pollLive: fetching live data for ${YEAR}...`);

  const mcc = await buildMcClelland(YEAR);
  writeFileSync(path.join(PUBLIC, 'live_mcclelland.json'), JSON.stringify(mcc));
  console.log(
    `  live_mcclelland.json written — leader: ${mcc.standings[0]?.team} ` +
    `(${mcc.standings[0]?.mcClellandPoints} pts), AFLW ${mcc.aflwAvailable ? 'live' : 'not yet'}`
  );

  const shield = await buildShield(YEAR);
  if (shield) {
    writeFileSync(path.join(PUBLIC, 'live_shield.json'), JSON.stringify(shield));
    console.log(
      `  live_shield.json written — holder: ${shield.holder}` +
      (shield.nextGame ? `, next vs ${shield.nextGame.opponentKey} (${shield.nextGame.roundName})` : ', no upcoming game')
    );
  }
  console.log('pollLive: done.');
}

main().catch((e) => {
  console.error('pollLive FATAL:', e.message);
  process.exit(1);
});
