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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-stone-600"></div>
        <p className="mt-3 text-stone-500">Loading worm data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 bg-stone-50 border border-stone-200 px-4 py-3 text-center">
        <p className="text-stone-700">{error}</p>
      </div>
    );
  }

  if (!selected) return null;

  const homeName = teamName(selected.homeTeam, selected.homeTeamName);
  const awayName = teamName(selected.awayTeam, selected.awayTeamName);

  const simHomeName = similar ? teamName(similar.homeTeam, similar.homeTeamName) : '';
  const simAwayName = similar ? teamName(similar.awayTeam, similar.awayTeamName) : '';

  function GameDetails({ match, label, showSimilarity }) {
    const home = teamName(match.homeTeam, match.homeTeamName);
    const away = teamName(match.awayTeam, match.awayTeamName);
    const hasScore = match.homeScore != null && match.awayScore != null;
    const winner = !hasScore ? null
      : match.homeScore > match.awayScore ? home
      : match.awayScore > match.homeScore ? away
      : null;
    const margin = hasScore ? Math.abs(match.homeScore - match.awayScore) : null;

    return (
      <div className="mt-3 bg-stone-50 border border-stone-200 px-4 py-3">
        <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-1">{label}</p>
        <p className="display-font text-base font-bold text-stone-900">{home} vs {away}</p>
        <p className="text-sm text-stone-500 mt-0.5">Round {match.round}, {match.season}</p>
        {hasScore && (
          <p className="text-lg font-bold text-stone-900 mt-2 tabular-nums">
            {match.homeScore} – {match.awayScore}
          </p>
        )}
        {margin != null && (
          <p className="text-sm text-stone-500 mt-0.5">
            {winner ? `${winner} by ${margin} pts` : 'Draw'}
          </p>
        )}
        {showSimilarity && similar?.matchId && (
          <p className="text-xs text-stone-400 mt-2">
            Similarity score: <span className="font-semibold text-stone-600">{similar.similarity}</span>
            <span className="ml-1">(lower = more similar)</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className={`grid grid-cols-1 ${similar?.matchId ? 'md:grid-cols-2' : ''} gap-6`}>
        <div>
          <WormChart
            wormData={selected.worm}
            homeTeam={selected.homeTeam}
            awayTeam={selected.awayTeam}
            title="Selected game"
          />
          <GameDetails match={selected} label="Selected game" showSimilarity={false} />
        </div>
        {similar?.matchId && similar.worm && (
          <div>
            <WormChart
              wormData={similar.worm}
              homeTeam={similar.homeTeam}
              awayTeam={similar.awayTeam}
              title="Most similar game"
            />
            <GameDetails match={similar} label="Most similar game" showSimilarity={true} />
          </div>
        )}
      </div>
    </div>
  );
}
