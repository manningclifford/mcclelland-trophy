import React, { useState } from 'react';
import GameSelector from './GameSelector';
import WormComparison from './WormComparison';
import MostSimilarList from './MostSimilarList';
import { fetchRandom } from '../../services/wormApi';

export default function WormSimilarity({ view, onViewChange }) {
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const handleSeasonChange = (season) => {
    setSelectedSeason(season);
    setSelectedRound(null);
    setSelectedMatch(null);
  };

  const handleRoundChange = (round) => {
    setSelectedRound(round);
    setSelectedMatch(null);
  };

  const handleMatchChange = (matchId) => {
    setSelectedMatch(matchId);
  };

  const handleRandomize = async () => {
    try {
      const { matchId, season, round } = await fetchRandom();
      setSelectedSeason(season);
      setSelectedRound(round);
      setSelectedMatch(matchId);
      onViewChange('search');
    } catch (err) {
      console.error('Failed to randomize:', err);
    }
  };

  const handleSelectPair = (pair) => {
    setSelectedSeason(pair.matchA.season);
    setSelectedRound(pair.matchA.round);
    setSelectedMatch(pair.matchA.matchId);
    onViewChange('search');
  };

  return (
    <div>
      {view === 'search' ? (
        <>
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <GameSelector
                selectedSeason={selectedSeason}
                selectedRound={selectedRound}
                selectedMatch={selectedMatch}
                onSeasonChange={handleSeasonChange}
                onRoundChange={handleRoundChange}
                onMatchChange={handleMatchChange}
              />
              <button
                onClick={handleRandomize}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Randomize
              </button>
            </div>
          </div>

          {selectedMatch ? (
            <WormComparison matchId={selectedMatch} />
          ) : (
            <div className="text-center py-16 text-gray-400">
              Select a season, round, and match above to compare worms.
            </div>
          )}
        </>
      ) : (
        <MostSimilarList onSelectPair={handleSelectPair} />
      )}
    </div>
  );
}
