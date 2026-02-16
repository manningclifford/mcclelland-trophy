import React, { useState, useEffect } from 'react';
import { fetchMostSimilar } from '../../services/wormApi';
import { teams } from '../../data/teams';

function teamName(key, apiName) {
  return apiName || teams[key]?.name || key;
}

export default function MostSimilarList({ onSelectPair }) {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchMostSimilar(50)
      .then((data) => {
        setPairs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-3 text-gray-500">Computing most similar pairs across all games...</p>
        <p className="text-xs text-gray-400 mt-1">This may take a moment on first load</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-center">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Most Similar Games</h2>
      <p className="text-sm text-gray-500 mb-4">
        The 50 most similar pairs of scoring worms across all AFL games (2012-2025).
      </p>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game A</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game B</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              {onSelectPair && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20"></th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pairs.map((pair, idx) => {
              const aHome = teamName(pair.matchA.homeTeam, pair.matchA.homeTeamName);
              const aAway = teamName(pair.matchA.awayTeam, pair.matchA.awayTeamName);
              const bHome = teamName(pair.matchB.homeTeam, pair.matchB.homeTeamName);
              const bAway = teamName(pair.matchB.awayTeam, pair.matchB.awayTeamName);
              return (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-medium">{aHome} vs {aAway}</div>
                    <div className="text-xs text-gray-500">R{pair.matchA.round}, {pair.matchA.season}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-medium">{bHome} vs {bAway}</div>
                    <div className="text-xs text-gray-500">R{pair.matchB.round}, {pair.matchB.season}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-gray-700">{pair.score}</td>
                  {onSelectPair && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onSelectPair(pair)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
