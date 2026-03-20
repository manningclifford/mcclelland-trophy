import React from 'react';
import TeamRow from './TeamRow';

export default function LadderTable({ standings, isLive, error, onRefresh }) {
  if (error) {
    return (
      <div className="bg-stone-50 border border-stone-200 p-6 text-center">
        <p className="text-stone-600 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-stone-800 text-white text-sm hover:bg-stone-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="bg-stone-50 border border-stone-200 p-6 text-center text-stone-400">
        No standings data available for this season.
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200">
      {isLive && (
        <div className="bg-stone-50 border-b border-stone-200 px-4 py-2 flex items-center justify-between">
          <span className="text-stone-600 text-xs flex items-center gap-2">
            <span className="w-2 h-2 bg-stone-600 rounded-full animate-pulse" />
            Live data
          </span>
          <button onClick={onRefresh} className="text-xs text-stone-500 hover:text-stone-800 underline">
            Refresh
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="py-3 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider w-12">#</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Team</th>
              <th className="py-3 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">
                AFL<br /><span className="font-normal text-stone-400">(W-L-D)</span>
              </th>
              <th className="py-3 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">
                AFLW<br /><span className="font-normal text-stone-400">(W-L-D)</span>
              </th>
              <th className="py-3 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Combined<br />Points
              </th>
              <th className="py-3 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Combined<br />%
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

      <div className="bg-stone-50 border-t border-stone-200 px-4 py-2 text-xs text-stone-400 italic">
        AFL Win = 4pts, AFLW Win = 8pts · Draws = half points · Line after 8th = finals reference
      </div>
    </div>
  );
}
