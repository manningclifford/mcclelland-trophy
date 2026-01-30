import React from 'react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-6 px-4 shadow-lg">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">McClelland Trophy</h1>
        <p className="text-blue-200 text-sm">
          Combined AFL &amp; AFLW Ladder - The ultimate measure of club excellence
        </p>
        <div className="mt-4 text-xs text-blue-300 bg-blue-800/50 rounded p-3">
          <strong>Points System (2023-2024):</strong> AFL Win = 4pts, AFLW Win = 8pts | Draws = half points | Tiebreaker: Combined percentage
        </div>
      </div>
    </header>
  );
}
