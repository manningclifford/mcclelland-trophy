import React, { useState, useEffect } from 'react';
import TeamLogo from './TeamLogo';
import DataTimestamp from './DataTimestamp';

const ARCHETYPE_META = {
  control:  { label: 'Territory Control',  color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  slingshot:{ label: 'Slingshot Corridor', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  swarm:    { label: 'Handball Swarm',      color: 'bg-amber-100 text-amber-800 border-amber-200' },
  run:      { label: 'Run & Carry',         color: 'bg-violet-100 text-violet-800 border-violet-200' },
  pressure: { label: 'Territory Pressure',  color: 'bg-rose-100 text-rose-800 border-rose-200' },
  stoppage: { label: 'Stoppage Machine',    color: 'bg-stone-100 text-stone-700 border-stone-300' },
};

const ARCHETYPE_DOT = {
  control:  'bg-emerald-500',
  slingshot:'bg-sky-500',
  swarm:    'bg-amber-500',
  run:      'bg-violet-500',
  pressure: 'bg-rose-500',
  stoppage: 'bg-stone-500',
};

const DIMENSIONS = [
  { key: 'directness', label: 'Directness',   desc: 'Kick-to-handball ratio' },
  { key: 'contest',    label: 'Contest',       desc: 'Contested possession rate' },
  { key: 'pressure',   label: 'Pressure',      desc: 'Tackling & defensive intensity' },
  { key: 'stoppage',   label: 'Stoppage',      desc: 'Clearance & centre bounce dominance' },
  { key: 'aerial',     label: 'Aerial',        desc: 'Marks & hitout dominance' },
  { key: 'efficiency', label: 'Efficiency',    desc: 'Inside 50 conversion rate' },
];

const DIM_COLORS = {
  directness: 'bg-sky-400',
  contest:    'bg-rose-400',
  pressure:   'bg-amber-400',
  stoppage:   'bg-violet-400',
  aerial:     'bg-emerald-400',
  efficiency: 'bg-stone-400',
};

function StylePaddock({ teams, selectedKey, onSelect }) {
  return (
    <div className="relative border border-stone-200 bg-stone-50" style={{ aspectRatio: '16/7', minHeight: 240 }}>
      {/* Quadrant shading */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
        <div className="border-r border-b border-stone-200/60" />
        <div className="border-b border-stone-200/60" />
        <div className="border-r border-stone-200/60" />
        <div />
      </div>

      {/* Axis labels */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 uppercase tracking-widest select-none">
        Directness  (handball ← → kick)
      </div>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 uppercase tracking-widest select-none"
        style={{ writingMode: 'vertical-rl', transform: 'translateY(-50%) rotate(180deg)' }}>
        Contest (free ← → contested)
      </div>

      {/* Quadrant corner labels */}
      <span className="absolute top-2 left-8 text-[9px] text-stone-300 uppercase tracking-wider select-none">Handball · Contested</span>
      <span className="absolute top-2 right-4 text-[9px] text-stone-300 uppercase tracking-wider select-none">Kick · Contested</span>
      <span className="absolute bottom-6 left-8 text-[9px] text-stone-300 uppercase tracking-wider select-none">Handball · Free</span>
      <span className="absolute bottom-6 right-4 text-[9px] text-stone-300 uppercase tracking-wider select-none">Kick · Free</span>

      {/* Teams */}
      {teams.map(team => {
        const x = team.dimensions.directness;
        const y = team.dimensions.contest;
        const isSelected = team.key === selectedKey;
        const dotColor = ARCHETYPE_DOT[team.archetypeKey] || 'bg-stone-400';
        return (
          <button
            key={team.key}
            onClick={() => onSelect(isSelected ? null : team.key)}
            title={`${team.name} — ${team.archetype}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
            style={{
              left: `${8 + x * 84}%`,
              top: `${4 + (1 - y) * 82}%`,
            }}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 border-2
              ${isSelected ? 'border-stone-900 scale-125 shadow-md' : 'border-white/80 hover:scale-110'}
              ${dotColor}`}
            >
              <img
                src={`${import.meta.env.BASE_URL}teams/${team.key}.png`}
                alt={team.name}
                className="w-5 h-5 object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <span className={`absolute left-1/2 -translate-x-1/2 mt-1 top-full text-[10px] font-semibold whitespace-nowrap
              ${isSelected ? 'text-stone-900' : 'text-stone-500 opacity-0 group-hover:opacity-100'} transition-opacity`}>
              {team.name.split(' ').at(-1)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DimensionBar({ dimKey, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-stone-400 uppercase tracking-wider w-20 flex-shrink-0">
        {DIMENSIONS.find(d => d.key === dimKey)?.label}
      </span>
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${DIM_COLORS[dimKey]}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-[10px] text-stone-400 w-6 text-right">{Math.round(value * 100)}</span>
    </div>
  );
}

function TeamCard({ team, isSelected, onClick }) {
  const meta = ARCHETYPE_META[team.archetypeKey] || {};
  return (
    <button
      onClick={onClick}
      className={`text-left border transition-all duration-150 flex flex-col w-full
        ${isSelected
          ? 'border-stone-400 shadow-md bg-white ring-1 ring-stone-300'
          : 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm'
        }`}
    >
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <TeamLogo teamKey={team.key} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-stone-900 text-sm leading-tight truncate">{team.name}</p>
          <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-0.5 ${meta.color}`}>
            {team.archetype}
          </span>
        </div>
      </div>

      <div className="px-4 pb-3 space-y-1.5">
        {DIMENSIONS.map(d => (
          <DimensionBar key={d.key} dimKey={d.key} value={team.dimensions[d.key]} />
        ))}
      </div>

      <div className="border-t border-stone-100 bg-stone-50 px-4 py-2.5 grid grid-cols-3 gap-2 mt-auto">
        <div>
          <p className="text-[9px] text-stone-400 uppercase tracking-wider">Win rate</p>
          <p className="text-xs font-bold text-stone-900">{team.performance.winRate}%</p>
        </div>
        <div>
          <p className="text-[9px] text-stone-400 uppercase tracking-wider">Avg margin</p>
          <p className="text-xs font-bold text-stone-900">{team.performance.avgMargin > 0 ? '+' : ''}{team.performance.avgMargin}</p>
        </div>
        <div>
          <p className="text-[9px] text-stone-400 uppercase tracking-wider">Power</p>
          <p className="text-xs font-bold text-stone-900">{parseFloat(team.performance.powerRating).toFixed(1)}</p>
        </div>
      </div>
    </button>
  );
}

function SelectedTeamPanel({ team, onClose }) {
  if (!team) return null;
  const meta = ARCHETYPE_META[team.archetypeKey] || {};
  return (
    <div className="border border-stone-900 bg-white p-5 flex gap-5 items-start">
      <TeamLogo teamKey={team.key} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-black text-stone-900 text-xl display-font leading-tight">{team.name}</h3>
            <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-1 ${meta.color}`}>
              {team.archetype}
            </span>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-xs uppercase tracking-wider mt-1">close</button>
        </div>
        <p className="text-stone-600 text-sm mt-2 leading-relaxed">{team.archetypeDescription}</p>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs">
          <div><span className="text-stone-400">Best when: </span><span className="text-stone-700">{team.bestWhen}</span></div>
          <div><span className="text-stone-400">Struggles when: </span><span className="text-stone-700">{team.strugglesWhen}</span></div>
        </div>
      </div>
    </div>
  );
}

export default function StyleTaxonomy() {
  const [data, setData] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [filterArchetype, setFilterArchetype] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}style_taxonomy.json`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-48 text-stone-400 text-sm">
        Loading style data...
      </div>
    );
  }

  const teams = data.teams;
  const selectedTeam = selectedKey ? teams.find(t => t.key === selectedKey) : null;
  const visibleTeams = filterArchetype
    ? teams.filter(t => t.archetypeKey === filterArchetype)
    : teams;

  const archetypeCounts = {};
  teams.forEach(t => {
    archetypeCounts[t.archetypeKey] = (archetypeCounts[t.archetypeKey] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="display-font text-3xl font-black text-stone-900">Style Paddock</h2>
        <p className="text-stone-500 text-sm mt-1">
          How every AFL club plays in {data.year} — plotted by directness and contested-ball intensity.
        </p>
      </div>

      {/* Scatter plot */}
      <div>
        <StylePaddock teams={teams} selectedKey={selectedKey} onSelect={setSelectedKey} />
      </div>

      {/* Selected team detail */}
      {selectedTeam && (
        <SelectedTeamPanel team={selectedTeam} onClose={() => setSelectedKey(null)} />
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-stone-400 uppercase tracking-wider mr-1">Filter:</span>
        <button
          onClick={() => setFilterArchetype(null)}
          className={`text-xs px-3 py-1 border rounded transition-colors ${
            filterArchetype === null
              ? 'border-stone-900 bg-stone-900 text-white'
              : 'border-stone-200 text-stone-500 hover:border-stone-400'
          }`}
        >
          All clubs
        </button>
        {Object.entries(ARCHETYPE_META).map(([key, meta]) => (
          archetypeCounts[key] ? (
            <button
              key={key}
              onClick={() => setFilterArchetype(filterArchetype === key ? null : key)}
              className={`text-xs px-3 py-1 border rounded transition-colors ${
                filterArchetype === key
                  ? `${meta.color} font-semibold`
                  : 'border-stone-200 text-stone-500 hover:border-stone-400'
              }`}
            >
              {meta.label} <span className="opacity-60">·{archetypeCounts[key]}</span>
            </button>
          ) : null
        ))}
      </div>

      {/* Team grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {visibleTeams.map(team => (
          <TeamCard
            key={team.key}
            team={team}
            isSelected={team.key === selectedKey}
            onClick={() => setSelectedKey(team.key === selectedKey ? null : team.key)}
          />
        ))}
      </div>

      {/* Dimension legend */}
      <div className="border-t border-stone-100 pt-4">
        <p className="text-xs text-stone-400 uppercase tracking-wider mb-3">Dimension guide</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {DIMENSIONS.map(d => (
            <div key={d.key} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${DIM_COLORS[d.key]}`} />
              <div>
                <span className="text-xs font-semibold text-stone-700">{d.label}</span>
                <span className="text-xs text-stone-400"> — {d.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-stone-400 border-t border-stone-100 pt-4">
        Data: AFL Tables season aggregates · Squiggle ratings · {data.year} season ({data.teams[0]?.games} rounds)
      </p>
      <DataTimestamp generatedAt={data.generatedAt} />
    </div>
  );
}
