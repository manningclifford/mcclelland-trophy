import React, { useState, useMemo } from 'react';
import { historicalData, calculateLegacyPoints, calculateCombinedPercentage } from '../data/historical';
import { extendedAflData } from '../data/aflHistory';
import { getTeamInfo } from '../data/teams';
import TeamLogo from './TeamLogo';

// Merge historical (2017+) with extended AFL data (1997-2016)
const allData = { ...extendedAflData, ...historicalData };

const MODES = [
  { key: 'afl', label: 'AFL', gradient: 'from-blue-700 to-blue-900', accent: 'blue' },
  { key: 'aflw', label: 'AFLW', gradient: 'from-pink-600 to-pink-800', accent: 'pink' },
  { key: 'mcclelland', label: 'Combined', gradient: 'from-emerald-700 to-green-600', accent: 'emerald' },
];

function computePoints(team, mode) {
  if (mode === 'afl') return (team.aflWins * 4) + (team.aflDraws * 2);
  if (mode === 'aflw') return (team.aflwWins * 4) + (team.aflwDraws * 2);
  return calculateLegacyPoints(team);
}

function computePct(team, mode) {
  if (mode === 'afl') return team.aflPct;
  if (mode === 'aflw') return team.aflwPct;
  return calculateCombinedPercentage(team);
}

function analyseSeasons(mode) {
  // AFL/AFLW use the full dataset; McClelland only uses 2017+ (when AFLW existed)
  const source = mode === 'mcclelland' ? historicalData : allData;
  const years = Object.keys(source).map(Number).sort();

  return years.map(year => {
    const data = source[year];

    // Filter out teams with no games in this comp
    let eligible = data.standings;
    if (mode === 'aflw') {
      eligible = eligible.filter(t => (t.aflwWins + t.aflwLosses + t.aflwDraws) > 0);
    }
    if (mode === 'afl') {
      eligible = eligible.filter(t => (t.aflWins + t.aflLosses + t.aflDraws) > 0);
    }

    const standings = eligible
      .map(t => ({
        ...t,
        pts: computePoints(t, mode),
        pct: computePct(t, mode),
      }))
      .sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.pct - a.pct);

    const points = standings.map(s => s.pts);
    if (points.length < 2) return null;

    const maxPts = points[0];
    const minPts = points[points.length - 1];
    const secondPts = points[1];
    const spread = maxPts - minPts;
    const marginAtTop = maxPts - secondPts;

    const mean = points.reduce((a, b) => a + b, 0) / points.length;
    const variance = points.reduce((sum, p) => sum + (p - mean) ** 2, 0) / points.length;
    const stdDev = Math.sqrt(variance);

    const threshold = maxPts * 0.8;
    const teamsInContention = points.filter(p => p >= threshold).length;

    const n = points.length;
    const sortedPts = [...points].sort((a, b) => a - b);
    let giniSum = 0;
    const totalPts = points.reduce((a, b) => a + b, 0);
    if (totalPts > 0) {
      for (let i = 0; i < n; i++) {
        giniSum += (2 * (i + 1) - n - 1) * sortedPts[i];
      }
    }
    const gini = totalPts > 0 ? giniSum / (n * totalPts) : 0;

    const closenessScore = (stdDev * 0.4) + (marginAtTop * 2) + (gini * 100);

    // Leader of this specific comp
    const leader = standings[0];
    const leaderInfo = leader ? getTeamInfo(leader.team) : null;

    // For McClelland mode, use the official winner
    let winner, winnerKey, isOfficial;
    if (mode === 'mcclelland') {
      winner = data.winner || data.hypotheticalWinner;
      winnerKey = winner?.toLowerCase().replace(/\s+/g, '');
      isOfficial = !!data.winner;
    } else {
      winner = leaderInfo?.name || null;
      winnerKey = leader?.team || null;
      isOfficial = false; // We're showing minor premiers, not actual premiers
    }

    return {
      year,
      standings,
      maxPts,
      minPts,
      secondPts,
      spread,
      marginAtTop,
      stdDev,
      mean,
      teamsInContention,
      gini,
      closenessScore,
      winner,
      winnerKey,
      isOfficial,
      numTeams: standings.length,
      leaderPts: maxPts,
      runnerUpPts: secondPts,
    };
  }).filter(Boolean);
}

