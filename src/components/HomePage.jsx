import React from 'react';

const FEATURES = [
  {
    path: '/mcclelland',
    title: 'McClelland Trophy',
    description: 'Which AFL club has the best combined performance across both AFL and AFLW? Track the McClelland Trophy standings from 2017 to today.',
    gradient: 'from-amber-500 via-yellow-500 to-amber-600',
    icon: '\uD83C\uDFC6',
  },
  {
    path: '/ladder-closeness',
    title: 'Ladder Closeness',
    description: 'Which seasons went down to the wire? Rank every McClelland Trophy race by how tight the competition was from top to bottom.',
    gradient: 'from-emerald-600 via-green-500 to-emerald-700',
    icon: '\uD83D\uDCCA',
  },
  {
    path: '/worm-similarity',
    title: 'Worm Similarity',
    description: 'Pick any AFL game and find the historical match with the most similar scoring worm. Explore the 50 most similar game pairs across 2012-2025.',
    gradient: 'from-sky-600 via-blue-500 to-indigo-600',
    icon: '\uD83D\uDCC8',
  },
];

export default function HomePage({ onNavigate }) {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-gray-800 mb-3">
          Welcome to <span className="text-emerald-700">The Sherrin Spreadsheets</span>
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto text-lg">
          A collection of tools exploring the curious corners of Australian football through data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {FEATURES.map(({ path, title, description, gradient, icon }) => (
          <button
            key={path}
            onClick={() => onNavigate(path)}
            className="text-left bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 group border border-gray-100"
          >
            <div className={`bg-gradient-to-br ${gradient} px-6 py-6 relative overflow-hidden`}>
              <div className="absolute inset-0 footy-stripe opacity-30" />
              <span className="text-4xl relative z-10">{icon}</span>
              <h3 className="text-xl font-black text-white mt-3 group-hover:underline relative z-10">{title}</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
