import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import SeasonSelector from './components/SeasonSelector';
import LadderTable from './components/LadderTable';
import Summary from './components/Summary';
import GameEvolution from './components/GameEvolution';
import WormSimilarity from './components/worm/WormSimilarity';
import LinearTitle from './components/LinearTitle';
import AlltimeLadder from './components/AlltimeLadder';
import { getMcClellandStandings, clearCache } from './services/aflApi';
import { historicalData } from './data/historical';

const CURRENT_YEAR = new Date().getFullYear();

function getRoute() {
  const hash = window.location.hash.replace('#', '') || '/';
  return hash;
}

function App() {
  const [route, setRoute] = useState(getRoute);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [standings, setStandings] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
  };

  const fetchStandings = useCallback(async (year, forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    if (forceRefresh) {
      clearCache();
    }

    try {
      const result = await getMcClellandStandings(year);
      setStandings(result.standings);
      setIsLive(result.isLive);
      setError(result.error);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setStandings(null);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (route === '/mcclelland') {
      fetchStandings(selectedYear);
    }
  }, [selectedYear, fetchStandings, route]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleRefresh = () => {
    fetchStandings(selectedYear, true);
  };

  const historicalWinner = historicalData[selectedYear]?.winner;
  const hypotheticalWinner = historicalData[selectedYear]?.hypotheticalWinner;
  const aflwTeams = historicalData[selectedYear]?.aflwTeams;

  return (
    <div className="min-h-screen footy-bg">
      <Header route={route} onNavigate={navigate} />

      {route === '/' && (
        <main className="max-w-6xl mx-auto py-10 px-4">
          <HomePage onNavigate={navigate} />
          <footer className="mt-16 pt-6 border-t border-stone-200 text-center text-xs text-stone-400">
            Built by Manning Clifford using the{' '}
            <span className="text-stone-500">Squiggle</span> and{' '}
            <span className="text-stone-500">fitzRoy</span> APIs
          </footer>
        </main>
      )}

      {route === '/mcclelland' && (
        <main className="max-w-6xl mx-auto py-8 px-4 space-y-10">
          {/* Summary section */}
          <Summary />

          {/* Ladder section */}
          <section>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <SeasonSelector
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
                isLoading={isLoading}
              />
              {historicalWinner && (
                <span className="text-sm text-stone-600">
                  {selectedYear} winner: <strong className="text-stone-900">{historicalWinner}</strong>
                </span>
              )}
              {hypotheticalWinner && !historicalWinner && (
                <span className="text-sm text-stone-500 italic">
                  {selectedYear} hypothetical leader: <strong className="not-italic text-stone-700">{hypotheticalWinner}</strong>
                </span>
              )}
            </div>
            <LadderTable
              standings={standings}
              isLive={isLive}
              error={error}
              onRefresh={handleRefresh}
            />
          </section>
        </main>
      )}

      {route === '/game-evolution' && (
        <main className="max-w-6xl mx-auto py-8 px-4">
          <GameEvolution />
        </main>
      )}

      {route === '/linear-title' && (
        <main className="max-w-6xl mx-auto py-8 px-4">
          <LinearTitle />
        </main>
      )}

      {route === '/alltime-ladder' && (
        <main className="max-w-6xl mx-auto py-8 px-4">
          <AlltimeLadder />
        </main>
      )}

      {route === '/worm-similarity' && (
        <main className="max-w-6xl mx-auto py-8 px-4">
          <WormSimilarity />
        </main>
      )}
    </div>
  );
}

export default App;
