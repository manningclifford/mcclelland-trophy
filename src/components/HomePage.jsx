import React from 'react';

const FEATURES = [
  {
    path: '/mcclelland',
    title: 'McClelland Trophy',
    description: 'Which AFL club has the best combined performance across both AFL and AFLW? Track the McClelland Trophy standings from 2017 to today.',
    color: 'from-yellow-500 to-amber-600',
    icon: '🏆',
  },
  {
    path: '/worm-similarity',
    title: 'Worm Similarity',
    description: 'Pick any AFL game and find the historical match with the most similar scoring worm. Explore the 50 most similar game pairs across 2012-2025.',
    color: 'from-green-500 to-emerald-600',
    icon: '📈',
  },
];

export default function HomePage({ onNavigate }) {
  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to The Sherrin Spreadsheets</h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          A collection of tools exploring the curious corners of Australian football through data — from combined club performance to scoring pattern analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {FEATURES.map(({ path, title, description, color, icon }) => (
          <button
            key={path}
            onClick={() => onNavigate(path)}
            className="text-left bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
          >
            <div className={`bg-gradient-to-r ${color} px-6 py-5`}>
              <span className="text-3xl">{icon}</span>
              <h3 className="text-xl font-bold text-white mt-2 group-hover:underline">{title}</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600 text-sm">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
