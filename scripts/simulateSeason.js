/**
 * simulateSeason.js  —  P3: overnight Monte Carlo season simulator
 *
 * Simulates the remainder of the current AFL home-and-away season N times and
 * publishes per-team probabilities to public/predictions.json:
 *   - mcClelland          P(finish 1st = minor premier / McClelland Trophy)
 *   - minorPremiership    (identical to mcClelland — the McClelland Trophy IS the
 *                          minor premiership under the current AFL format; kept as a
 *                          separate key for clarity on the site)
 *   - top4                P(finish top 4 — double chance)
 *   - top8                P(finish top 8 — play finals)
 *   - holdsBeltAtEnd      P(holds the Brunswick St Belt at the end of the H&A season)
 *
 * MODEL (deliberately simple, fully data-driven, no external ML):
 *   expected_home_margin = k * (power_home - power_away) + HGA
 *   simulated_margin     = expected_home_margin + Normal(0, residualSD)
 *   k, HGA (intercept) and residualSD are CALIBRATED by least-squares on THIS
 *   season's completed games (actual home margin vs Squiggle power-rating diff).
 *   If too few games have been played, sensible AFL defaults are used
 *   (k=1, HGA=+10 pts, SD=36 pts — the long-run AFL margin standard deviation).
 *
 * INPUTS (all already used elsewhere in the repo):
 *   - Squiggle `q=games;year=`  — fixture + completed results (drives current ladder,
 *                                 calibration, and the remaining schedule)
 *   - Squiggle `q=power;year=`  — team power ratings (latest round per team)
 *   - public/alltime_afl.json   — all-time context (leader label in output metadata)
 *   - public/linear_title.json  — current Brunswick St Belt holder (for the belt sim)
 *
 * The belt is simulated by walking the remaining games in chronological order and
 * passing the title whenever the current holder loses. Finals are not simulated
 * (fixture is TBD mid-season), so the belt probability is "at end of home-and-away".
 *
 * Run:  node scripts/simulateSeason.js
 *       SIM_N=100000 node scripts/simulateSeason.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');
const SQUIGGLE = 'https://api.squiggle.com.au';
const UA = 'SherrinSpreadsheets/simulateSeason (github.com/manningclifford/mcclelland-trophy)';
const YEAR = parseInt(process.argv[2] || String(new Date().getFullYear()), 10);
const N = parseInt(process.env.SIM_N || '50000', 10);

// Fallback model constants when calibration data is thin.
const DEFAULT_K = 1.0;
const DEFAULT_HGA = 10.0;
const DEFAULT_SD = 36.0;
const MIN_CALIBRATION_GAMES = 20;

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

let lastReq = 0;
async function politeFetch(url) {
  const gap = Date.now() - lastReq;
  if (gap < 1000) await new Promise((r) => setTimeout(r, 1000 - gap));
  lastReq = Date.now();
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// Standard normal via Box-Muller (with a cached spare for speed).
let spare = null;
function gauss() {
  if (spare !== null) { const v = spare; spare = null; return v; }
  let u, v, s;
  do { u = Math.random() * 2 - 1; v = Math.random() * 2 - 1; s = u * u + v * v; } while (s === 0 || s >= 1);
  const m = Math.sqrt((-2 * Math.log(s)) / s);
  spare = v * m;
  return u * m;
}

function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

async function main() {
  console.log(`simulateSeason: ${YEAR}, N=${N.toLocaleString()} simulations`);

  // 1. Fetch fixture + power ratings.
  const [gamesData, powerData] = await Promise.all([
    politeFetch(`${SQUIGGLE}/?q=games;year=${YEAR}`),
    politeFetch(`${SQUIGGLE}/?q=power;year=${YEAR}`),
  ]);
  const allGames = (gamesData.games || []).filter((g) => g.hteam && g.ateam && g.is_final === 0);
  const completed = allGames.filter((g) => g.complete === 100 && g.hscore != null && g.ascore != null);
  const remaining = allGames
    .filter((g) => g.complete < 100)
    .sort((a, b) => (a.unixtime || 0) - (b.unixtime || 0)); // chronological — needed for the belt

  // Latest power rating per team.
  const powerRows = powerData.power || [];
  const latestPower = {};
  for (const p of powerRows) {
    const k = teamKey(p.team);
    const val = typeof p.power === 'string' ? parseFloat(p.power) : p.power;
    if (!latestPower[k] || p.round > latestPower[k].round) latestPower[k] = { rating: val, round: p.round };
  }

  // Universe of teams from the fixture.
  const teams = [...new Set(allGames.flatMap((g) => [teamKey(g.hteam), teamKey(g.ateam)]))].sort();
  const powerVals = teams.map((t) => latestPower[t]?.rating).filter((v) => v != null);
  const meanPower = powerVals.length ? powerVals.reduce((a, b) => a + b, 0) / powerVals.length : 0;
  const power = (t) => latestPower[t]?.rating ?? meanPower;

  // 2. Current ladder from completed games.
  const base = {};
  for (const t of teams) base[t] = { played: 0, points: 0, marginFor: 0 };
  for (const g of completed) {
    const h = teamKey(g.hteam), a = teamKey(g.ateam);
    const m = g.hscore - g.ascore;
    base[h].played++; base[a].played++;
    base[h].marginFor += m; base[a].marginFor -= m;
    if (m > 0) base[h].points += 4; else if (m < 0) base[a].points += 4; else { base[h].points += 2; base[a].points += 2; }
  }

  // 3. Calibrate margin model on completed games.
  let k = DEFAULT_K, hga = DEFAULT_HGA, sd = DEFAULT_SD, calN = 0;
  {
    const xs = [], ys = [];
    for (const g of completed) {
      const ph = power(teamKey(g.hteam)), pa = power(teamKey(g.ateam));
      if (ph == null || pa == null) continue;
      xs.push(ph - pa);
      ys.push(g.hscore - g.ascore);
    }
    calN = xs.length;
    if (calN >= MIN_CALIBRATION_GAMES) {
      const n = calN;
      const sx = xs.reduce((a, b) => a + b, 0);
      const sy = ys.reduce((a, b) => a + b, 0);
      const sxx = xs.reduce((a, b) => a + b * b, 0);
      const sxy = xs.reduce((a, b, i) => a + b * ys[i], 0);
      const denom = n * sxx - sx * sx;
      if (denom !== 0) {
        const slope = (n * sxy - sx * sy) / denom;
        const intercept = (sy - slope * sx) / n;
        let ss = 0;
        for (let i = 0; i < n; i++) { const e = ys[i] - (slope * xs[i] + intercept); ss += e * e; }
        const resSD = Math.sqrt(ss / Math.max(1, n - 2));
        k = clamp(slope, 0.3, 3.0);
        hga = clamp(intercept, -20, 40);
        sd = clamp(resSD, 20, 55);
      }
    }
  }
  console.log(
    `  completed=${completed.length} remaining=${remaining.length} | ` +
    `model: margin = ${k.toFixed(2)}*Δpower + ${hga.toFixed(1)} + N(0,${sd.toFixed(1)}) ` +
    `(calibrated on ${calN} games${calN >= MIN_CALIBRATION_GAMES ? '' : ' — using defaults'})`
  );

  // 4. Current Brunswick St Belt holder.
  let startHolder = null;
  const ltPath = path.join(PUBLIC, 'linear_title.json');
  if (existsSync(ltPath)) startHolder = JSON.parse(readFileSync(ltPath, 'utf-8')).currentHolder || null;

  // Precompute remaining games as compact arrays for the hot loop.
  const rem = remaining.map((g) => {
    const h = teamKey(g.hteam), a = teamKey(g.ateam);
    return { h, a, exp: k * (power(h) - power(a)) + hga };
  });

  // Tally arrays indexed by team position.
  const idx = Object.fromEntries(teams.map((t, i) => [t, i]));
  const T = teams.length;
  const cntRank1 = new Array(T).fill(0);
  const cntTop4 = new Array(T).fill(0);
  const cntTop8 = new Array(T).fill(0);
  const cntBelt = new Array(T).fill(0);

  const basePts = teams.map((t) => base[t].points);
  const baseMgn = teams.map((t) => base[t].marginFor);

  // Reusable per-sim standings for ranking.
  const order = teams.map((_, i) => i);

  const t0 = Date.now();
  for (let s = 0; s < N; s++) {
    const pts = basePts.slice();
    const mgn = baseMgn.slice();
    let holder = startHolder;

    for (let r = 0; r < rem.length; r++) {
      const g = rem[r];
      const margin = g.exp + gauss() * sd;
      const hi = idx[g.h], ai = idx[g.a];
      mgn[hi] += margin; mgn[ai] -= margin;
      if (margin > 0) { pts[hi] += 4; }
      else if (margin < 0) { pts[ai] += 4; }
      else { pts[hi] += 2; pts[ai] += 2; }

      // Belt passes if the holder plays and loses.
      if (holder && (g.h === holder || g.a === holder)) {
        if (margin > 0 && g.a === holder) holder = g.h;
        else if (margin < 0 && g.h === holder) holder = g.a;
      }
    }

    // Rank: points desc, then aggregate margin desc (percentage proxy).
    order.sort((x, y) => (pts[y] - pts[x]) || (mgn[y] - mgn[x]));
    cntRank1[order[0]]++;
    for (let p = 0; p < T; p++) {
      const ti = order[p];
      if (p < 4) cntTop4[ti]++;
      if (p < 8) cntTop8[ti]++;
    }
    if (holder && idx[holder] != null) cntBelt[idx[holder]]++;
  }
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  // 5. Assemble output.
  const currentRankOrder = teams
    .map((t) => ({ t, points: base[t].points, mgn: base[t].marginFor }))
    .sort((a, b) => (b.points - a.points) || (b.mgn - a.mgn))
    .map((x) => x.t);
  const currentRank = Object.fromEntries(currentRankOrder.map((t, i) => [t, i + 1]));

  const out = teams
    .map((t) => ({
      team: t,
      powerRating: latestPower[t]?.rating ?? null,
      currentRank: currentRank[t],
      currentPoints: base[t].points,
      played: base[t].played,
      mcClelland: cntRank1[idx[t]] / N,
      minorPremiership: cntRank1[idx[t]] / N,
      top4: cntTop4[idx[t]] / N,
      top8: cntTop8[idx[t]] / N,
      holdsBeltAtEnd: cntBelt[idx[t]] / N,
    }))
    .sort((a, b) => b.mcClelland - a.mcClelland || b.top4 - a.top4);

  // All-time context (leader label) — honours the alltime_afl.json input.
  let alltimeLeader = null;
  const atPath = path.join(PUBLIC, 'alltime_afl.json');
  if (existsSync(atPath)) {
    const at = JSON.parse(readFileSync(atPath, 'utf-8'));
    const tc = at.trophyCount || {};
    const top = Object.entries(tc).sort((a, b) => b[1] - a[1])[0];
    if (top) alltimeLeader = { team: top[0], titles: top[1] };
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    year: YEAR,
    simulations: N,
    runtimeSeconds: Number(elapsed),
    model: {
      description: 'margin = k*(powerHome - powerAway) + HGA + Normal(0, residualSD)',
      k: Number(k.toFixed(3)),
      homeGroundAdvantage: Number(hga.toFixed(2)),
      residualSD: Number(sd.toFixed(2)),
      calibrationGames: calN,
      calibrated: calN >= MIN_CALIBRATION_GAMES,
      note: 'Belt probability is at the end of the home-and-away season (finals not simulated).',
    },
    completedGames: completed.length,
    remainingGames: remaining.length,
    currentHolder: startHolder,
    alltimeLeader,
    teams: out,
  };

  writeFileSync(path.join(PUBLIC, 'predictions.json'), JSON.stringify(payload));
  console.log(`  ${N.toLocaleString()} sims in ${elapsed}s`);
  const top3 = out.slice(0, 3).map((t) => `${t.team} ${(t.mcClelland * 100).toFixed(1)}%`).join(', ');
  console.log(`  McClelland favourites: ${top3 || '(none — no fixture)'}`);
  console.log('  Written to public/predictions.json');
}

main().catch((e) => {
  console.error('simulateSeason FATAL:', e.message);
  process.exit(1);
});
