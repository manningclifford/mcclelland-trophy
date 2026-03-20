import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine,
} from 'recharts';
import { loadGameEvolution } from '../services/gameEvolutionApi';

// ─── Stat definitions ────────────────────────────────────────────────────────

const GROUPS = [
  {
    label: 'Scoring',
    color: '#2d5016',
    stats: [
      { key: 'avgTotalScore',     label: 'Avg Total Score',     unit: 'pts', desc: 'Both teams\' combined score per game' },
      { key: 'avgWinningScore',   label: 'Avg Winning Score',   unit: 'pts', desc: 'Points on the board for the winning side' },
      { key: 'avgGoalsPerGame',   label: 'Goals per Game',      unit: '',    desc: 'A goal (6 pts) is kicked through the two tall central posts' },
      { key: 'avgBehindsPerGame', label: 'Behinds per Game',    unit: '',    desc: 'A behind (1 pt): ball through the shorter outer posts, off the post, or rushed through' },
      { key: 'scoringEfficiency', label: 'Scoring Efficiency',  unit: '%',   desc: 'Goals as a share of total scoring shots (goals + behinds) — higher means more accurate kicking' },
    ],
  },
  {
    label: 'Game Character',
    color: '#6b1a1a',
    stats: [
      { key: 'avgMargin',  label: 'Avg Winning Margin', unit: 'pts', desc: 'Average points difference between the teams at the final siren' },
      { key: 'closePct',   label: 'Close Games',        unit: '%',   desc: 'Percentage of games decided by 12 points or fewer — roughly two kicks' },
      { key: 'blowoutPct', label: 'Blowouts',           unit: '%',   desc: 'Percentage of games decided by more than 50 points' },
      { key: 'homeWinPct', label: 'Home Win Rate',      unit: '%',   desc: 'Percentage of games won by the designated home team' },
    ],
  },
  {
    label: 'Possession',
    color: '#1a3a6b',
    stats: [
      { key: 'avgDisposals', label: 'Disposals per Game',         unit: '', desc: 'Total kicks and handballs combined across both teams per match' },
      { key: 'avgKicks',     label: 'Kicks per Game',             unit: '', desc: 'Total kicks across both teams — a disposal struck with the foot' },
      { key: 'avgHandballs', label: 'Handballs per Game',         unit: '', desc: 'Total handballs across both teams — ball punched out of the hand with a closed fist' },
      { key: 'avgMarks',     label: 'Marks per Game',             unit: '', desc: 'Total marks across both teams — a clean catch from a kick of 15m+ earns a free kick' },
      { key: 'avgContested', label: 'Contested Poss. per Game',   unit: '', desc: 'Total contested possessions across both teams — won under physical pressure or at a contest' },
    ],
  },
  {
    label: 'Physicality',
    color: '#5a3a00',
    stats: [
      { key: 'avgTackles',    label: 'Tackles per Game',    unit: '', desc: 'Total tackles across both teams — legally bringing an opponent to ground or trapping them holding the ball' },
      { key: 'avgClearances', label: 'Clearances per Game', unit: '', desc: 'Total clearances across both teams — winning the ball out of a stoppage and moving it away from the contest' },
      { key: 'avgHitouts',    label: 'Hit-outs per Game',   unit: '', desc: 'Total hit-outs across both teams — a ruckman tapping the ball to a teammate at a centre bounce or ball-up' },
      { key: 'avgInside50s',  label: 'Inside 50s per Game', unit: '', desc: 'Total forward entries across both teams — moving the ball into the attacking 50m arc' },
    ],
  },
];

// ─── Custom tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-300 px-2 py-1 text-xs shadow-sm">
      <span className="font-semibold text-stone-700">{label}</span>
      <span className="ml-2 text-stone-900">{payload[0].value}{unit}</span>
    </div>
  );
}

// ─── Single stat card ────────────────────────────────────────────────────────