export default function LadderCloseness() {
  const [mode, setMode] = useState('afl');
  const [sortBy, setSortBy] = useState('closeness');

  const seasons = useMemo(() => analyseSeasons(mode), [mode]);

  const sorted = useMemo(() => {
    return [...seasons].sort((a, b) => {
      if (sortBy === 'closeness') return a.closenessScore - b.closenessScore;
      if (sortBy === 'year') return a.year - b.year;
      if (sortBy === 'margin') return a.marginAtTop - b.marginAtTop;
      if (sortBy === 'spread') return a.spread - b.spread;
      return 0;
    });
  }, [seasons, sortBy]);

  const currentMode = MODES.find(m => m.key === mode);
  const closestSeason = sorted[0];
  const mostLopsided = sorted[sorted.length - 1];

  const modeLabels = {
    afl: { comp: 'AFL', leader: 'Minor Premier', subtext: 'Which AFL home-and-away seasons were the tightest?' },
    aflw: { comp: 'AFLW', leader: 'Minor Premier', subtext: 'Which AFLW seasons were the most competitive?' },
    mcclelland: { comp: 'Combined (AFL + AFLW)', leader: 'Leader', subtext: 'Which seasons had the tightest combined AFL + AFLW ladder?' },
  };
  const labels = modeLabels[mode];

  const accentClasses = {
    blue: {
      tabActive: 'bg-blue-600 text-white',
      sortActive: 'bg-blue-600 text-white',
      rankTop: 'bg-blue-600 text-white',
      hoverRow: 'hover:bg-blue-50/50',
      bar: 'bg-blue-500',
      barBg: 'from-blue-200 to-blue-400',
      barLeader: 'bg-blue-700',
      gapGood: 'bg-blue-100 text-blue-700',
      pillGood: 'bg-blue-100 text-blue-800',
      pillOk: 'bg-sky-100 text-sky-800',
    },
    pink: {
      tabActive: 'bg-pink-600 text-white',
      sortActive: 'bg-pink-600 text-white',
      rankTop: 'bg-pink-600 text-white',
      hoverRow: 'hover:bg-pink-50/50',
      bar: 'bg-pink-500',
      barBg: 'from-pink-200 to-pink-400',
      barLeader: 'bg-pink-700',
      gapGood: 'bg-pink-100 text-pink-700',
      pillGood: 'bg-pink-100 text-pink-800',
      pillOk: 'bg-rose-100 text-rose-800',
    },
    emerald: {
      tabActive: 'bg-emerald-600 text-white',
      sortActive: 'bg-emerald-600 text-white',
      rankTop: 'bg-emerald-600 text-white',
      hoverRow: 'hover:bg-emerald-50/50',
      bar: 'bg-emerald-500',
      barBg: 'from-emerald-200 to-emerald-400',
      barLeader: 'bg-emerald-700',
      gapGood: 'bg-emerald-100 text-emerald-700',
      pillGood: 'bg-emerald-100 text-emerald-800',
      pillOk: 'bg-green-100 text-green-800',
    },
  };
  const ac = accentClasses[currentMode.accent];

  if (!closestSeason || !mostLopsided) return null;

  return (
    <div className="space-y-8">
      {/* Mode Tabs */}
      <div className="flex gap-2">
        {MODES.map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setSortBy('closeness'); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === m.key
                ? `bg-gradient-to-r ${m.gradient} text-white shadow-lg`
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Hero cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-2xl p-6 bg-gradient-to-br ${currentMode.gradient} text-white shadow-xl`}>
          <div className="text-sm uppercase tracking-wider opacity-80 font-semibold">Tightest {labels.comp} Season</div>
          <div className="text-5xl font-black mt-2">{closestSeason.year}</div>
          <div className="mt-3 opacity-90">
            Just <span className="font-bold text-white">{closestSeason.marginAtTop} pts</span> separated 1st from 2nd.{' '}
            <span className="font-bold text-white">{closestSeason.teamsInContention} clubs</span> were in the hunt.
          </div>
          <div className="mt-3 text-sm opacity-75">
            {labels.leader}: {closestSeason.winner} {closestSeason.isOfficial ? '' : mode === 'mcclelland' ? '(hypothetical)' : ''}
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-red-700 to-red-900 text-white shadow-xl">
          <div className="text-sm uppercase tracking-wider opacity-80 font-semibold">Biggest Runaway</div>
          <div className="text-5xl font-black mt-2">{mostLopsided.year}</div>
          <div className="mt-3 text-red-100">
            A <span className="font-bold text-white">{mostLopsided.marginAtTop} pt</span> gap at the top.{' '}
            <span className="font-bold text-white">{mostLopsided.spread} pts</span> from top to bottom.
          </div>
          <div className="mt-3 text-sm text-red-200">
            Dominated by {mostLopsided.winner} {mostLopsided.isOfficial ? '' : mode === 'mcclelland' ? '(hypothetical)' : ''}
          </div>
        </div>
      </div>

      {/* Closeness Ranking Table */}
      <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className={`bg-gradient-to-r ${currentMode.gradient} px-6 py-5`}>
          <h2 className="display-font text-xl font-black text-white">{labels.comp} Season Closeness Rankings</h2>
          <p className="text-white/70 text-sm mt-1">{labels.subtext}</p>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-gray-500 uppercase mr-2">Sort by:</span>
          {[
            { key: 'closeness', label: 'Closeness Score' },
            { key: 'margin', label: 'Top Margin' },
            { key: 'spread', label: 'Spread' },
            { key: 'year', label: 'Year' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                sortBy === key
                  ? ac.sortActive
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase w-12">Rank</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Season</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">{labels.leader}</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">1st-2nd Gap</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">Top-Bottom</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase" title="Teams within 80% of the leader's points total">
                  In Contention
                  <div className="font-normal text-gray-400 normal-case" style={{ fontSize: '10px' }}>within 80% of 1st</div>
                </th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">Std Dev</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">Closeness</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((season, index) => {
                const teamInfo = season.winnerKey ? getTeamInfo(season.winnerKey) : null;
                const closenessLabel = getClosenessLabel(season.closenessScore, sorted);

                return (
                  <tr
                    key={season.year}
                    className={`border-b border-gray-100 ${ac.hoverRow} transition-colors`}
                  >
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${
                        index === 0 ? ac.rankTop :
                        index === sorted.length - 1 ? 'bg-red-600 text-white' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-2xl font-black text-gray-800">{season.year}</span>
                    </td>
                    <td className="py-4 px-4">
                      {teamInfo && (
                        <div className="flex items-center gap-2">
                          <TeamLogo teamKey={season.winnerKey} size="sm" />
                          <div>
                            <span className="font-semibold text-gray-800">{teamInfo.name}</span>
                            <span className="text-gray-400 text-xs ml-2">{season.leaderPts} pts</span>
                          </div>
                          {season.isOfficial && <span className="text-yellow-700 text-xs font-semibold" title="Official winner">Official</span>}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold text-lg ${season.marginAtTop <= 4 ? 'text-emerald-600' : season.marginAtTop >= 20 ? 'text-red-600' : 'text-gray-700'}`}>
                        {season.marginAtTop}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">pts</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-semibold text-gray-700">{season.spread}</span>
                      <span className="text-gray-400 text-sm ml-1">pts</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-bold text-gray-800">{season.teamsInContention}</span>
                        <span className="text-gray-400 text-xs">/ {season.numTeams}</span>
                      </div>
                      <BarIndicator value={season.teamsInContention} max={season.numTeams} color={ac.bar} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-600 font-medium">{season.stdDev.toFixed(1)}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold ${season.closenessScore <= 30 ? 'text-emerald-600' : season.closenessScore >= 60 ? 'text-red-600' : 'text-gray-700'}`}>
                        {season.closenessScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${closenessLabel.className}`}>
                        {closenessLabel.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Visual: Season comparison bars */}
      <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-5">
          <h2 className="display-font text-xl font-black text-white">{labels.comp} Points Distribution by Season</h2>
          <p className="text-amber-100 text-sm mt-1">
            How spread out were the {mode === 'mcclelland' ? 'combined' : mode.toUpperCase()} points each year? Tighter bars = closer race.
          </p>
        </div>
        <div className="p-6 space-y-4">
          {[...seasons].sort((a, b) => a.year - b.year).map(season => (
            <SeasonBar key={season.year} season={season} globalMax={Math.max(...seasons.map(s => s.maxPts))} accent={currentMode.accent} />
          ))}
        </div>
      </section>

      {/* Methodology */}
      <section className="bg-gray-50 rounded-2xl p-6 text-sm text-gray-600 border border-gray-200">
        <h3 className="font-black text-gray-800 mb-2">How We Measure "Closeness"</h3>
        <p>
          The closeness score combines three factors: <strong>standard deviation</strong> of points across all clubs
          (how bunched together the field is), the <strong>margin at the top</strong> (gap between 1st and 2nd place),
          and the <strong>Gini coefficient</strong> (a measure of inequality in points distribution).
          A lower score means a tighter, more competitive season.
        </p>
        <p className="mt-2">
          {mode === 'afl' && 'AFL points: 4 per win, 2 per draw. "Minor Premier" shows the team that topped the ladder after the home-and-away season. Data covers 1997-2025 (29 seasons of the modern 16-18 team era).'}
          {mode === 'aflw' && 'AFLW points: 4 per win, 2 per draw. AFLW started with 8 clubs in 2017 and expanded to 18 by 2022. Data covers 2017-2025.'}
          {mode === 'mcclelland' && 'Combined points: AFL Win = 4pts, AFLW Win = 8pts (reflecting the shorter AFLW season). Earlier seasons had fewer AFLW teams. Data covers 2017-2025.'}
        </p>
        <p className="mt-2">
          "In contention" counts teams scoring within 80% of the leader's total.
        </p>
      </section>
    </div>
  );
}

function getClosenessLabel(score, allSorted) {
  const scores = allSorted.map(s => s.closenessScore);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min;
  if (range === 0) return { text: 'Competitive', className: 'bg-yellow-100 text-yellow-800' };
  const normalised = (score - min) / range;

  if (normalised < 0.2) return { text: 'Down to the wire', className: 'bg-emerald-100 text-emerald-800' };
  if (normalised < 0.4) return { text: 'Tight race', className: 'bg-green-100 text-green-800' };
  if (normalised < 0.6) return { text: 'Competitive', className: 'bg-yellow-100 text-yellow-800' };
  if (normalised < 0.8) return { text: 'Clear leader', className: 'bg-orange-100 text-orange-800' };
  return { text: 'Runaway train', className: 'bg-red-100 text-red-800' };
}

function BarIndicator({ value, max, color }) {
  const pct = (value / max) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
      <div
        className={`${color} h-1.5 rounded-full transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SeasonBar({ season, globalMax, accent }) {
  const barWidth = (pts) => `${(pts / globalMax) * 100}%`;

  const barColors = {
    blue: { bg: 'from-blue-200 to-blue-400', leader: 'bg-blue-700', gap: 'bg-blue-100 text-blue-700' },
    pink: { bg: 'from-pink-200 to-pink-400', leader: 'bg-pink-700', gap: 'bg-pink-100 text-pink-700' },
    emerald: { bg: 'from-emerald-200 to-emerald-400', leader: 'bg-emerald-700', gap: 'bg-emerald-100 text-emerald-700' },
  };
  const bc = barColors[accent];

  return (
    <div className="flex items-center gap-4">
      <div className="w-12 text-right font-black text-gray-700 text-lg">{season.year}</div>
      <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
        <div
          className={`absolute top-0 h-full bg-gradient-to-r ${bc.bg} rounded-lg opacity-60`}
          style={{ left: barWidth(season.minPts), width: `calc(${barWidth(season.maxPts)} - ${barWidth(season.minPts)})` }}
        />
        <div
          className={`absolute top-0 h-full w-1 ${bc.leader} rounded`}
          style={{ left: barWidth(season.maxPts) }}
        />
        <div
          className="absolute top-0 h-full w-1 bg-amber-500 rounded"
          style={{ left: barWidth(season.secondPts) }}
        />
        <div className="absolute inset-0 flex items-center px-2">
          <span className="text-xs font-bold text-gray-700 drop-shadow-sm">
            {season.minPts} — {season.maxPts} pts
          </span>
        </div>
      </div>
      <div className="w-24 text-right">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          season.marginAtTop <= 4 ? bc.gap :
          season.marginAtTop >= 20 ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          gap: {season.marginAtTop}
        </span>
      </div>
    </div>
  );
}
