import React from 'react';

const TEAMS = [
  'adelaide','brisbane','carlton','collingwood','essendon','fremantle',
  'geelong','goldcoast','gws','hawthorn','melbourne','northmelbourne',
  'portadelaide','richmond','stkilda','sydney','westcoast','westernbulldogs',
];

const SECTIONS = [
  { path: '/linear-title', label: 'Brunswick Street Shield' },
  { path: '/game-evolution', label: 'Change in the Game' },
  { path: '/mcclelland', label: 'McClelland Trophy' },
  { path: '/worm-similarity', label: 'Worm Similarity' },
  { path: '/attendance', label: 'Attendance' },
  { path: '/alltime-ladder', label: 'Meta Premiership' },
];

export default function Header({ route, onNavigate }) {
  return (
    <header className="bg-white border-b border-stone-300">
      {/* Scrolling logo ticker */}
      <div className="overflow-hidden bg-white border-b border-stone-100 py-2" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'ticker 40s linear infinite' }}>
          {[...TEAMS, ...TEAMS].map((team, i) => (
            <img
              key={i}
              src={`${import.meta.env.BASE_URL}teams/${team}.png`}
              alt={team}
              style={{ height: 36, width: 36, objectFit: 'contain', filter: 'grayscale(100%) opacity(35%)', margin: '0 20px', flexShrink: 0 }}
            />
          ))}
        </div>
      </div>

      {/* Masthead */}
      <div className="border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-5 text-center">
          <a
            href="#/"
            onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
            className="hover:opacity-80 transition-opacity inline-block"
          >
            <h1 className="display-font text-4xl sm:text-5xl font-black tracking-tight text-stone-900">
              Sherrin Spreadsheets
            </h1>
            <p className="text-stone-400 text-sm mt-1.5 italic font-normal">
              Exploring the curious corners of Australian football through data
            </p>
          </a>
        </div>
      </div>

      {/* Section navigation */}
      <div className="bg-stone-50">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex justify-center">
            {SECTIONS.map(({ path, label }, i) => (
              <React.Fragment key={path}>
                {i > 0 && (
                  <span className="text-stone-300 self-center text-xs select-none">|</span>
                )}
                <a
                  href={`#${path}`}
                  onClick={(e) => { e.preventDefault(); onNavigate(path); }}
                  className={`px-4 py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
                    route === path
                      ? 'text-stone-900 border-b-2 border-stone-900'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {label}
                </a>
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