function StatCard({ stat, data, color }) {
  const valid = data.filter(s => s[stat.key] != null && !isNaN(s[stat.key]));
  if (valid.length < 2) return null;

  const first = valid[0];
  const last  = valid[valid.length - 1];
  const delta = ((last[stat.key] - first[stat.key]) / Math.abs(first[stat.key])) * 100;
  const up    = delta >= 0;
  const [showDesc, setShowDesc] = useState(false);
  const tipRef = useRef(null);

  useEffect(() => {
    if (!showDesc) return;
    const handler = (e) => {
      if (tipRef.current && !tipRef.current.contains(e.target)) setShowDesc(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDesc]);

  return (
    <div className="bg-white border border-stone-200 p-4 flex flex-col">
      {/* Header row */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider leading-tight">{stat.label}</p>
            <div className="relative flex-shrink-0" ref={tipRef}>
              <button
                onClick={() => setShowDesc(v => !v)}
                className="w-4 h-4 rounded-full border border-stone-300 text-stone-400 hover:text-stone-600 hover:border-stone-400 flex items-center justify-center text-[10px] font-bold leading-none transition-colors"
                aria-label="Definition"
              >
                i
              </button>
              {showDesc && (
                <div className="absolute z-10 left-0 top-5 w-52 bg-white border border-stone-200 shadow-md p-2.5 text-xs text-stone-600 leading-snug">
                  {stat.desc}
                </div>
              )}
            </div>
          </div>
          <p className="display-font text-2xl font-bold text-stone-900 mt-0.5">
            {last[stat.key]}{stat.unit}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">{last.year}</p>
        </div>
        <div className={`text-right ml-2 ${up ? 'text-emerald-700' : 'text-red-700'}`}>
          <span className="text-sm font-bold">{up ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%</span>
          <p className="text-xs text-stone-400 mt-0.5">since {first.year}</p>
        </div>
      </div>

      {/* Sparkline */}
      <div className="flex-1" style={{ minHeight: 80 }}>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart syncId="evolution" data={valid} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <XAxis dataKey="year" hide />
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip content={<ChartTooltip unit={stat.unit} />} />
            <Line
              type="monotone"
              dataKey={stat.key}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Baseline */}
      <p className="text-xs text-stone-400 mt-1">
        {first.year}: {first[stat.key]}{stat.unit}
      </p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function GameEvolution() {
  const [data, setData]   = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGameEvolution()
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded p-8 text-center">
        <p className="text-stone-700 font-semibold mb-2">Data not available</p>
        <p className="text-stone-500 text-sm">{error}</p>
        <p className="text-stone-400 text-xs mt-3">
          Run <code className="bg-stone-100 px-1">npm run build:game-evolution</code> to generate the data file.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16 text-stone-400">
        <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading…
      </div>
    );
  }

  // Exclude the current in-progress season (too few games to be meaningful)
  const raw = data.seasons.filter(s => s.year <= 2025);

  // 2020 had 16-min quarters instead of 20-min — scale raw totals/averages by 20/16 = 1.25
  // Percentages and ratios (closePct, blowoutPct, homeWinPct, scoringEfficiency) are unaffected.
  const COVID_SCALE = 20 / 16;
  const COVID_KEYS = [
    'avgTotalScore','avgWinningScore','avgMargin','avgGoalsPerGame','avgBehindsPerGame',
    'avgDisposals','avgKicks','avgHandballs','avgMarks','avgTackles',
    'avgClearances','avgHitouts','avgInside50s','avgContested',
  ];
  const seasons = raw.map(s => {
    if (s.year !== 2020) return s;
    const adjusted = { ...s };
    COVID_KEYS.forEach(k => {
      if (adjusted[k] != null) adjusted[k] = Math.round(adjusted[k] * COVID_SCALE * 10) / 10;
    });
    return adjusted;
  });

  return (
    <div className="space-y-10">
      {/* Description */}
      <p className="text-stone-500 leading-relaxed">
        How has AFL football changed since 1990? These charts track the average stats for every completed
        home-and-away season — scoring, game character, possession, and physicality. Each data point
        represents the per-game average across all matches that year. Click the <span className="font-mono text-stone-700">i</span> on
        any chart for a definition of that stat.
      </p>

      {GROUPS.map(group => {
        // Only show groups where at least one stat has data
        const hasData = group.stats.some(s =>
          seasons.some(d => d[s.key] != null && !isNaN(d[s.key]))
        );
        if (!hasData) return null;

        return (
          <section key={group.label}>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px flex-1 bg-stone-200" />
              <h2 className="display-font text-lg font-bold text-stone-700 uppercase tracking-widest">
                {group.label}
              </h2>
              <div className="h-px flex-1 bg-stone-200" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {group.stats.map(stat => (
                <StatCard
                  key={stat.key}
                  stat={stat}
                  data={seasons}
                  color={group.color}
                />
              ))}
            </div>
          </section>
        );
      })}

      <div className="text-xs text-stone-400 text-center pb-4 space-y-1">
        <p>Regular season games only. Player stats totalled per game across both teams.</p>
        <p>
          * 2020 figures scaled by ×1.25 to account for the COVID-shortened quarters (16 min vs the standard 20 min),
          allowing direct comparison with other seasons. Percentages and ratios are unaffected.
        </p>
        <p>Source: afltables via fitzRoy. Generated {new Date(data.generatedAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
      </div>
    </div>
  );
}
