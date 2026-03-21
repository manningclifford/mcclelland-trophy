/**
 * buildStyleTaxonomy.js
 *
 * Builds a team style taxonomy from:
 *   - AFL Tables season stats (kicks, handballs, inside 50s, etc.)
 *   - Squiggle game results + model tips (margins, over/underperformance)
 *
 * Usage: node server/scripts/buildStyleTaxonomy.js [year]
 * Output: public/style_taxonomy.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQUIGGLE = 'https://api.squiggle.com.au';
const AFL_TABLES = 'https://afltables.com/afl/stats';
const UA = 'SherrinSpreadsheets/StyleTaxonomy (github.com/manning/mcclelland-trophy)';
const YEAR = parseInt(process.argv[2] || '2025', 10);

// ─── Team name normalisation ───────────────────────────────────────────────

const NAME_MAP = {
  'Adelaide': 'adelaide',
  'Brisbane Lions': 'brisbane',
  'Carlton': 'carlton',
  'Collingwood': 'collingwood',
  'Essendon': 'essendon',
  'Fremantle': 'fremantle',
  'Geelong': 'geelong',
  'Gold Coast': 'goldcoast',
  'Greater Western Sydney': 'gws',
  'GWS': 'gws',
  'Hawthorn': 'hawthorn',
  'Melbourne': 'melbourne',
  'North Melbourne': 'northmelbourne',
  'Kangaroos': 'northmelbourne',
  'Port Adelaide': 'portadelaide',
  'Richmond': 'richmond',
  'St Kilda': 'stkilda',
  'Sydney': 'sydney',
  'Sydney Swans': 'sydney',
  'West Coast': 'westcoast',
  'Western Bulldogs': 'westernbulldogs',
};

function teamKey(name) {
  return NAME_MAP[name?.trim()] || name?.trim().toLowerCase().replace(/\s+/g, '');
}

// ─── AFL Tables scraper ────────────────────────────────────────────────────

const COLS = ['KI','MK','HB','DI','GL','BH','HO','TK','RB','IF','CL','CG','FF','BR','CP','UP','CM','MI','ONE_PCT','BO','GA'];

function parseStatsTable(html, sectionLabel) {
  // Find the table that follows a header containing sectionLabel
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/g)].map(m => m[0]);

  for (const table of tables) {
    if (!table.includes(sectionLabel)) continue;

    const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(m => m[0]);
    const result = {};

    for (const row of rows) {
      const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)]
        .map(m => m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim());

      if (cells.length < 5) continue;
      const name = cells[0];
      const key = teamKey(name);
      if (!key || cells[1] === 'KI' || name === 'Totals') continue;

      const stats = {};
      COLS.forEach((col, i) => {
        stats[col] = parseInt(cells[i + 1]?.replace(/,/g, ''), 10) || 0;
      });
      result[key] = { name, stats };
    }

    if (Object.keys(result).length >= 10) return result;
  }
  return {};
}

async function fetchAFLTableStats(year) {
  console.log(`  Fetching AFL Tables ${year}...`);
  const res = await fetch(`${AFL_TABLES}/${year}s.html`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`AFL Tables ${res.status}`);
  const html = await res.text();

  const forStats = parseStatsTable(html, 'Team Totals For');
  const agaStats = parseStatsTable(html, 'Team Totals Against');

  console.log(`    For: ${Object.keys(forStats).length} teams, Against: ${Object.keys(agaStats).length} teams`);
  return { forStats, agaStats };
}

// ─── Squiggle ──────────────────────────────────────────────────────────────

async function squiggle(q) {
  const res = await fetch(`${SQUIGGLE}/?q=${q}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Squiggle ${res.status}`);
  return res.json();
}

async function fetchSquiggleData(year) {
  console.log(`  Fetching Squiggle games ${year}...`);
  const [gamesData, tipsData, powerData] = await Promise.all([
    squiggle(`games;year=${year};complete=100`),
    squiggle(`tips;year=${year};source=1`),  // source 1 = Squiggle composite
    squiggle(`power;year=${year}`),
  ]);

  const games = gamesData.games || [];
  const tips = tipsData.tips || [];
  const power = powerData.power || [];

  // Per-team: games played, avg margin, margin std dev, over/underperformance vs tips
  const teamGames = {};

  for (const g of games) {
    const homeKey = teamKey(g.hteam);
    const awayKey = teamKey(g.ateam);
    if (!homeKey || !awayKey) continue;

    const margin = (g.hscore || 0) - (g.ascore || 0);

    // Find matching tip
    const tip = tips.find(t => t.gameid === g.id);
    const expectedHomeMargin = tip ? (tip.hmargin || 0) : 0;
    const homeOverPerf = margin - expectedHomeMargin;
    const awayOverPerf = -margin - (-expectedHomeMargin);

    for (const [key, actual, overPerf] of [
      [homeKey, margin, homeOverPerf],
      [awayKey, -margin, awayOverPerf],
    ]) {
      if (!teamGames[key]) teamGames[key] = { margins: [], overPerfs: [], games: 0 };
      teamGames[key].margins.push(actual);
      teamGames[key].overPerfs.push(overPerf);
      teamGames[key].games++;
    }
  }

  // Latest power rating per team
  const latestPower = {};
  for (const p of power) {
    const k = teamKey(p.team);
    if (!latestPower[k] || p.round > latestPower[k].round) {
      latestPower[k] = { rating: p.power, round: p.round };
    }
  }

  const teamStats = {};
  for (const [key, d] of Object.entries(teamGames)) {
    const n = d.margins.length;
    const avgMargin = d.margins.reduce((a, b) => a + b, 0) / n;
    const marginVar = d.margins.reduce((a, b) => a + (b - avgMargin) ** 2, 0) / n;
    const marginStdDev = Math.sqrt(marginVar);
    const avgOverPerf = d.overPerfs.reduce((a, b) => a + b, 0) / n;
    const wins = d.margins.filter(m => m > 0).length;
    const closeGames = d.margins.filter(m => Math.abs(m) <= 24).length;

    teamStats[key] = {
      games: n,
      avgMargin: Math.round(avgMargin * 10) / 10,
      marginStdDev: Math.round(marginStdDev * 10) / 10,
      avgOverPerf: Math.round(avgOverPerf * 10) / 10,
      winRate: Math.round(wins / n * 100),
      closeGameRate: Math.round(closeGames / n * 100),
      powerRating: latestPower[key]?.rating || null,
    };
  }

  return teamStats;
}

// ─── Style dimension calculation ───────────────────────────────────────────

function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
function std(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
}
function zScore(val, m, s) { return s > 0 ? (val - m) / s : 0; }
function clamp(val, min = -1, max = 1) { return Math.max(min, Math.min(max, val)); }
function normalise(z) { return clamp(z / 2); } // map ±2σ → ±1

function computeDimensions(forStats, agaStats, games) {
  const f = forStats;
  const a = agaStats;
  const g = games || 1;

  // Per-game rates
  const kicksPerGame     = f.KI / g;
  const handballsPerGame = f.HB / g;
  const marksPerGame     = f.MK / g;
  const if50PerGame      = f.IF / g;
  const clPerGame        = f.CL / g;
  const tkPerGame        = f.TK / g;
  const hoPerGame        = f.HO / g;
  const onePctPerGame    = f.ONE_PCT / g;
  const cpPerGame        = f.CP / g;
  const upPerGame        = f.UP / g;
  const cmPerGame        = f.CM / g;
  const miPerGame        = f.MI / g;

  // Key ratios
  const kickRatio    = f.KI / (f.KI + f.HB + 1);       // directness
  const contestRatio = f.CP / (f.CP + f.UP + 1);        // contest reliance
  const conversion   = f.GL / (f.IF + 1);               // goal conversion rate
  const oppConvAllow = a.GL / (a.IF + 1);               // how well they restrict conversion

  return {
    kickRatio,
    contestRatio,
    conversion,
    oppConvAllow,
    kicksPerGame,
    handballsPerGame,
    marksPerGame,
    if50PerGame,
    clPerGame,
    tkPerGame,
    hoPerGame,
    onePctPerGame,
    cpPerGame,
    upPerGame,
    cmPerGame,
    miPerGame,
  };
}

function assignArchetype(d, zs) {
  // Each dimension z-score: directness, contest, pressure, stoppage, aerial
  const direct  = zs.directness;
  const contest = zs.contest;
  const pressure = zs.pressure;
  const stoppage = zs.stoppage;

  // Priority overrides
  if (pressure > 1.0) return { archetype: 'Territory Pressure', key: 'pressure' };
  if (stoppage > 1.0) return { archetype: 'Stoppage Machine', key: 'stoppage' };

  // Primary quadrant (directness x contest)
  if (direct > 0.3 && contest > 0.3)  return { archetype: 'Territory Control',    key: 'territory' };
  if (direct > 0.3 && contest <= 0.3) return { archetype: 'Slingshot Corridor',   key: 'slingshot' };
  if (direct <= 0.3 && contest > 0.3) return { archetype: 'Handball Swarm',       key: 'swarm' };
  return { archetype: 'Run & Carry', key: 'run_carry' };
}

const ARCHETYPE_DESCRIPTIONS = {
  territory:   'Wins the ball in contest and advances it by foot. Values possession and field position above all.',
  slingshot:   'Quick, direct ball movement — rebound out of defence and release up the field fast.',
  swarm:       'Handball-heavy, hard at the ball. Wins through relentless contest and short passing chains.',
  run_carry:   'Attacks space with handball and running. Generates speed and overlaps rather than structure.',
  pressure:    'Smothers the opposition through relentless tackling and one-percenters. Makes the game ugly.',
  stoppage:    'Dominates clearances and centre bounces. Controls the game from the ground up.',
};

const ARCHETYPE_STRENGTHS = {
  territory:   'Structured and reliable. Hard to score against quickly.',
  slingshot:   'Damaging in open play and when the opposition is retreating.',
  swarm:       'Exhausting to play against. Wins games through attrition.',
  run_carry:   'Creates scoring chains from nothing. Dangerous in transition.',
  pressure:    'Negates the opposition\'s best players through heat and pressure.',
  stoppage:    'Dictates terms from the start. Rarely gets outrun in clearances.',
};

const ARCHETYPE_STRUGGLES = {
  territory:   'Can be bypassed by fast transition teams.',
  slingshot:   'Exposed when game slows down or opponent wins the contest.',
  swarm:       'Less dangerous when the opposition spreads and creates space.',
  run_carry:   'Vulnerable to teams that win hard ball gets and slow the game.',
  pressure:    'Struggles to score in low-pressure environments.',
  stoppage:    'Can be hurt by quick transition and intercept play.',
};

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nBuilding style taxonomy for ${YEAR}...\n`);

  const [{ forStats, agaStats }, squiggleStats] = await Promise.all([
    fetchAFLTableStats(YEAR),
    fetchSquiggleData(YEAR),
  ]);

  const teams = Object.keys(forStats);
  if (teams.length === 0) throw new Error('No team data parsed from AFL Tables');

  // Step 1: compute raw dimensions for each team
  const rawDims = {};
  for (const key of teams) {
    const games = squiggleStats[key]?.games || 22;
    rawDims[key] = computeDimensions(forStats[key].stats, agaStats[key]?.stats || forStats[key].stats, games);
  }

  // Step 2: z-score each dimension across all teams
  function zScoreAll(getter) {
    const vals = teams.map(k => getter(rawDims[k]));
    const m = mean(vals);
    const s = std(vals);
    return { m, s, zFor: key => zScore(getter(rawDims[key]), m, s) };
  }

  const zDirectness = zScoreAll(d => d.kickRatio);
  const zContest    = zScoreAll(d => d.contestRatio);
  const zPressure   = zScoreAll(d => (d.tkPerGame + d.onePctPerGame) / 2);
  const zStoppage   = zScoreAll(d => (d.clPerGame + d.hoPerGame) / 2);
  const zAerial     = zScoreAll(d => (d.marksPerGame + d.cmPerGame) / 2);
  const zEfficiency = zScoreAll(d => d.conversion);

  // Step 3: assemble final team objects
  const teamData = [];
  for (const key of teams) {
    const d = rawDims[key];
    const sq = squiggleStats[key] || {};

    const zs = {
      directness: zDirectness.zFor(key),
      contest:    zContest.zFor(key),
      pressure:   zPressure.zFor(key),
      stoppage:   zStoppage.zFor(key),
      aerial:     zAerial.zFor(key),
      efficiency: zEfficiency.zFor(key),
    };

    const { archetype, key: archetypeKey } = assignArchetype(d, zs);

    teamData.push({
      key,
      name: forStats[key].name,
      games: sq.games || 22,

      // Core per-game rates (for display)
      perGame: {
        kicks:          Math.round(d.kicksPerGame * 10) / 10,
        handballs:      Math.round(d.handballsPerGame * 10) / 10,
        marks:          Math.round(d.marksPerGame * 10) / 10,
        inside50s:      Math.round(d.if50PerGame * 10) / 10,
        clearances:     Math.round(d.clPerGame * 10) / 10,
        tackles:        Math.round(d.tkPerGame * 10) / 10,
        hitouts:        Math.round(d.hoPerGame * 10) / 10,
        onePercenters:  Math.round(d.onePctPerGame * 10) / 10,
        contestedPoss:  Math.round(d.cpPerGame * 10) / 10,
        uncontestedPoss:Math.round(d.upPerGame * 10) / 10,
        contestedMarks: Math.round(d.cmPerGame * 10) / 10,
        marksInside50:  Math.round(d.miPerGame * 10) / 10,
      },

      // Key ratios
      ratios: {
        kickRatio:    Math.round(d.kickRatio * 1000) / 1000,
        contestRatio: Math.round(d.contestRatio * 1000) / 1000,
        conversion:   Math.round(d.conversion * 1000) / 1000,
      },

      // Style dimensions — normalised -1 to +1
      dimensions: {
        directness: Math.round(normalise(zs.directness) * 100) / 100,
        contest:    Math.round(normalise(zs.contest) * 100) / 100,
        pressure:   Math.round(normalise(zs.pressure) * 100) / 100,
        stoppage:   Math.round(normalise(zs.stoppage) * 100) / 100,
        aerial:     Math.round(normalise(zs.aerial) * 100) / 100,
        efficiency: Math.round(normalise(zs.efficiency) * 100) / 100,
      },

      // Raw z-scores (for internal sorting/comparison)
      zScores: Object.fromEntries(
        Object.entries(zs).map(([k, v]) => [k, Math.round(v * 100) / 100])
      ),

      archetype,
      archetypeKey,
      archetypeDescription: ARCHETYPE_DESCRIPTIONS[archetypeKey],
      bestWhen: ARCHETYPE_STRENGTHS[archetypeKey],
      strugglesWhen: ARCHETYPE_STRUGGLES[archetypeKey],

      // Squiggle performance data
      performance: {
        avgMargin:     sq.avgMargin ?? null,
        marginStdDev:  sq.marginStdDev ?? null,
        avgOverPerf:   sq.avgOverPerf ?? null,
        winRate:       sq.winRate ?? null,
        closeGameRate: sq.closeGameRate ?? null,
        powerRating:   sq.powerRating ?? null,
      },
    });
  }

  // Sort by directness for consistent display
  teamData.sort((a, b) => b.dimensions.directness - a.dimensions.directness);

  const output = {
    year: YEAR,
    generatedAt: new Date().toISOString(),
    teams: teamData,
  };

  const outPath = path.join(__dirname, '../../public/style_taxonomy.json');
  writeFileSync(outPath, JSON.stringify(output));

  console.log(`\nDone.`);
  console.log(`  Teams: ${teamData.length}`);
  console.log(`  Archetypes:`);
  const byArchetype = {};
  for (const t of teamData) {
    if (!byArchetype[t.archetype]) byArchetype[t.archetype] = [];
    byArchetype[t.archetype].push(t.name);
  }
  for (const [arch, names] of Object.entries(byArchetype)) {
    console.log(`    ${arch}: ${names.join(', ')}`);
  }
  console.log(`\nWritten to public/style_taxonomy.json`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
