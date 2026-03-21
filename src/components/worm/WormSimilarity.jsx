import React, { useState, useRef, useEffect } from 'react';
import GameSelector from './GameSelector';
import WormComparison from './WormComparison';
import MostSimilarList from './MostSimilarList';
import { fetchRandom } from '../../services/wormApi';

export default function WormSimilarity() {
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const topRef = useRef(null);

  useEffect(() => {
    fetchRandom()
      .then(({ matchId, season, round }) => {
        setSelectedSeason(season);
        setSelectedRound(round);
        setSelectedMatch(matchId);
      })
      .catch(() => {});
  }, []);

  const handleSeasonChange = (season) => {
    setSelectedSeason(season);
    setSelectedRound(null);
    setSelectedMatch(null);
  };

  const handleRoundChange = (round) => {
    setSelectedRound(round);
    setSelectedMatch(null);
  };

  const handleRandomize = async () => {
    try {
      const { matchId, season, round } = await fetchRandom();
      setSelectedSeason(season);
      setSelectedRound(round);
      setSelectedMatch(matchId);
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      console.error('Failed to randomize:', err);
    }
  };

  const handleSelectPair = (pair) => {
    setSelectedSeason(pair.matchA.season);
    setSelectedRound(pair.matchA.round);
    setSelectedMatch(pair.matchA.matchId);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-10">
      {/* Description */}
      <p className="text-stone-500 leading-relaxed">
        Every AFL game has a scoring worm — the running margin as it rises and falls across four quarters.
        Select any match to see its worm, then compare it against the most mathematically similar game
        in the record books. The table below lists the 50 closest pairs across all games from 2012–2026,
        ranked by how little their worms diverge.
      </p>

      {/* Search section */}
      <section ref={topRef}>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-stone-200" />
          <h2 className="display-font text-lg font-bold text-stone-700 uppercase tracking-widest">Search</h2>
          <div className="h-px flex-1 bg-stone-200" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
          <GameSelector
            selectedSeason={selectedSeason}
            selectedRound={selectedRound}
            selectedMatch={selectedMatch}
            onSeasonChange={handleSeasonChange}
            onRoundChange={handleRoundChange}
            onMatchChange={(id) => setSelectedMatch(id)}
          />
          <button
            onClick={handleRandomize}
            className="px-4 py-2 bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 focus:outline-none transition-colors"
          >
            Randomize
          </button>
        </div>

        {selectedMatch ? (
          <WormComparison matchId={selectedMatch} />
        ) : (
          <div className="text-center py-12 text-stone-400 border border-stone-200 bg-white">
            Select a season, round, and match above — or hit Randomize.
          </div>
        )}
      </section>

      {/* Most similar list */}
      <section>
        <MostSimilarList onSelectPair={handleSelectPair} />
      </section>

      <p className="text-xs text-stone-400 text-center pb-4">Source: Squiggle API. Covers home-and-away and finals, 2012–2026.</p>
    </div>
  );
}
