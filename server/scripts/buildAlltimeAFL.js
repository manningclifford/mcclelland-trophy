/**
 * buildAlltimeAFL.js
 *
 * Fetches all VFL/AFL regular-season results from Squiggle (1897–present),
 * computes per-season team standings, and writes alltime_afl.json.
 *
 * Usage: node server/scripts/buildAlltimeAFL.js
 * Output: alltime_afl.json in the project root (served as a static asset)
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SQUIGGLE_API = 'https://api.squiggle.com.au';
const USER_AGENT = 'TheSherrinSpreadsheets/AlltimeAFL (github.com/manning/mcclelland-trophy)';
const FIRST_YEAR = 1897;
const CURRENT_YEAR = new Date().getFullYear();

const TEAM_NAME_MAP = {
  'Adelaide Crows': 'adelaide', 'Adelaide': 'adelaide',
  'Brisbane Lions': 'brisbane', 'Brisbane': 'brisbane', 'Brisbane Bears': 'brisbane',
  'Carlton': 'carlton',
  'Collingwood': 'collingwood',
  'Essendon': 'essendon',
  'Fremantle': 'fremantle',
  'Geelong Cats': 'geelong', 'Geelong': 'geelong',
  'Gold Coast Suns': 'goldcoast', 'Gold Coast': 'goldcoast', 'Gold Coast SUNS': 'goldcoast',
  'GWS Giants': 'gws', 'GWS GIANTS': 'gws', 'GWS': 'gws', 'Greater Western Sydney': 'gws',
  'Hawthorn': 'hawthorn',
  'Melbourne': 'melbourne',
  'North Melbourne': 'northmelbourne', 'Kangaroos': 'northmelbourne',
  'Port Adelaide': 'portadelaide',
  'Richmond': 'richmond',
  'St Kilda': 'stkilda',
  'Sydney Swans': 'sydney', 'Sydney': 'sydney', 'South Melbourne': 'sydney',
  'West Coast Eagles': 'westcoast', 'West Coast': 'westcoast',
  'Western Bulldogs': 'westernbulldogs', 'Footscray': 'westernbulldogs',
  'Fitzroy': 'fitzroy',
  'University': 'university',
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
  const url = `${SQUIGGLE_API}/?q=games;year=${year}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.games || [];
}

async function main() {
  console.log(`Building all-time AFL standings ${FIRST_YEAR}–${CURRENT_YEAR}...`);
  console.log('This takes ~2 minutes due to Squiggle rate limiting.\n');

  const seasons = {};
  const failedYears = [];

  for (let year = FIRST_YEAR; year <= CURRENT_YEAR; year++) {
    const n = year - FIRST_YEAR + 1;
    const total = CURRENT_YEAR - FIRST_YEAR + 1;
    process.stdout.write(`\r  ${year}  [${n}/${total}]   `);

    try {
      const games = await fetchGames(year);

      // Only regular-season completed games
      const regular = games.filter(
        g => g.complete === 100 && g.is_final === 0 && g.hscore != null && g.ascore != null
      );

      // Track team stats: wins, losses, draws, pointsFor, pointsAgainst
      const teamStats = {};

      function record(teamKey, w, l, d, pf, pa) {
        if (!teamStats[teamKey]) {
          teamStats[teamKey] = { wins: 0, losses: 0, draws: 0, pf: 0, pa: 0 };
        }
        teamStats[teamKey].wins += w;
        teamStats[teamKey].losses += l;
        teamStats[teamKey].draws += d;
        teamStats[teamKey].pf += pf;
        teamStats[teamKey].pa += pa;
      }

      for (const g of regular) {
        const hk = getTeamKey(g.hteam);
        const ak = getTeamKey(g.ateam);
        if (g.hscore > g.ascore) {
          record(hk, 1, 0, 0, g.hscore, g.ascore);
          record(ak, 0, 1, 0, g.ascore, g.hscore);
        } else if (g.ascore > g.hscore) {
          record(hk, 0, 1, 0, g.hscore, g.ascore);
          record(ak, 1, 0, 0, g.ascore, g.hscore);
        } else {
          record(hk, 0, 0, 1, g.hscore, g.ascore);
          record(ak, 0, 0, 1, g.ascore, g.hscore);
        }
      }

      // Build standings
      const standings = Object.entries(teamStats)
        .map(([team, s]) => {
          const pts = s.wins * 4 + s.draws * 2;
          const pct = s.pa > 0 ? (s.pf / s.pa) * 100 : 0;
          const played = s.wins + s.losses + s.draws;
          return { team, wins: s.wins, losses: s.losses, draws: s.draws, played, pts, pct: Math.round(pct * 10) / 10 };
        })
        .sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.pct - a.pct);

      const trophy = standings[0]
        ? { winner: standings[0].team, wins: standings[0].wins, losses: standings[0].losses, draws: standings[0].draws, pts: standings[0].pts, pct: standings[0].pct }
        : null;

      seasons[year] = { trophy, standings, gamesPlayed: regular.length };
    } catch (err) {
      failedYears.push(year);
      process.stdout.write(` FAILED`);
    }
  }

  // All-time trophy winners leaderboard
  const trophyCount = {};
  for (const [, s] of Object.entries(seasons)) {
    if (s.trophy) {
      trophyCount[s.trophy.winner] = (trophyCount[s.trophy.winner] || 0) + 1;
    }
  }

  const output = {
    firstYear: FIRST_YEAR,
    lastYear: CURRENT_YEAR,
    generatedAt: new Date().toISOString(),
    failedYears,
    trophyCount,
    seasons,
  };

  const outPath = path.join(__dirname, '../../public/alltime_afl.json');
  writeFileSync(outPath, JSON.stringify(output));

  console.log(`\nDone.`);
  console.log(`  Seasons built   : ${Object.keys(seasons).length}`);
  console.log(`  Most AFL titles : ${Object.entries(trophyCount).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t,n])=>`${t}(${n})`).join(', ')}`);
  if (failedYears.length) console.log(`  Failed years    : ${failedYears.join(', ')}`);
  console.log(`\nWritten to alltime_afl.json`);
}

main().catch(err => {
  console.error('\nFatal:', err);
  process.exit(1);
});
