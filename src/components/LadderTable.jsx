import React from 'react';
import TeamRow from './TeamRow';

export default function LadderTable({ standings, isLive, error, onRefresh }) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
        No standings data available for this season.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {isLive && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center justify-between">
          <span className="text-green-700 text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live data
          </span>
          <button
            onClick={onRefresh}
            className="text-sm text-green-600 hover:text-green-800 underline"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                #
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span className="text-blue-600">AFL</span>
                <br />
                <span className="text-gray-400 font-normal">(W-L-D)</span>
              </th>
              <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span className="text-pink-600">AFLW</span>
                <br />
                <span className="text-gray-400 font-normal">(W-L-D)</span>
              </th>
              <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Combined
                <br />
                Points
              </th>
              <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Combined
                <br />
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <TeamRow key={team.team} team={team} position={index + 1} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
        <strong>Scoring:</strong> AFL Win = 4pts, AFLW Win = 8pts | Draws = half points |
        Line after 8th indicates finals positions reference
      </div>
    </div>
  );
}
