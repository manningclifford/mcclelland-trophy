import React from 'react';

const FEATURES = [
  {
    path: '/linear-title',
    title: 'Brunswick Street Shield',
    description: 'Named after Brunswick Street Oval, site of the first VFL game in 1897 — a challenger title that passes between clubs on the field. It only changes hands when the holder is beaten.',
    label: 'Title history',
  },
  {
    path: '/game-evolution',
    title: 'Change in the Game',
    description: 'How has AFL football changed since 1990? Scoring, margins, disposals, tackles, clearances and more — tracked across every modern season.',
    label: 'Historical trends',
  },
  {
    path: '/mcclelland',
    title: 'McClelland Trophy',
    description: 'Which AFL club has the best combined performance across both AFL and AFLW? Track the McClelland Trophy standings from 2017 to today.',
    label: 'Combined standings',
  },
  {
    path: '/worm-similarity',
    title: 'Worm Similarity',
    description: 'Pick any AFL game and find the historical match with the most similar scoring worm. Explore the 50 most similar game pairs across 2012-2026.',
    label: 'Game comparison',
  },
  {
    path: '/attendance',
    title: 'Attendance',
    description: 'How have crowd numbers changed since 1965? Season averages, per-club breakdowns, and the full history of who fills the stands.',
    label: 'Crowds',
  },
  {
    path: '/alltime-ladder',
    title: 'Meta Premiership',
    description: 'Every regular-season game since the first VFL match in 1897, aggregated into a single ladder. Which club has the best win record across 130 years of football?',
    label: 'Since 1897',
  },
];

export default function HomePage({ onNavigate }) {
  return (
    <div>
      <div className="text-center mb-10 pb-8 border-b border-stone-300">
        <p className="text-stone-500 max-w-lg mx-auto leading-relaxed">
          A collection of tools exploring the curious corners of Australian football through data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {FEATURES.map(({ path, title, description, label, icon }) => (
          <button
            key={path}
            onClick={() => onNavigate(path)}
            className="text-left bg-white border border-stone-200 hover:border-stone-400 hover:shadow-md transition-all duration-200 group"
          >
            <div className="px-6 pt-6 pb-5 border-b border-stone-100">
              <h3 className="display-font text-xl font-bold text-stone-900 group-hover:underline">
                {title}
              </h3>
              <p className="text-stone-400 text-xs tracking-wider uppercase mt-1">{label}</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-stone-600 text-sm leading-relaxed">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
