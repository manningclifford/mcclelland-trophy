import React, { useState, useEffect } from 'react';
import WormChart from './WormChart';
import { fetchWorm, fetchSimilar } from '../../services/wormApi';
import { teams } from '../../data/teams';

function teamName(key, apiName) {
  return apiName || teams[key]?.name || key;
}

export default function WormComparison({ matchId }) {
  const [selected, setSelected] = useState(null);
  const [similar, setSimilar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSimilar(null);

    fetchWorm(matchId)
      .then((wormData) => {
        if (cancelled) return;
        setSelected(wormData);
        return fetchSimilar(matchId);
      })
      .then((simData) => {
        if (cancelled) return;
        setSimilar(simData || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [matchId]);

  if (loading) {
    return (
      <div className="mt-6 text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-3 text-gray-500">Loading worm data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-center">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!selected) return null;

  const homeName = teamName(selected.homeTeam, selected.homeTeamName);
  const awayName = teamName(selected.awayTeam, selected.awayTeamName);

  const simHomeName = similar ? teamName(similar.homeTeam, similar.homeTeamName) : '';
  const simAwayName = similar ? teamName(similar.awayTeam, similar.awayTeamName) : '';

  return (
    <div className="mt-6">
      {similar && similar.matchId ? (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
          <span className="text-green-800 font-semibold text-lg">
            Similarity score: {similar.similarity}
          </span>
          <span className="text-green-600 text-sm ml-2">(lower = more similar)</span>
          <p className="text-green-700 text-sm mt-1">
            Most similar match: {simHomeName} vs {simAwayName} (Round {similar.round}, {similar.season})
          </p>
        </div>
      ) : similar?.message ? (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-center">
          <p className="text-yellow-700 text-sm">{similar.message}</p>
        </div>
      ) : null}

      <div className={`grid grid-cols-1 ${similar?.matchId ? 'md:grid-cols-2' : ''} gap-4`}>
        <WormChart
          wormData={selected.worm}
          homeTeam={selected.homeTeam}
          awayTeam={selected.awayTeam}
          title={`${homeName} vs ${awayName} (Selected)`}
        />
        {similar?.matchId && similar.worm && (
          <WormChart
            wormData={similar.worm}
            homeTeam={similar.homeTeam}
            awayTeam={similar.awayTeam}
            title={`${simHomeName} vs ${simAwayName} (${similar.season} R${similar.round})`}
          />
        )}
      </div>
    </div>
  );
}
