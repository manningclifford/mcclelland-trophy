/**
 * buildLinearTitle.js
 *
 * Fetches all VFL/AFL results from Squiggle (1897-present) and computes the
 * linear title — a "challenger" style title that changes hands whenever the
 * current holder is defeated.
 *
 * Usage: node server/scripts/buildLinearTitle.js
 * Output: linear_title.json in the project root
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SQUIGGLE_API = 'https://api.squiggle.com.au';
const USER_AGENT = 'TheSherrinSpreadsheets/LinearTitle (github.com/manning/mcclelland-trophy)';
const FIRST_YEAR = 1897;
const CURRENT_YEAR = new Date().getFullYear();

// Normalise team names across eras:
// - Footscray rebranded to Western Bulldogs in 1996
// - South Melbourne relocated to become Sydney Swans in 1982
// - Brisbane Bears merged with Fitzroy to form Brisbane Lions in 1997
//   (AFL officially treats Lions as continuation of Bears)
// - Kangaroos is a temporary rebrand of North Melbourne
// - Fitzroy is treated as a separate defunct club
// - University left the VFL in 1914
const TEAM_NAME_MAP = {
  'Adelaide Crows': 'adelaide', 'Adelaide': 'adelaide',
  'Brisbane Lions': 'brisbane', 'Brisbane': 'brisbane',
  'Brisbane Bears': 'brisbane',
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
  'Sydney Swans': 'sydney', 'Sydney': 'sydney',
  'South Melbourne': 'sydney',
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
  if (elapsed < 1100) {
    await new Promise(r => setTimeout(r, 1100 - elapsed));
  }
  lastRequestTime = Date.now();

  const url = `${SQUIGGLE_API}/?q=games;year=${year}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.games || [];
}

async function main() {
  console.log(`Fetching VFL/AFL results ${FIRST_YEAR}–${CURRENT_YEAR}...`);
  console.log('This takes ~2 minutes due to Squiggle rate limiting.\n');

  const allGames = [];
  const failedYears = [];

  for (let year = FIRST_YEAR; year <= CURRENT_YEAR; year++) {
    const n = year - FIRST_YEAR + 1;
    const total = CURRENT_YEAR - FIRST_YEAR + 1;
    process.stdout.write(`\r  ${year}  [${n}/${total}]   `);

    try {
      const games = await fetchGames(year);
      for (const g of games) {
        if (g.complete !== 100) continue;
        if (g.hscore == null || g.ascore == null) continue;
        allGames.push({
          id: g.id,
          season: year,
          round: g.round,
          roundName: g.roundname || `Round ${g.round}`,
          homeTeam: getTeamKey(g.hteam),
          awayTeam: getTeamKey(g.ateam),
          homeTeamName: g.hteam || '',
          awayTeamName: g.ateam || '',
          homeScore: g.hscore,
          awayScore: g.ascore,
          isFinal: g.is_final === 1,
          date: g.date || null,
        });
      }
    } catch (err) {
      failedYears.push(year);
      process.stdout.write(` FAILED`);
    }
  }

  console.log('\n\nSorting games...');
  allGames.sort((a, b) => {
    if (a.season !== b.season) return a.season - b.season;
    if (a.round !== b.round) return a.round - b.round;
    if (a.date && b.date && a.date !== b.date) return a.date.localeCompare(b.date);
    return a.id - b.id;
  });

  console.log(`Computing linear title across ${allGames.length} games...`);

  let holderKey = null;
  const events = [];          // every title change (including inaugural)
  const currentDefenses = {}; // defenses in current reign, per team

  for (const g of allGames) {
    let winnerKey = null;
    let loserKey = null;
    if (g.homeScore > g.awayScore) {
      winnerKey = g.homeTeam;
      loserKey = g.awayTeam;
    } else if (g.awayScore > g.homeScore) {
      winnerKey = g.awayTeam;
      loserKey = g.homeTeam;
    }
    // draw: both null — holder retains, no event

    if (holderKey === null) {
      if (winnerKey) {
        holderKey = winnerKey;
        currentDefenses[holderKey] = 0;
        events.push({
          season: g.season,
          round: g.round,
          roundName: g.roundName,
          homeTeam: g.homeTeam,
          awayTeam: g.awayTeam,
          homeTeamName: g.homeTeamName,
          awayTeamName: g.awayTeamName,
          homeScore: g.homeScore,
          awayScore: g.awayScore,
          isFinal: g.isFinal,
          date: g.date,
          type: 'inaugural',
          prevHolder: null,
          newHolder: holderKey,
          defensesBeforeLoss: 0,
        });
      }
      continue;
    }

    if (g.homeTeam === holderKey || g.awayTeam === holderKey) {
      if (loserKey === holderKey) {
        // Title changes hands
        const prev = holderKey;
        const defCount = currentDefenses[prev] || 0;
        holderKey = winnerKey;
        currentDefenses[holderKey] = 0;
        events.push({
          season: g.season,
          round: g.round,
          roundName: g.roundName,
          homeTeam: g.homeTeam,
          awayTeam: g.awayTeam,
          homeTeamName: g.homeTeamName,
          awayTeamName: g.awayTeamName,
          homeScore: g.homeScore,
          awayScore: g.awayScore,
          isFinal: g.isFinal,
          date: g.date,
          type: 'change',
          prevHolder: prev,
          newHolder: holderKey,
          defensesBeforeLoss: defCount,
        });
      } else if (winnerKey === holderKey) {
        currentDefenses[holderKey] = (currentDefenses[holderKey] || 0) + 1;
      }
    }
  }

  // All-time stats: reigns and longest single reign per team
  const teamStats = {};
  let longestReignHolder = null;
  let longestReignLength = 0;

  for (const e of events) {
    const t = e.newHolder;
    if (!teamStats[t]) teamStats[t] = { reigns: 0, longestReign: 0 };
    teamStats[t].reigns++;
    if (e.defensesBeforeLoss > teamStats[t].longestReign) {
      teamStats[t].longestReign = e.defensesBeforeLoss;
    }
    if (e.defensesBeforeLoss > longestReignLength) {
      longestReignLength = e.defensesBeforeLoss;
      longestReignHolder = t;
    }
  }
  // Include current holder's active reign
  if (holderKey) {
    if (!teamStats[holderKey]) teamStats[holderKey] = { reigns: 0, longestReign: 0 };
    const activeDef = currentDefenses[holderKey] || 0;
    if (activeDef > teamStats[holderKey].longestReign) {
      teamStats[holderKey].longestReign = activeDef;
    }
    if (activeDef > longestReignLength) {
      longestReignLength = activeDef;
      longestReignHolder = holderKey;
    }
  }

  const output = {
    currentHolder: holderKey,
    currentDefenses: currentDefenses[holderKey] || 0,
    totalChanges: events.filter(e => e.type === 'change').length,
    firstYear: FIRST_YEAR,
    lastYear: CURRENT_YEAR,
    generatedAt: new Date().toISOString(),
    failedYears,
    teamStats,
    events,
  };

  const outPath = path.join(__dirname, '../../public/linear_title.json');
  writeFileSync(outPath, JSON.stringify(output));

  console.log(`\nDone.`);
  console.log(`  Games processed : ${allGames.length}`);
  console.log(`  Title changes   : ${output.totalChanges}`);
  console.log(`  Current holder  : ${holderKey}`);
  console.log(`  Current defenses: ${output.currentDefenses}`);
  if (failedYears.length) console.log(`  Failed years    : ${failedYears.join(', ')}`);
  console.log(`\nWritten to linear_title.json`);
}

main().catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
