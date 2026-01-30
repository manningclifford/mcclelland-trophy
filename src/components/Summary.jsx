import React from 'react';
import { historicalData, calculateLegacyPoints, calculateCombinedPercentage } from '../data/historical';
import { getTeamInfo } from '../data/teams';

// Calculate all-time stats
function calculateAllTimeStats() {
  const years = Object.keys(historicalData).map(Number).sort();
  const teamStats = {};

  // Initialize all teams
  const allTeams = [
    'adelaide', 'brisbane', 'carlton', 'collingwood', 'essendon', 'fremantle',
    'geelong', 'goldcoast', 'gws', 'hawthorn', 'melbourne', 'northmelbourne',
    'portadelaide', 'richmond', 'stkilda', 'sydney', 'westcoast', 'westernbulldogs'
  ];

  allTeams.forEach(team => {
    teamStats[team] = {
      trophies: 0,
      hypotheticalWins: 0,
      totalPoints: 0,
      seasonsPlayed: 0,
      topThreeFinishes: 0,
      bestFinish: 99,
      bestFinishYear: null,
    };
  });

  // Process each year
  years.forEach(year => {
    const data = historicalData[year];
    if (!data) return;

    const standings = data.standings.map(team => ({
      ...team,
      mcClellandPoints: calculateLegacyPoints(team),
      combinedPct: calculateCombinedPercentage(team),
    })).sort((a, b) => {
      if (b.mcClellandPoints !== a.mcClellandPoints) {
        return b.mcClellandPoints - a.mcClellandPoints;
      }
      return b.combinedPct - a.combinedPct;
    });

    standings.forEach((team, index) => {
      const position = index + 1;
      const stats = teamStats[team.team];
      if (!stats) return;

      stats.totalPoints += team.mcClellandPoints;
      stats.seasonsPlayed++;

      if (position <= 3) {
        stats.topThreeFinishes++;
      }

      if (position < stats.bestFinish) {
        stats.bestFinish = position;
        stats.bestFinishYear = year;
      }
    });

    // Track actual trophy wins
    if (data.winner) {
      const winnerKey = data.winner.toLowerCase().replace(/\s+/g, '');
      if (teamStats[winnerKey]) {
        teamStats[winnerKey].trophies++;
      }
    }

    // Track hypothetical wins (pre-trophy era)
    if (data.hypotheticalWinner && !data.winner) {
      const winnerKey = data.hypotheticalWinner.toLowerCase().replace(/\s+/g, '');
      if (teamStats[winnerKey]) {
        teamStats[winnerKey].hypotheticalWins++;
      }
    }
  });

  return { teamStats, years };
}

