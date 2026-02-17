import React from 'react';

const SECTIONS = [
  { path: '/mcclelland', label: 'McClelland Trophy' },
  { path: '/ladder-closeness', label: 'Ladder Closeness' },
  { path: '/worm-similarity', label: 'Worm Similarity' },
];

export default function Header({ route, onNavigate }) {
  return (
    <header className="text-white shadow-2xl relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #1a3a1a 0%, #2d5016 30%, #1a4a2e 60%, #0f2b0f 100%)',
    }}>
      {/* Subtle diagonal stripe overlay */}
      <div className="absolute inset-0 footy-stripe opacity-50" />

      <div className="relative max-w-6xl mx-auto px-4 py-6">
        <a
          href="#/"
          onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
          className="hover:opacity-90 transition-opacity inline-block"
        >
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-amber-400">The Sherrin</span>{' '}
            <span className="text-white">Spreadsheets</span>
          </h1>
          <p className="text-emerald-300 text-sm mt-1 font-medium">
            Exploring the curious corners of Australian football through data
          </p>
        </a>
        <nav className="flex gap-1 mt-4">
          {SECTIONS.map(({ path, label }) => (
            <a
              key={path}
              href={`#${path}`}
              onClick={(e) => { e.preventDefault(); onNavigate(path); }}
              className={`px-4 py-2 rounded-t text-sm font-bold transition-all ${
                route === path
                  ? 'bg-amber-400 text-green-900 shadow-lg'
                  : 'text-emerald-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
