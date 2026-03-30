/**
 * patchAlltimeAFL.js
 *
 * Incrementally updates public/alltime_afl.json with the current season's
 * results only — rather than rebuilding from 1897.
 *
 * Fetches the current year (and re-fetches the previous year in case late
 * results were added), updates those two seasons, recomputes trophyCount,
 * and writes back.
 *
 * Usage: node server/scripts/patchAlltimeAFL.js [year]
 *        year defaults to current year
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, '../../public/alltime_afl.json');
const SQUIGGLE_API = 'https://api.squiggle.com.au';
const UA = 'TheSherrinSpreadsheets/AlltimeAFLPatch (github.com/manning/mcclelland-trophy)';
const PATCH_YEAR = parseInt(process.argv[2] || String(new Date().getFullYear()), 10);

const TEAM_NAME_MAP = {
  'Adelaide Crows': 'adelaide', 'Adelaide': 'adelaide',
  'Brisbane Lions': 'brisbane', 'Brisbane': 'brisbane', 'Brisbane Bears': 'brisbane',
  'Carlton': 'carlton', 'Collingwood': 'collingwood', 'Essendon': 'essendon',
  'Fremantle': 'fremantle', 'Geelong Cats': 'geelong', 'Geelong': 'geelong',
  'Gold Coast Suns': 'goldcoast', 'Gold Coast': 'goldcoast', 'Gold Coast SUNS': 'goldcoast',
  'GWS Giants': 'gws', 'GWS GIANTS': 'gws', 'GWS': 'gws', 'Greater Western Sydney': 'gws',
  'Hawthorn': 'hawthorn', 'Melbourne': 'melbourne',
  'North Melbourne': 'northmelbourne', 'Kangaroos': 'northmelbourne',
  'Port Adelaide': 'portadelaide', 'Richmond': 'richmond', 'St Kilda': 'stkilda',
  'Sydney Swans': 'sydney', 'Sydney': 'sydney', 'South Melbourne': 'sydney',
  'West Coast Eagles': 'westcoast', 'West Coast': 'westcoast',
  'Western Bulldogs': 'westernbulldogs', 'Footscray': 'westernbulldogs',
  'Fitzroy': 'fitzroy', 'University': 'university',
};

function getTeamKey(name) {
  if (!name) return 'unknown';
  return TEAM_NAME_MAP[name] || name.toLowerCase().replace(/\s+/g, '');
}

let lastRequestTime = 0;
async function fetchGames(year) {
  const elapsed = Date.now() - lastRequestTime;
  if (elapsed < 1100) await new Promise(r => setTimeout(r, 1100 - elapsed));
  lastRequestTime = Date.now();
  const res = await fetch(`${SQUIGGLE_API}/?q=games;year=${year}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Squiggle HTTP ${res.status} for ${year}`);
  const data = await res.json();
  return data.games || [];
}

function buildSeasonStandings(games) {
  const regular = games.filter(g => g.complete === 100 && g.is_final === 0 && g.hscore != null && g.ascore != null);
  const teamStats = {};

  function record(teamKey, w, l, d, pf, pa) {
    if (!teamStats[teamKey]) teamStats[teamKey] = { wins: 0, losses: 0, draws: 0, pf: 0, pa: 0 };
    teamStats[teamKey].wins += w;
    teamStats[teamKey].losses += l;
    teamStats[teamKey].draws += d;
    teamStats[teamKey].pf += pf;
    teamStats[teamKey].pa += pa;
  }

  for (const g of regular) {
    const hk = getTeamKey(g.hteam), ak = getTeamKey(g.ateam);
    if (g.hscore > g.ascore) { record(hk, 1, 0, 0, g.hscore, g.ascore); record(ak, 0, 1, 0, g.ascore, g.hscore); }
    else if (g.ascore > g.hscore) { record(hk, 0, 1, 0, g.hscore, g.ascore); record(ak, 1, 0, 0, g.ascore, g.hscore); }
    else { record(hk, 0, 0, 1, g.hscore, g.ascore); record(ak, 0, 0, 1, g.ascore, g.hscore); }
  }

  const standings = Object.entries(teamStats)
    .map(([team, s]) => {
      const pts = s.wins * 4 + s.draws * 2;
      const pct = s.pa > 0 ? (s.pf / s.pa) * 100 : 0;
      return { team, wins: s.wins, losses: s.losses, draws: s.draws, played: s.wins + s.losses + s.draws, pts, pct: Math.round(pct * 10) / 10 };
    })
    .sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.pct - a.pct);

  const trophy = standings[0]
    ? { winner: standings[0].team, wins: standings[0].wins, losses: standings[0].losses, draws: standings[0].draws, pts: standings[0].pts, pct: standings[0].pct }
    : null;

  return { trophy, standings, gamesPlayed: regular.length };
}

async function main() {
  console.log(`Patching alltime AFL for ${PATCH_YEAR}...`);

  const existing = JSON.parse(readFileSync(OUT_PATH, 'utf-8'));

  // Patch current year + previous year (in case late results were added)
  const yearsToPatch = [PATCH_YEAR - 1, PATCH_YEAR].filter(y => y >= existing.firstYear);

  for (const year of yearsToPatch) {
    process.stdout.write(`  Fetching ${year}... `);
    try {
      const games = await fetchGames(year);
      existing.seasons[year] = buildSeasonStandings(games);
      console.log(`${existing.seasons[year].gamesPlayed} regular season games`);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      if (!existing.failedYears.includes(year)) existing.failedYears.push(year);
    }
  }

  // Recompute all-time trophy count
  const trophyCount = {};
  for (const s of Object.values(existing.seasons)) {
    if (s.trophy) trophyCount[s.trophy.winner] = (trophyCount[s.trophy.winner] || 0) + 1;
  }

  existing.trophyCount = trophyCount;
  existing.lastYear = PATCH_YEAR;
  existing.generatedAt = new Date().toISOString();

  writeFileSync(OUT_PATH, JSON.stringify(existing));
  console.log(`Done. Written to alltime_afl.json`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
