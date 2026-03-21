import React, { useState, useEffect } from 'react';
import { fetchMostSimilar } from '../../services/wormApi';
import { teams } from '../../data/teams';

function WormSparkline({ worm }) {
  if (!worm || worm.length < 2) return <span className="text-stone-300 text-xs">—</span>;
  const W = 80, H = 28;
  const margins = worm.map(p => p.margin);
  const maxAbs = Math.max(...margins.map(Math.abs), 1);
  const pts = worm.map((p, i) => {
    const x = (i / (worm.length - 1)) * W;
    const y = H / 2 - (p.margin / maxAbs) * (H / 2 - 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#d6d3d1" strokeWidth={0.5} />
      <polyline points={pts} fill="none" stroke="#44403c" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-stone-600"></div>
        <p className="mt-3 text-stone-500">Computing most similar pairs across all games...</p>
        <p className="text-xs text-stone-400 mt-1">This may take a moment on first load</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-stone-50 border border-stone-200 px-4 py-3 text-center">
        <p className="text-stone-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="h-px flex-1 bg-stone-200" />
        <h2 className="display-font text-lg font-bold text-stone-700 uppercase tracking-widest">Most Similar Games</h2>
        <div className="h-px flex-1 bg-stone-200" />
      </div>
      <p className="text-sm text-stone-500 mb-4 text-center">
        The 50 most similar pairs of scoring worms across all AFL games (2012–2026).
      </p>
      <div className="bg-white border border-stone-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-100">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider w-10">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Game A</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider w-24">Worm A</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Game B</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider w-24">Worm B</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {pairs.map((pair, idx) => {
              const aHome = teamName(pair.matchA.homeTeam, pair.matchA.homeTeamName);
              const aAway = teamName(pair.matchA.awayTeam, pair.matchA.awayTeamName);
              const bHome = teamName(pair.matchB.homeTeam, pair.matchB.homeTeamName);
              const bAway = teamName(pair.matchB.awayTeam, pair.matchB.awayTeamName);
              return (
                <tr
                  key={idx}
                  onClick={() => onSelectPair && onSelectPair(pair)}
                  className={`border-b border-stone-100 transition-colors ${onSelectPair ? 'cursor-pointer hover:bg-amber-50' : 'hover:bg-stone-50'}`}
                >
                  <td className="px-4 py-3 text-sm text-stone-400">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm text-stone-900">
                    <div className="font-medium">{aHome} vs {aAway}</div>
                    <div className="text-xs text-stone-500">R{pair.matchA.round}, {pair.matchA.season}</div>
                    {pair.matchA.homeScore != null && (
                      <div className="text-xs text-stone-500 font-mono mt-0.5">
                        {pair.matchA.homeScore} – {pair.matchA.awayScore}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <WormSparkline worm={pair.matchA.worm} />
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-900">
                    <div className="font-medium">{bHome} vs {bAway}</div>
                    <div className="text-xs text-stone-500">R{pair.matchB.round}, {pair.matchB.season}</div>
                    {pair.matchB.homeScore != null && (
                      <div className="text-xs text-stone-500 font-mono mt-0.5">
                        {pair.matchB.homeScore} – {pair.matchB.awayScore}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <WormSparkline worm={pair.matchB.worm} />
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-stone-700">{pair.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
