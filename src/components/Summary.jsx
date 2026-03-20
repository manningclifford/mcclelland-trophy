import React from 'react';
import { historicalData, calculateLegacyPoints, calculateCombinedPercentage } from '../data/historical';
import { getTeamInfo } from '../data/teams';
import TeamLogo from './TeamLogo';

function RuledHeading({ children, sub }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="h-px flex-1 bg-stone-200" />
      <div className="text-center">
        <h2 className="display-font text-lg font-bold text-stone-700 uppercase tracking-widest">{children}</h2>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
      <div className="h-px flex-1 bg-stone-200" />
    </div>
  );
}

// Calculate all-time stats
function calculateAllTimeStats() {
  const years = Object.keys(historicalData).map(Number).sort();
  const teamStats = {};

  const allTeams = [
    'adelaide', 'brisbane', 'carlton', 'collingwood', 'essendon', 'fremantle',
    'geelong', 'goldcoast', 'gws', 'hawthorn', 'melbourne', 'northmelbourne',
    'portadelaide', 'richmond', 'stkilda', 'sydney', 'westcoast', 'westernbulldogs'
  ];

  allTeams.forEach(team => {
    teamStats[team] = {
      trophies: 0, hypotheticalWins: 0, totalPoints: 0,
      seasonsPlayed: 0, topThreeFinishes: 0, bestFinish: 99, bestFinishYear: null,
    };
  });

  years.forEach(year => {
    const data = historicalData[year];
    if (!data) return;

    const standings = data.standings.map(team => ({
      ...team,
      mcClellandPoints: calculateLegacyPoints(team),
      combinedPct: calculateCombinedPercentage(team),
    })).sort((a, b) => {
      if (b.mcClellandPoints !== a.mcClellandPoints) return b.mcClellandPoints - a.mcClellandPoints;
      return b.combinedPct - a.combinedPct;
    });

    standings.forEach((team, index) => {
      const position = index + 1;
      const stats = teamStats[team.team];
      if (!stats) return;
      stats.totalPoints += team.mcClellandPoints;
      stats.seasonsPlayed++;
      if (position <= 3) stats.topThreeFinishes++;
      if (position < stats.bestFinish) { stats.bestFinish = position; stats.bestFinishYear = year; }
    });

    if (data.winner) {
      const k = data.winner.toLowerCase().replace(/\s+/g, '');
      if (teamStats[k]) teamStats[k].trophies++;
    }
    if (data.hypotheticalWinner && !data.winner) {
      const k = data.hypotheticalWinner.toLowerCase().replace(/\s+/g, '');
      if (teamStats[k]) teamStats[k].hypotheticalWins++;
    }
  });

  return { teamStats, years };
}

