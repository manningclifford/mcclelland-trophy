/**
 * patchWormScores.js
 * Adds homeScore / awayScore to every entry in public/worm_cache.json
 * by fetching completed game results from the Squiggle API.
 *
 * Run from repo root: node server/scripts/patchWormScores.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, '../../public/worm_cache.json');
const SQUIGGLE = 'https://api.squiggle.com.au';
const UA = 'TheSherrinSpreadsheets/WormScorePatch';

const TEAM_KEY_MAP = {
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
  'Western Bulldogs': 'westernbulldogs', 'Footscray': 'westernbulldogs',
};

function teamKey(name) {
  return TEAM_KEY_MAP[name] || (name || '').toLowerCase().replace(/[^a-z]/g, '');
}

async function squiggleGames(year) {
  const res = await fetch(`${SQUIGGLE}/?q=games;year=${year}`, {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`Squiggle ${year}: ${res.status}`);
  const data = await res.json();
  return data.games || [];
}

const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));

// Find all distinct seasons
const seasons = [...new Set(cache.matches.map(m => m.season))].sort();
console.log(`Patching scores for ${cache.matches.length} matches across seasons: ${seasons.join(', ')}`);

let patched = 0;
let missing = 0;

for (const year of seasons) {
  process.stdout.write(`  ${year}... `);
  // Polite delay between requests
  await new Promise(r => setTimeout(r, 600));

  let games;
  try {
    games = await squiggleGames(year);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
    continue;
  }

  // Build a lookup: teamKey(hteam)+teamKey(ateam)+round → {hscore, ascore}
  const lookup = new Map();
  for (const g of games) {
    if (g.hscore == null || g.ascore == null) continue;
    const key = `${teamKey(g.hteam)}|${teamKey(g.ateam)}|${g.round}`;
    lookup.set(key, { homeScore: g.hscore, awayScore: g.ascore });
  }

  let yearPatched = 0;
  for (const m of cache.matches) {
    if (m.season !== year) continue;
    if (m.homeScore != null) continue; // already has score
    const key = `${teamKey(m.homeTeam)}|${teamKey(m.awayTeam)}|${m.round}`;
    const scores = lookup.get(key);
    if (scores) {
      m.homeScore = scores.homeScore;
      m.awayScore = scores.awayScore;
      yearPatched++;
      patched++;
    } else {
      missing++;
    }
  }
  console.log(`${yearPatched} patched`);
}

cache.generatedAt = new Date().toISOString();
writeFileSync(CACHE_PATH, JSON.stringify(cache));
console.log(`\nDone. ${patched} matches patched, ${missing} unmatched. Saved to worm_cache.json.`);
