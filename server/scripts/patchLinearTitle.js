/**
 * patchLinearTitle.js
 *
 * Incrementally updates public/linear_title.json with the current season's
 * games only — rather than rebuilding from 1897.
 *
 * Double-count prevention:
 *   - Stores a `checkpoints` map (year → { holder, defenses }) in the JSON.
 *   - Each run strips events for PATCH_YEAR and restarts from
 *     checkpoints[PATCH_YEAR - 1], so re-running the same year is always safe.
 *   - On first patch run (no checkpoints yet), bootstraps from existing
 *     currentHolder / currentDefenses when PATCH_YEAR === lastYear + 1.
 *
 * Usage: node server/scripts/patchLinearTitle.js [year]
 *        year defaults to current year
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, '../../public/linear_title.json');
const SQUIGGLE_API = 'https://api.squiggle.com.au';
const UA = 'TheSherrinSpreadsheets/LinearTitlePatch (github.com/manning/mcclelland-trophy)';
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

async function fetchGames(year) {
  const res = await fetch(`${SQUIGGLE_API}/?q=games;year=${year}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Squiggle HTTP ${res.status} for ${year}`);
  const data = await res.json();
  return (data.games || [])
    .filter(g => g.complete === 100 && g.hscore != null && g.ascore != null)
    .map(g => ({
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
    }))
    .sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      if (a.date && b.date && a.date !== b.date) return a.date.localeCompare(b.date);
      return a.id - b.id;
    });
}

function recomputeTeamStats(events, currentHolder, currentDefenses) {
  const stats = {};
  for (const e of events) {
    const t = e.newHolder;
    if (!stats[t]) stats[t] = { reigns: 0, longestReignGames: 0, totalGamesHeld: 0 };
    stats[t].reigns++;
    stats[t].totalGamesHeld += (e.defensesBeforeLoss || 0) + 1;
    if ((e.defensesBeforeLoss || 0) > stats[t].longestReignGames) {
      stats[t].longestReignGames = e.defensesBeforeLoss;
    }
  }
  if (currentHolder) {
    if (!stats[currentHolder]) stats[currentHolder] = { reigns: 0, longestReignGames: 0, totalGamesHeld: 0 };
    stats[currentHolder].totalGamesHeld += currentDefenses;
    if (currentDefenses > stats[currentHolder].longestReignGames) {
      stats[currentHolder].longestReignGames = currentDefenses;
    }
  }
  return stats;
}

async function main() {
  console.log(`Patching linear title for ${PATCH_YEAR}...`);

  const existing = JSON.parse(readFileSync(OUT_PATH, 'utf-8'));
  const checkpoints = existing.checkpoints || {};

  // Strip events from PATCH_YEAR so re-runs are idempotent
  const priorEvents = existing.events.filter(e => e.season < PATCH_YEAR);

  // Determine checkpoint state at end of PATCH_YEAR - 1
  let holderKey, defenses;
  const prevCheckpoint = checkpoints[PATCH_YEAR - 1];

  if (prevCheckpoint) {
    // Best case: stored checkpoint from a previous patch run
    holderKey = prevCheckpoint.holder;
    defenses = prevCheckpoint.defenses;
    console.log(`  Using stored checkpoint for ${PATCH_YEAR - 1}: holder=${holderKey}, defenses=${defenses}`);
  } else if (PATCH_YEAR === existing.lastYear + 1) {
    // First patch run: existing file ends at lastYear, so currentHolder/Defenses are the right starting point
    holderKey = existing.currentHolder;
    defenses = existing.currentDefenses;
    // Save this as a checkpoint for future re-runs
    checkpoints[PATCH_YEAR - 1] = { holder: holderKey, defenses };
    console.log(`  Bootstrapped checkpoint for ${PATCH_YEAR - 1}: holder=${holderKey}, defenses=${defenses}`);
  } else {
    // Fallback: derive holder from last prior event (defenses will be 0 — less accurate but safe)
    const lastEvent = [...priorEvents].reverse().find(e => e.type === 'change' || e.type === 'inaugural');
    holderKey = lastEvent ? lastEvent.newHolder : existing.currentHolder;
    defenses = 0;
    console.warn(`  Warning: no checkpoint for ${PATCH_YEAR - 1} — defenses reset to 0. Consider running a full rebuild.`);
  }

  console.log(`  Fetching ${PATCH_YEAR} games from Squiggle...`);
  const games = await fetchGames(PATCH_YEAR);
  console.log(`  ${games.length} completed games found`);

  const newEvents = [];

  for (const g of games) {
    let winnerKey = null, loserKey = null;
    if (g.homeScore > g.awayScore) { winnerKey = g.homeTeam; loserKey = g.awayTeam; }
    else if (g.awayScore > g.homeScore) { winnerKey = g.awayTeam; loserKey = g.homeTeam; }

    if (g.homeTeam === holderKey || g.awayTeam === holderKey) {
      if (loserKey === holderKey) {
        newEvents.push({
          season: g.season, round: g.round, roundName: g.roundName,
          homeTeam: g.homeTeam, awayTeam: g.awayTeam,
          homeTeamName: g.homeTeamName, awayTeamName: g.awayTeamName,
          homeScore: g.homeScore, awayScore: g.awayScore,
          isFinal: g.isFinal, date: g.date,
          type: 'change', prevHolder: holderKey, newHolder: winnerKey,
          defensesBeforeLoss: defenses,
        });
        holderKey = winnerKey;
        defenses = 0;
      } else if (winnerKey === holderKey) {
        defenses++;
      }
    }
  }

  // Store checkpoint for this year so future re-runs are clean
  checkpoints[PATCH_YEAR] = { holder: holderKey, defenses };

  const allEvents = [...priorEvents, ...newEvents];
  const teamStats = recomputeTeamStats(allEvents, holderKey, defenses);

  const output = {
    ...existing,
    currentHolder: holderKey,
    currentDefenses: defenses,
    totalChanges: allEvents.filter(e => e.type === 'change').length,
    lastYear: PATCH_YEAR,
    generatedAt: new Date().toISOString(),
    checkpoints,
    teamStats,
    events: allEvents,
  };

  writeFileSync(OUT_PATH, JSON.stringify(output));
  console.log(`  New title changes this year: ${newEvents.length}`);
  console.log(`  Current holder: ${holderKey} (${defenses} defenses)`);
  console.log(`Done. Written to linear_title.json`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
