import React, { useState, useEffect } from 'react';
import { getLinearTitleMeta } from '../services/linearTitleApi';
import { loadGameEvolution } from '../services/gameEvolutionApi';
import { getSeasonTrend } from '../services/attendanceApi';
import { getAlltimeTotals } from '../services/alltimeMensApi';
import { getTeamInfo } from '../data/teams';
import TeamLogo from './TeamLogo';

function Sparkline({ data, valueKey = 'avg', color = '#a8a29e', width = 80, height = 32 }) {
  if (!data || data.length < 2) return null;
  const values = data.map(d => d[valueKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - 2 - ((v - min) / range) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible flex-shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// Stat section with fixed height so all cards are uniform
function Stat({ children, className = '' }) {
  return (
    <div className={`h-20 px-5 flex items-center border-t border-stone-100 bg-stone-50 ${className}`}>
      {children}
    </div>
  );
}

export default function HomePage({ onNavigate }) {
  const [shield, setShield] = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [alltime, setAlltime] = useState(null);

  useEffect(() => {
    getLinearTitleMeta().then(setShield).catch(() => {});
    loadGameEvolution().then(d => setEvolution(d.seasons)).catch(() => {});
    getSeasonTrend().then(setAttendance).catch(() => {});
    getAlltimeTotals().then(setAlltime).catch(() => {});
  }, []);

  const holderInfo = shield ? getTeamInfo(shield.currentHolder) : null;
  const evLatest = evolution?.at(-1);
  const evFirst = evolution?.[0];
  const latestAttendance = attendance?.at(-1);
  const earliestAttendance = attendance?.[0];
  const attendancePctChange = latestAttendance && earliestAttendance
    ? Math.round((latestAttendance.avg - earliestAttendance.avg) / earliestAttendance.avg * 100)
    : null;
  const alltimeLeader = alltime?.[0];
  const alltimeLeaderInfo = alltimeLeader ? getTeamInfo(alltimeLeader.team) : null;
  const brisbaneInfo = getTeamInfo('brisbane');

  const cards = [
    {
      path: '/linear-title',
      title: 'Brunswick St Shield',
      label: 'Title history',
      description: 'A challenger belt that passes between clubs every time the holder is beaten.',
      stat: (
        <Stat>
          {holderInfo ? (
            <>
              <TeamLogo teamKey={shield.currentHolder} size="sm" />
              <div className="ml-3 min-w-0">
                <p className="text-xs text-stone-400 uppercase tracking-widest">Current holder</p>
                <p className="font-bold text-stone-900 truncate">{holderInfo.name}</p>
                <p className="text-xs text-stone-500">{shield.currentDefenses + 1}-game winning streak</p>
              </div>
            </>
          ) : (
            <div className="h-8 w-40 bg-stone-200 rounded animate-pulse" />
          )}
        </Stat>
      ),
    },
    {
      path: '/game-evolution',
      title: 'Game Changes',
      label: 'Historical trends',
      description: 'How has the game changed? Scoring, disposals, tackles and more since 1990.',
      stat: (
        <Stat className="justify-between">
          <div className="min-w-0">
            <p className="text-xs text-stone-400 uppercase tracking-widest">Avg total score</p>
            {evLatest ? (
              <>
                <p className="font-bold text-stone-900">{Math.round(evLatest.avgTotalScore)} pts in {evLatest.year}</p>
                {evFirst && <p className="text-xs text-stone-500">vs {Math.round(evFirst.avgTotalScore)} in {evFirst.year}</p>}
              </>
            ) : <div className="h-5 w-32 bg-stone-200 rounded animate-pulse mt-1" />}
          </div>
          {evolution && <Sparkline data={evolution} valueKey="avgTotalScore" />}
        </Stat>
      ),
    },
    {
      path: '/mcclelland',
      title: 'McLelland Trophy',
      label: 'Combined standings',
      description: 'Combined AFL and AFLW standings. Which club dominates both competitions?',
      stat: (
        <Stat>
          <TeamLogo teamKey="brisbane" size="sm" />
          <div className="ml-3 min-w-0">
            <p className="text-xs text-stone-400 uppercase tracking-widest">2025 winner</p>
            <p className="font-bold text-stone-900">{brisbaneInfo.name} · 112 pts</p>
            <p className="text-xs text-stone-500">AFL 48 · AFLW 64</p>
          </div>
        </Stat>
      ),
    },
    {
      path: '/worm-similarity',
      title: 'Similar Worms',
      label: 'Game comparison',
      description: 'Pick any AFL game and find its closest historical twin by scoring worm.',
      stat: (
        <Stat>
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-widest">Database</p>
            <p className="font-bold text-stone-900">2,808 games indexed</p>
            <p className="text-xs text-stone-500">2012–2026 · by worm similarity</p>
          </div>
        </Stat>
      ),
    },
    {
      path: '/attendance',
      title: 'Attendance Data',
      label: 'Crowds',
      description: 'Season averages and per-club breakdowns. Crowd trends since 1965.',
      stat: (
        <Stat className="justify-between">
          <div className="min-w-0">
            <p className="text-xs text-stone-400 uppercase tracking-widest">Avg crowd</p>
            {latestAttendance ? (
              <>
                <p className="font-bold text-stone-900">{latestAttendance.avg.toLocaleString()} in {latestAttendance.year}</p>
                {attendancePctChange !== null && (
                  <p className="text-xs text-stone-400">up {attendancePctChange}% since {earliestAttendance.year}</p>
                )}
              </>
            ) : <div className="h-5 w-32 bg-stone-200 rounded animate-pulse mt-1" />}
          </div>
          {attendance && <Sparkline data={attendance} valueKey="avg" />}
        </Stat>
      ),
    },
    {
      path: '/alltime-ladder',
      title: 'Meta Prems',
      label: 'Since 1897',
      description: 'One ladder, every game since 1897. Who leads across 130 years of football?',
      stat: (
        <Stat>
          {alltimeLeaderInfo ? (
            <>
              <TeamLogo teamKey={alltimeLeader.team} size="sm" />
              <div className="ml-3 min-w-0">
                <p className="text-xs text-stone-400 uppercase tracking-widest">All-time leader</p>
                <p className="font-bold text-stone-900 truncate">{alltimeLeaderInfo.name}</p>
                <p className="text-xs text-stone-500">{alltimeLeader.winPct}% win rate · {alltimeLeader.wins.toLocaleString()} wins</p>
              </div>
            </>
          ) : <div className="h-8 w-40 bg-stone-200 rounded animate-pulse" />}
        </Stat>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {cards.map(({ path, title, label, description, stat }) => (
        <button
          key={path}
          onClick={() => onNavigate(path)}
          className="text-left bg-white border border-stone-200 hover:border-stone-400 hover:shadow-md transition-all duration-200 group w-full flex flex-col"
        >
          <div className="px-5 pt-5 pb-2">
            <h3 className="display-font text-lg font-bold text-stone-900 group-hover:underline leading-tight">{title}</h3>
            <p className="text-stone-400 text-xs tracking-wider uppercase mt-1">{label}</p>
          </div>
          <div className="px-5 py-3 flex-1">
            <p className="text-stone-600 text-sm leading-relaxed line-clamp-2">{description}</p>
          </div>
          {stat}
        </button>
      ))}
    </div>
  );
}