export default function Summary() {
  const { teamStats, years } = calculateAllTimeStats();

  // Sort teams by total trophies + hypothetical wins, then by total points
  const rankedTeams = Object.entries(teamStats)
    .map(([team, stats]) => ({ team, ...stats }))
    .sort((a, b) => {
      const aTotalWins = a.trophies + a.hypotheticalWins;
      const bTotalWins = b.trophies + b.hypotheticalWins;
      if (bTotalWins !== aTotalWins) return bTotalWins - aTotalWins;
      return b.totalPoints - a.totalPoints;
    });

  // Get winners by year
  const winnersByYear = years.map(year => {
    const data = historicalData[year];
    return {
      year,
      winner: data.winner,
      hypotheticalWinner: data.hypotheticalWinner,
      isOfficial: !!data.winner,
    };
  });

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Why the McClelland Trophy Matters</h2>
        <div className="prose prose-gray max-w-none text-gray-600 space-y-3">
          <p>
            The McClelland Trophy represents something unique in Australian sport: a measure of
            <strong> total club excellence</strong> across both men's and women's football. While
            premierships capture a moment of glory, this trophy asks a deeper question — which club
            is genuinely committed to success across their entire program?
          </p>
          <p>
            Named after AFL Commission member Andrew McClelland, the trophy was first awarded in 2023,
            but we've calculated hypothetical winners back to 2017 when AFLW began. The results reveal
            fascinating stories: clubs like North Melbourne and Adelaide whose AFLW dominance compensates
            for AFL struggles, and clubs like Brisbane and Melbourne who've achieved the rare feat of
            excellence in both competitions simultaneously.
          </p>
          <p>
            In an era where women's sport is finally receiving the recognition it deserves, the McClelland
            Trophy stands as a statement that both programs matter equally. A club can't win by neglecting
            half their playing list. That's worth celebrating — and documenting.
          </p>
        </div>
      </section>

      {/* Trophy History */}
      <section className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Trophy History</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {winnersByYear.map(({ year, winner, hypotheticalWinner, isOfficial }) => {
              const displayWinner = winner || hypotheticalWinner;
              const teamKey = displayWinner?.toLowerCase().replace(/\s+/g, '');
              const teamInfo = teamKey ? getTeamInfo(teamKey) : null;

              return (
                <div
                  key={year}
                  className={`rounded-lg p-4 text-center ${
                    isOfficial ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="text-2xl font-bold text-gray-800">{year}</div>
                  {teamInfo && (
                    <>
                      <div
                        className="w-10 h-10 rounded-full mx-auto mt-2 flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: teamInfo.colors.primary }}
                      >
                        {teamInfo.abbr.substring(0, 2)}
                      </div>
                      <div className="mt-2 font-medium text-sm">
                        {teamInfo.name}
                      </div>
                      {isOfficial ? (
                        <div className="text-yellow-600 text-xs mt-1">🏆 Official</div>
                      ) : (
                        <div className="text-gray-400 text-xs mt-1">Hypothetical</div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All-Time Leaderboard */}
      <section className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">All-Time Leaderboard</h2>
          <p className="text-blue-200 text-sm">Combined performance 2017-2025</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase w-12">#</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">Team</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase">
                  <span className="text-yellow-600">Trophies</span>
                </th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase">
                  <span className="text-purple-600">Hypothetical</span>
                </th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase">Top 3s</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase">Best Finish</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase">Total Pts</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase">Avg Pts</th>
              </tr>
            </thead>
            <tbody>
              {rankedTeams.map((stats, index) => {
                const teamInfo = getTeamInfo(stats.team);
                const avgPoints = stats.seasonsPlayed > 0
                  ? (stats.totalPoints / stats.seasonsPlayed).toFixed(1)
                  : '0';

                return (
                  <tr key={stats.team} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-center font-bold text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: teamInfo.colors.primary }}
                        >
                          {teamInfo.abbr.substring(0, 2)}
                        </div>
                        <span className="font-medium">{teamInfo.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {stats.trophies > 0 ? (
                        <span className="text-yellow-600 font-bold">
                          {'🏆'.repeat(stats.trophies)}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {stats.hypotheticalWins > 0 ? (
                        <span className="text-purple-600 font-medium">{stats.hypotheticalWins}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-gray-700">
                      {stats.topThreeFinishes}
                    </td>
                    <td className="py-3 px-4 text-center text-sm">
                      {stats.bestFinish <= 18 ? (
                        <>
                          <span className={`font-medium ${stats.bestFinish === 1 ? 'text-yellow-600' : 'text-gray-700'}`}>
                            {stats.bestFinish === 1 ? '1st' : stats.bestFinish === 2 ? '2nd' : stats.bestFinish === 3 ? '3rd' : `${stats.bestFinish}th`}
                          </span>
                          <span className="text-gray-400 text-xs ml-1">({stats.bestFinishYear})</span>
                        </>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-gray-700">
                      {stats.totalPoints}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {avgPoints}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Fun Stats */}
      <section className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Interesting Stats</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Most Dominant Season"
            value="Melbourne 2022"
            detail="148 pts - Won both AFL & AFLW premierships"
            color="blue"
          />
          <StatCard
            title="Best AFLW-Powered Result"
            value="North Melbourne 2024"
            detail="4th overall with 3 AFL wins, 11-0 AFLW"
            color="pink"
          />
          <StatCard
            title="Most Consistent Club"
            value="Brisbane"
            detail="Top 3 finish in 6 of 9 seasons"
            color="maroon"
          />
          <StatCard
            title="Biggest Improver"
            value="Hawthorn"
            detail="18th in 2022 → 1st in 2024"
            color="amber"
          />
          <StatCard
            title="AFLW Expansion Impact"
            value="2022"
            detail="First year all 18 clubs competed in AFLW"
            color="purple"
          />
          <StatCard
            title="Closest Race"
            value="2021"
            detail="Brisbane edged Adelaide by just 4 points"
            color="green"
          />
        </div>
      </section>

      {/* Methodology */}
      <section className="bg-gray-50 rounded-lg p-6 text-sm text-gray-600">
        <h3 className="font-bold text-gray-800 mb-2">Methodology</h3>
        <p>
          Points calculated using the McClelland Trophy system: AFL Win = 4pts, AFLW Win = 8pts
          (reflecting the shorter AFLW season). Draws earn half points. Tiebreakers determined by
          combined percentage weighted by games played.
        </p>
        <p className="mt-2">
          <strong>Note:</strong> 2017-2022 shows hypothetical winners as the trophy was first awarded
          in 2023. Earlier years had fewer AFLW teams, giving clubs without women's programs a disadvantage.
        </p>
      </section>
    </div>
  );
}

function StatCard({ title, value, detail, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    pink: 'bg-pink-50 border-pink-200 text-pink-800',
    maroon: 'bg-red-50 border-red-200 text-red-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    green: 'bg-green-50 border-green-200 text-green-800',
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color] || colorClasses.blue}`}>
      <div className="text-xs uppercase tracking-wide opacity-75">{title}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      <div className="text-sm mt-1 opacity-75">{detail}</div>
    </div>
  );
}
