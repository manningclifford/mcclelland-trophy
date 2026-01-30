import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SeasonSelector from './components/SeasonSelector';
import LadderTable from './components/LadderTable';
import Summary from './components/Summary';
import { getMcClellandStandings, clearCache } from './services/aflApi';
import { historicalData } from './data/historical';

const CURRENT_YEAR = new Date().getFullYear();

function App() {
  const [view, setView] = useState('summary'); // 'ladder' or 'summary'
  const [selectedYear, setSelectedYear] = useState(2025);
  const [standings, setStandings] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    if (view === 'ladder') {
      fetchStandings(selectedYear);
    }
  }, [selectedYear, fetchStandings, view]);

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
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-1">
            <button
              onClick={() => setView('ladder')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                view === 'ladder'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ladder
            </button>
            <button
              onClick={() => setView('summary')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                view === 'summary'
                  ? 'border-blue-600 text-blue-600'
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm">
                  <span className="text-yellow-700">
                    🏆 {selectedYear} Winner: <strong>{historicalWinner}</strong>
                  </span>
                </div>
              )}

              {hypotheticalWinner && !historicalWinner && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-sm">
                  <span className="text-purple-700">
                    📊 {selectedYear} Hypothetical Leader: <strong>{hypotheticalWinner}</strong>
                    <span className="text-purple-500 text-xs ml-2">(Trophy not yet awarded)</span>
                  </span>
                </div>
              )}

              {selectedYear >= CURRENT_YEAR && !historicalWinner && !hypotheticalWinner && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm">
                  <span className="text-blue-700">
                    Season in progress
                  </span>
                </div>
              )}
            </div>

            {aflwTeams && aflwTeams !== 'all' && (
              <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-sm text-orange-700">
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
    </div>
  );
}

export default App;
