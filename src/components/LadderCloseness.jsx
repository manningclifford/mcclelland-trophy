import React, { useState } from 'react';
import { historicalData, calculateLegacyPoints, calculateCombinedPercentage } from '../data/historical';
import { getTeamInfo } from '../data/teams';

function analyseSeasons() {
  const years = Object.keys(historicalData).map(Number).sort();

  return years.map(year => {
    const data = historicalData[year];
    const standings = data.standings
      .map(t => ({
        ...t,
        pts: calculateLegacyPoints(t),
        pct: calculateCombinedPercentage(t),
      }))
      .sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.pct - a.pct);

    const points = standings.map(s => s.pts);
    const maxPts = points[0];
    const minPts = points[points.length - 1];
    const secondPts = points[1];
    const spread = maxPts - minPts;
    const marginAtTop = maxPts - secondPts;

    // Standard deviation of points
    const mean = points.reduce((a, b) => a + b, 0) / points.length;
    const variance = points.reduce((sum, p) => sum + (p - mean) ** 2, 0) / points.length;
    const stdDev = Math.sqrt(variance);

    // How many teams within 20% of the leader's score
    const threshold = maxPts * 0.8;
    const teamsInContention = points.filter(p => p >= threshold).length;

    // Gini coefficient - 0 = perfect equality, 1 = max inequality
    const n = points.length;
    const sortedPts = [...points].sort((a, b) => a - b);
    let giniSum = 0;
    for (let i = 0; i < n; i++) {
      giniSum += (2 * (i + 1) - n - 1) * sortedPts[i];
    }
    const gini = giniSum / (n * points.reduce((a, b) => a + b, 0));

    // Closeness score: lower = closer ladder
    // Weighted combo: small std dev + small margin at top + low gini
    const closenessScore = (stdDev * 0.4) + (marginAtTop * 2) + (gini * 100);

    const winner = data.winner || data.hypotheticalWinner;
    const winnerKey = winner?.toLowerCase().replace(/\s+/g, '');

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
      isOfficial: !!data.winner,
      numTeams: standings.length,
    };
  });
}

export default function LadderCloseness() {
  const seasons = analyseSeasons();
  const [sortBy, setSortBy] = useState('closeness');

  const sorted = [...seasons].sort((a, b) => {
    if (sortBy === 'closeness') return a.closenessScore - b.closenessScore;
    if (sortBy === 'year') return a.year - b.year;
    if (sortBy === 'margin') return a.marginAtTop - b.marginAtTop;
    if (sortBy === 'spread') return a.spread - b.spread;
    return 0;
  });

  const closestSeason = sorted[0];
  const mostLopsided = sorted[sorted.length - 1];

  return (
    <div className="space-y-8">
      {/* Hero cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 bg-gradient-to-br from-green-600 to-green-800 text-white shadow-xl">
          <div className="text-sm uppercase tracking-wider opacity-80 font-semibold">Tightest Race</div>
          <div className="text-5xl font-black mt-2">{closestSeason.year}</div>
          <div className="mt-3 text-green-100">
            Just <span className="font-bold text-white">{closestSeason.marginAtTop} pts</span> separated 1st from 2nd.{' '}
            <span className="font-bold text-white">{closestSeason.teamsInContention} clubs</span> were in the hunt.
          </div>
          <div className="mt-3 text-sm text-green-200">
            Won by {closestSeason.winner} {closestSeason.isOfficial ? '' : '(hypothetical)'}
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
            Dominated by {mostLopsided.winner} {mostLopsided.isOfficial ? '' : '(hypothetical)'}
          </div>
        </div>
      </div>

      {/* Closeness Ranking Table */}
      <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-emerald-700 to-green-600 px-6 py-5">
          <h2 className="text-xl font-black text-white">Season Closeness Rankings</h2>
          <p className="text-emerald-100 text-sm mt-1">
            Which McClelland Trophy races went down to the wire?
          </p>
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
                  ? 'bg-emerald-600 text-white'
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
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase">Winner</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">1st-2nd Gap</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">Top-Bottom</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">In Contention</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase">Std Dev</th>
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
                    className="border-b border-gray-100 hover:bg-emerald-50/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${
                        index === 0 ? 'bg-emerald-600 text-white' :
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
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: teamInfo.colors.primary }}
                          >
                            {teamInfo.abbr.substring(0, 2)}
                          </div>
                          <span className="font-semibold text-gray-800">{teamInfo.name}</span>
                          {season.isOfficial && <span className="text-yellow-500" title="Official winner">&#x1F3C6;</span>}
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
                      <BarIndicator value={season.teamsInContention} max={season.numTeams} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-600 font-medium">{season.stdDev.toFixed(1)}</span>
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
          <h2 className="text-xl font-black text-white">Points Distribution by Season</h2>
          <p className="text-amber-100 text-sm mt-1">
            How spread out were the points each year? Tighter bars = closer race.
          </p>
        </div>
        <div className="p-6 space-y-4">
          {[...seasons].sort((a, b) => a.year - b.year).map(season => (
            <SeasonBar key={season.year} season={season} globalMax={Math.max(...seasons.map(s => s.maxPts))} />
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
          "In contention" counts teams scoring within 80% of the leader's total. Earlier seasons with fewer
          AFLW teams naturally have different dynamics, as clubs without women's programs could only earn AFL points.
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
  const normalised = (score - min) / range;

  if (normalised < 0.2) return { text: 'Down to the wire', className: 'bg-emerald-100 text-emerald-800' };
  if (normalised < 0.4) return { text: 'Tight race', className: 'bg-green-100 text-green-800' };
  if (normalised < 0.6) return { text: 'Competitive', className: 'bg-yellow-100 text-yellow-800' };
  if (normalised < 0.8) return { text: 'Clear leader', className: 'bg-orange-100 text-orange-800' };
  return { text: 'Runaway train', className: 'bg-red-100 text-red-800' };
}

function BarIndicator({ value, max }) {
  const pct = (value / max) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
      <div
        className="bg-emerald-500 h-1.5 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SeasonBar({ season, globalMax }) {
  const barWidth = (pts) => `${(pts / globalMax) * 100}%`;

  return (
    <div className="flex items-center gap-4">
      <div className="w-12 text-right font-black text-gray-700 text-lg">{season.year}</div>
      <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
        {/* Range bar from min to max */}
        <div
          className="absolute top-0 h-full bg-gradient-to-r from-emerald-200 to-emerald-400 rounded-lg opacity-60"
          style={{ left: barWidth(season.minPts), width: `calc(${barWidth(season.maxPts)} - ${barWidth(season.minPts)})` }}
        />
        {/* Leader marker */}
        <div
          className="absolute top-0 h-full w-1 bg-emerald-700 rounded"
          style={{ left: barWidth(season.maxPts) }}
        />
        {/* 2nd place marker */}
        <div
          className="absolute top-0 h-full w-1 bg-amber-500 rounded"
          style={{ left: barWidth(season.secondPts) }}
        />
        {/* Labels */}
        <div className="absolute inset-0 flex items-center px-2">
          <span className="text-xs font-bold text-gray-700 drop-shadow-sm">
            {season.minPts} — {season.maxPts} pts
          </span>
        </div>
      </div>
      <div className="w-24 text-right">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          season.marginAtTop <= 4 ? 'bg-emerald-100 text-emerald-700' :
          season.marginAtTop >= 20 ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          gap: {season.marginAtTop}
        </span>
      </div>
    </div>
  );
}
