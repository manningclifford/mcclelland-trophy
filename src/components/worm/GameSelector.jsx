import React, { useState, useEffect } from 'react';
import { fetchSeasons, fetchRounds, fetchMatches } from '../../services/wormApi';
import { teams } from '../../data/teams';

export default function GameSelector({
  selectedSeason,
  selectedRound,
  selectedMatch,
  onSeasonChange,
  onRoundChange,
  onMatchChange,
}) {
  const [seasons, setSeasons] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState('');

  useEffect(() => {
    fetchSeasons().then(setSeasons).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedSeason) { setRounds([]); return; }
    setLoading('rounds');
    fetchRounds(selectedSeason)
      .then(setRounds)
      .catch(console.error)
      .finally(() => setLoading(''));
  }, [selectedSeason]);

  useEffect(() => {
    if (!selectedSeason || !selectedRound) { setMatches([]); return; }
    setLoading('matches');
    fetchMatches(selectedSeason, selectedRound)
      .then(setMatches)
      .catch(console.error)
      .finally(() => setLoading(''));
  }, [selectedSeason, selectedRound]);

  function matchLabel(m) {
    const home = m.homeTeamName || teams[m.homeTeam]?.name || m.homeTeam;
    const away = m.awayTeamName || teams[m.awayTeam]?.name || m.awayTeam;
    return `${home} vs ${away}`;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2">
        <label htmlFor="worm-season" className="text-sm font-medium text-gray-700">Season:</label>
        <select
          id="worm-season"
          value={selectedSeason || ''}
          onChange={(e) => onSeasonChange(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Select season</option>
          {seasons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="worm-round" className="text-sm font-medium text-gray-700">Round:</label>
        <select
          id="worm-round"
          value={selectedRound || ''}
          onChange={(e) => onRoundChange(e.target.value ? Number(e.target.value) : null)}
          disabled={!selectedSeason || loading === 'rounds'}
          className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">{loading === 'rounds' ? 'Loading...' : 'Select round'}</option>
          {rounds.map((r) => (
            <option key={r} value={r}>Round {r}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="worm-match" className="text-sm font-medium text-gray-700">Match:</label>
        <select
          id="worm-match"
          value={selectedMatch || ''}
          onChange={(e) => onMatchChange(e.target.value || null)}
          disabled={!selectedRound || loading === 'matches'}
          className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">{loading === 'matches' ? 'Loading...' : 'Select match'}</option>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>{matchLabel(m)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
