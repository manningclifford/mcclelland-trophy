import React from 'react';

const SECTIONS = [
  { path: '/mcclelland', label: 'McClelland Trophy' },
  { path: '/worm-similarity', label: 'Worm Similarity' },
];

export default function Header({ route, onNavigate }) {
  return (
    <header style={{ background: 'linear-gradient(to right, #8B1A1A, #C41E3A)' }} className="text-white py-6 px-4 shadow-lg">
      <div className="max-w-6xl mx-auto">
        <a
          href="#/"
          onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
          className="hover:opacity-90 transition-opacity"
        >
          <h1 className="text-3xl font-bold mb-1">The Sherrin Spreadsheets</h1>
          <p className="text-red-200 text-sm mb-4">
            Exploring the curious corners of Australian football through data
          </p>
        </a>
        <nav className="flex gap-1">
          {SECTIONS.map(({ path, label }) => (
            <a
              key={path}
              href={`#${path}`}
              onClick={(e) => { e.preventDefault(); onNavigate(path); }}
              className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
                route === path
                  ? 'bg-white text-red-900'
                  : 'text-red-200 hover:text-white'
              }`}
              style={route !== path ? { backgroundColor: 'rgba(0,0,0,0.1)' } : {}}
              onMouseEnter={(e) => { if (route !== path) e.target.style.backgroundColor = 'rgba(0,0,0,0.2)'; }}
              onMouseLeave={(e) => { if (route !== path) e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'; }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
