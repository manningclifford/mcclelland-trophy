import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import SeasonSelector from './components/SeasonSelector';
import LadderTable from './components/LadderTable';
import Summary from './components/Summary';
import LadderCloseness from './components/LadderCloseness';
import WormSimilarity from './components/worm/WormSimilarity';
import { getMcClellandStandings, clearCache } from './services/aflApi';
import { historicalData } from './data/historical';

const CURRENT_YEAR = new Date().getFullYear();

function getRoute() {
  const hash = window.location.hash.replace('#', '') || '/';
  return hash;
}

function App() {
  const [route, setRoute] = useState(getRoute);
  const [view, setView] = useState('summary');
  const [wormView, setWormView] = useState('search');
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
    if (route === '/mcclelland' && view === 'ladder') {
      fetchStandings(selectedYear);
    }
  }, [selectedYear, fetchStandings, view, route]);

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
        </main>
      )}

      {route === '/mcclelland' && (
        <>
          <div className="bg-emerald-50 border-b border-emerald-200">
            <div className="max-w-6xl mx-auto px-4 py-2 text-xs text-emerald-800 font-medium">
              <strong>Points System (2023-2024):</strong> AFL Win = 4pts, AFLW Win = 8pts | Draws = half points | Tiebreaker: Combined percentage
            </div>
          </div>

          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-4">
              <nav className="flex gap-1">
                <button
                  onClick={() => setView('ladder')}
                  className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
                    view === 'ladder'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ladder
                </button>
                <button
                  onClick={() => setView('summary')}
                  className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
                    view === 'summary'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Summary
                </button>
              </nav>
            </div>
          </div>

          <main className="max-w-6xl mx-auto py-8 px-4">
            {view === 'ladder' ? (
              <>
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <SeasonSelector
                    selectedYear={selectedYear}
                    onYearChange={handleYearChange}
                    isLoading={isLoading}
                  />

                  {historicalWinner && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-2 text-sm">
                      <span className="text-amber-800">
                        {selectedYear} Winner: <strong>{historicalWinner}</strong>
                      </span>
                    </div>
                  )}

                  {hypotheticalWinner && !historicalWinner && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 text-sm">
                      <span className="text-purple-700">
                        {selectedYear} Hypothetical Leader: <strong>{hypotheticalWinner}</strong>
                        <span className="text-purple-500 text-xs ml-2">(Trophy not yet awarded)</span>
                      </span>
                    </div>
                  )}

                  {selectedYear >= CURRENT_YEAR && !historicalWinner && !hypotheticalWinner && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm">
                      <span className="text-emerald-700 font-medium">
                        Season in progress
                      </span>
                    </div>
                  )}
                </div>

                {aflwTeams && aflwTeams !== 'all' && (
                  <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm text-orange-700">
                    <strong>Note:</strong> In {selectedYear}, only {aflwTeams.length} teams had AFLW sides.
                    Teams without AFLW programs only earn AFL points.
                  </div>
                )}

                <LadderTable
                  standings={standings}
                  isLive={isLive}
                  error={error}
                  onRefresh={handleRefresh}
                />
              </>
            ) : (
              <Summary />
            )}

            <footer className="mt-8 text-center text-sm text-gray-500">
              <p>
                The McClelland Trophy is awarded to the AFL club with the best combined
                performance across both AFL and AFLW competitions.
              </p>
              <p className="mt-2">
                Data sources: AFL.com.au, Wikipedia | Historical data verified against official records
              </p>
            </footer>
          </main>
        </>
      )}

      {route === '/ladder-closeness' && (
        <>
          <div className="bg-emerald-50 border-b border-emerald-200">
            <div className="max-w-6xl mx-auto px-4 py-2 text-xs text-emerald-800 font-medium">
              <strong>How it works:</strong> Each season is scored on how tight the ladder was — factoring in the gap at the top, points spread, and overall equality across AFL, AFLW, or combined.
            </div>
          </div>

          <main className="max-w-6xl mx-auto py-8 px-4">
            <LadderCloseness />

            <footer className="mt-8 text-center text-sm text-gray-500">
              <p>
                Closeness analysis based on AFL ladder data from 1997 to 2025, AFLW from 2017 to 2025.
              </p>
            </footer>
          </main>
        </>
      )}

      {route === '/worm-similarity' && (
        <>
          <div className="bg-emerald-50 border-b border-emerald-200">
            <div className="max-w-6xl mx-auto px-4 py-2 text-xs text-emerald-800 font-medium">
              <strong>How it works:</strong> Each worm is normalised by its peak margin, then compared minute-by-minute. Lower similarity score = closer match.
            </div>
          </div>

          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-4">
              <nav className="flex gap-1">
                <button
                  onClick={() => setWormView('search')}
                  className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
                    wormView === 'search'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Search
                </button>
                <button
                  onClick={() => setWormView('list')}
                  className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
                    wormView === 'list'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Most Similar
                </button>
              </nav>
            </div>
          </div>

          <main className="max-w-6xl mx-auto py-8 px-4">
            <WormSimilarity view={wormView} onViewChange={setWormView} />

            <footer className="mt-8 text-center text-sm text-gray-500">
              <p>
                Worm data sourced via fitzRoy. Similarity based on normalised scoring progression.
              </p>
            </footer>
          </main>
        </>
      )}
    </div>
  );
}

export default App;