export default function Summary() {
  const { teamStats, years } = calculateAllTimeStats();

  const rankedTeams = Object.entries(teamStats)
    .map(([team, stats]) => ({ team, ...stats }))
    .sort((a, b) => {
      const aTotalWins = a.trophies + a.hypotheticalWins;
      const bTotalWins = b.trophies + b.hypotheticalWins;
      if (bTotalWins !== aTotalWins) return bTotalWins - aTotalWins;
      return b.totalPoints - a.totalPoints;
    });

  const winnersByYear = years.map(year => {
    const data = historicalData[year];
    return { year, winner: data.winner, hypotheticalWinner: data.hypotheticalWinner, isOfficial: !!data.winner };
  });

  return (
    <div className="space-y-10">

      {/* Introduction */}
      <p className="text-stone-500 leading-relaxed">
        Awarded annually since 2023 to the AFL club with the best combined record across both AFL and AFLW.
        AFL wins earn 4 points, AFLW wins earn 8 points (reflecting the shorter season), and draws earn half.
        Hypothetical winners are calculated back to 2017 when AFLW began.
      </p>

      {/* Trophy History */}
      <section>
        <RuledHeading>Trophy History</RuledHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {winnersByYear.map(({ year, winner, hypotheticalWinner, isOfficial }) => {
            const displayWinner = winner || hypotheticalWinner;
            const teamKey = displayWinner?.toLowerCase().replace(/\s+/g, '');
            const teamInfo = teamKey ? getTeamInfo(teamKey) : null;

            return (
              <div
                key={year}
                className={`p-4 text-center border ${
                  isOfficial ? 'bg-stone-50 border-stone-400' : 'bg-white border-stone-200'
                }`}
              >
                <div className="display-font text-2xl font-bold text-stone-800">{year}</div>
                {teamInfo && (
                  <>
                    <div className="flex justify-center mt-2">
                      <TeamLogo teamKey={teamKey} size="md" />
                    </div>
                    <div className="mt-2 text-sm font-medium text-stone-700">{teamInfo.name}</div>
                    <div className={`text-xs mt-1 ${isOfficial ? 'text-stone-500 font-semibold' : 'text-stone-400'}`}>
                      {isOfficial ? 'Official' : 'Hypothetical'}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* All-Time Leaderboard */}
      <section>
        <RuledHeading sub="Combined performance 2017–2025">All-Time Leaderboard</RuledHeading>
        <div className="bg-white border border-stone-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider w-12">#</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Team</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Trophies</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Hypothetical</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Top 3s</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Best Finish</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Pts</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Avg Pts</th>
              </tr>
            </thead>
            <tbody>
              {rankedTeams.map((stats, index) => {
                const teamInfo = getTeamInfo(stats.team);
                const avgPoints = stats.seasonsPlayed > 0
                  ? (stats.totalPoints / stats.seasonsPlayed).toFixed(1) : '0';
                const ordinal = n => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;

                return (
                  <tr key={stats.team} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-3 px-4 text-center font-bold text-stone-500">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <TeamLogo teamKey={stats.team} size="sm" />
                        <span className="font-medium text-stone-800">{teamInfo.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {stats.trophies > 0
                        ? <span className="text-stone-800 font-bold">{stats.trophies}</span>
                        : <span className="text-stone-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {stats.hypotheticalWins > 0
                        ? <span className="text-stone-600 font-medium">{stats.hypotheticalWins}</span>
                        : <span className="text-stone-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-stone-700">{stats.topThreeFinishes}</td>
                    <td className="py-3 px-4 text-center text-sm">
                      {stats.bestFinish <= 18 ? (
                        <>
                          <span className={`font-medium ${stats.bestFinish === 1 ? 'text-stone-900 font-bold' : 'text-stone-700'}`}>
                            {ordinal(stats.bestFinish)}
                          </span>
                          <span className="text-stone-400 text-xs ml-1">({stats.bestFinishYear})</span>
                        </>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-stone-700">{stats.totalPoints}</td>
                    <td className="py-3 px-4 text-center text-stone-600">{avgPoints}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Notable seasons */}
      <section>
        <RuledHeading>Notable Seasons</RuledHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Most Dominant Season', value: 'Melbourne 2022', detail: '148 pts — won both AFL & AFLW premierships' },
            { title: 'Best AFLW-Powered Result', value: 'North Melbourne 2024', detail: '4th overall with 3 AFL wins, 11–0 AFLW' },
            { title: 'Most Consistent Club', value: 'Brisbane', detail: 'Top 3 finish in 6 of 9 seasons' },
            { title: 'Biggest Improver', value: 'Hawthorn', detail: '18th in 2022 → 1st in 2024' },
            { title: 'AFLW Expansion', value: '2022', detail: 'First year all 18 clubs competed in AFLW' },
            { title: 'Closest Race', value: '2021', detail: 'Brisbane edged Adelaide by just 4 points' },
          ].map(({ title, value, detail }) => (
            <div key={title} className="bg-white border border-stone-200 p-4">
              <p className="text-xs text-stone-400 uppercase tracking-wider">{title}</p>
              <p className="display-font text-lg font-bold text-stone-900 mt-1">{value}</p>
              <p className="text-sm text-stone-500 italic mt-0.5">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology */}
      <p className="text-xs text-stone-400 italic">
        Points calculated using the McClelland Trophy system: AFL Win = 4pts, AFLW Win = 8pts
        (reflecting the shorter AFLW season). Draws earn half points. Tiebreakers determined by
        combined percentage weighted by games played. 2017–2022 shows hypothetical winners as the trophy was first awarded in 2023.
      </p>
      <p className="text-xs text-stone-400 italic mt-2">Source: Squiggle API.</p>
    </div>
  );
}
