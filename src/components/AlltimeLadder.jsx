import React, { useState, useEffect } from 'react';
import { loadAlltimeMens } from '../services/alltimeMensApi';

const AFL_FIRST_YEAR = 1990;

async function getTotalsForEra(fromYear) {
  const data = await loadAlltimeMens();
  const totals = {};
  for (const [year, season] of Object.entries(data.seasons)) {
    if (Number(year) < fromYear) continue;
    for (const row of season.standings || []) {
      if (!totals[row.team]) {
        totals[row.team] = { wins: 0, losses: 0, draws: 0, played: 0, seasons: 0 };
      }
      totals[row.team].wins   += row.wins;
      totals[row.team].losses += row.losses;
      totals[row.team].draws  += row.draws;
      totals[row.team].played += row.played;
      totals[row.team].seasons += 1;
    }
  }
  return Object.entries(totals)
    .map(([team, s]) => ({
      team, ...s,
      winPct: s.played > 0 ? Math.round((s.wins + s.draws * 0.5) / s.played * 1000) / 10 : 0,
      pts: s.wins * 2 + s.draws,
    }))
    .sort((a, b) => b.winPct - a.winPct || b.wins - a.wins);
}
import { getTeamInfo } from '../data/teams';
import TeamLogo from './TeamLogo';

const COLS = [
  { key: 'rank',    label: '#',        cls: 'text-right w-10',    title: null },
  { key: 'team',    label: 'Club',     cls: 'text-left',          title: null },
  { key: 'seasons', label: 'Seasons',  cls: 'text-center w-20',   title: 'Number of home-and-away seasons played' },
  { key: 'played',  label: 'Played',   cls: 'text-center w-20',   title: 'Total regular-season games played' },
  { key: 'wins',    label: 'W',        cls: 'text-center w-16',   title: 'Wins' },
  { key: 'draws',   label: 'D',        cls: 'text-center w-16',   title: 'Draws' },
  { key: 'losses',  label: 'L',        cls: 'text-center w-16',   title: 'Losses' },
  { key: 'winPct',  label: 'Win %',    cls: 'text-center w-20',   title: 'Win percentage — (wins + 0.5×draws) / played' },
  { key: 'pts',     label: 'Pts',      cls: 'text-center w-20',   title: 'Total points — 2 per win, 1 per draw' },
];

export default function AlltimeLadder() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortCol, setSortCol] = useState('winPct');
  const [sortDir, setSortDir] = useState('desc');
  const [showDefunct, setShowDefunct] = useState(true);
  const [aflOnly, setAflOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getTotalsForEra(aflOnly ? AFL_FIRST_YEAR : 1897)
      .then(setRows)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [aflOnly]);

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  }

  if (error) {
    return (
      <div className="bg-stone-50 border border-stone-200 p-8 text-center">
        <p className="text-stone-700 font-semibold mb-2">Data not available</p>
        <p className="text-stone-600 text-sm">{error}</p>
        <p className="text-stone-500 text-xs mt-3">
          Run <code className="bg-stone-100 px-1">npm run build:alltime-afl</code> to generate the data file.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-stone-500">
        <svg className="animate-spin h-5 w-5 mr-3 text-stone-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading…
      </div>
    );
  }

  const DEFUNCT = new Set(['fitzroy', 'university']);

  const filtered = showDefunct ? rows : rows.filter(r => !DEFUNCT.has(r.team));

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortCol] ?? 0;
    let bv = b[sortCol] ?? 0;
    if (sortCol === 'team') {
      av = getTeamInfo(a.team).name;
      bv = getTeamInfo(b.team).name;
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-10">
      <p className="text-stone-500 leading-relaxed">
        Every regular-season game played since the first VFL match in 1897, aggregated into a single all-time ladder.
        Finals are excluded. Sorted by win percentage — wins plus half a draw, divided by games played.
      </p>

      <section>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-stone-200" />
          <h2 className="display-font text-lg font-bold text-stone-700 uppercase tracking-widest">Meta Premiership</h2>
          <div className="h-px flex-1 bg-stone-200" />
        </div>

        <div className="bg-white border border-stone-200">
          <div className="bg-stone-50 border-b border-stone-200 px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={aflOnly}
                onChange={e => setAflOnly(e.target.checked)}
                className="accent-stone-700"
              />
              AFL era only (1990–present)
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showDefunct}
                onChange={e => setShowDefunct(e.target.checked)}
                className="accent-stone-700"
              />
              Show defunct clubs (Fitzroy, University)
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  {COLS.map(({ key, label, cls, title }) => (
                    <th
                      key={key}
                      onClick={key !== 'rank' ? () => toggleSort(key) : undefined}
                      title={title || undefined}
                      className={`py-2 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider select-none ${cls} ${key !== 'rank' ? 'cursor-pointer hover:text-stone-800' : ''}`}
                    >
                      {label}
                      {sortCol === key && (
                        <span className="ml-1 text-stone-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, idx) => {
                  const info = getTeamInfo(row.team);
                  const isDefunct = DEFUNCT.has(row.team);
                  return (
                    <tr
                      key={row.team}
                      className={`border-b border-stone-100 hover:bg-stone-50 transition-colors ${isDefunct ? 'opacity-60' : ''}`}
                    >
                      <td className="py-2 px-3 text-xs text-stone-400 text-right tabular-nums">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: info.colors.primary }} />
                          <span className="text-sm font-semibold text-stone-900">{info.name}</span>
                          {isDefunct && (
                            <span className="text-xs text-stone-400 italic">defunct</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center text-sm text-stone-600 tabular-nums">{row.seasons}</td>
                      <td className="py-2 px-3 text-center text-sm text-stone-600 tabular-nums">{row.played.toLocaleString()}</td>
                      <td className="py-2 px-3 text-center text-sm font-semibold text-stone-900 tabular-nums">{row.wins.toLocaleString()}</td>
                      <td className="py-2 px-3 text-center text-sm text-stone-500 tabular-nums">{row.draws}</td>
                      <td className="py-2 px-3 text-center text-sm text-stone-600 tabular-nums">{row.losses.toLocaleString()}</td>
                      <td className="py-2 px-3 text-center tabular-nums">
                        <span className="text-sm font-bold text-stone-900">{row.winPct.toFixed(1)}</span>
                        <span className="text-xs text-stone-400 ml-0.5">%</span>
                      </td>
                      <td className="py-2 px-3 text-center text-sm font-semibold text-stone-700 tabular-nums">{row.pts.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <p className="text-xs text-stone-400 text-center pb-4">Regular season games only. Source: Squiggle API.</p>
    </div>
  );
}
