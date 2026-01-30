import React from 'react';

const AVAILABLE_SEASONS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

export default function SeasonSelector({ selectedYear, onYearChange, isLoading }) {
  return (
    <div className="flex items-center gap-4">
      <label htmlFor="season-select" className="font-medium text-gray-700">
        Season:
      </label>
      <select
        id="season-select"
        value={selectedYear}
        onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
        disabled={isLoading}
        className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {AVAILABLE_SEASONS.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      {isLoading && (
        <span className="text-sm text-gray-500 flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      )}
    </div>
  );
}
