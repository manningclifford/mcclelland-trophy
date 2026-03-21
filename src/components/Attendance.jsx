import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine,
} from 'recharts';
import { getSeasonTrend, getTeamAttendance, getAvailableYears } from '../services/attendanceApi';
import { getTeamInfo } from '../data/teams';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-300 px-2 py-1 text-xs shadow-sm">
      <span className="font-semibold text-stone-700">{label}</span>
      <span className="ml-2 text-stone-900">{Number(payload[0].value).toLocaleString()}</span>
    </div>
  );
}

export default function Attendance() {
  const [trend, setTrend] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [teamData, setTeamData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSeasonTrend(), getAvailableYears()])
      .then(([t, y]) => {
        setTrend(t);
        setYears(y);
        setSelectedYear(y[0]);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedYear === null) return;
    getTeamAttendance(selectedYear).then(setTeamData).catch(() => {});
  }, [selectedYear]);

  if (error) {
    return (
      <div className="bg-stone-50 border border-stone-200 p-8 text-center">
        <p className="text-stone-700 font-semibold mb-2">Data not available</p>
        <p className="text-stone-600 text-sm">{error}</p>
        <p className="text-stone-500 text-xs mt-3">
          Run <code className="bg-stone-100 px-1">npm run build:attendance</code> to generate the data file.
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

  const peakSeason = trend.reduce((best, s) => s.avg > (best?.avg ?? 0) ? s : best, null);
  const latestSeason = trend[trend.length - 1];

  return (
    <div className="space-y-10">
      <p className="text-stone-500 leading-relaxed">
        Average crowd figures for every VFL/AFL season since 1965, scraped from Footywire.
        Explore how attendance has grown, dipped, and shifted across grounds and clubs over six decades.
      </p>

      {/* Season trend chart */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-stone-200" />
          <h2 className="display-font text-lg font-bold text-stone-700 uppercase tracking-widest">Average Crowd per Game</h2>
          <div className="h-px flex-1 bg-stone-200" />
        </div>

        <div className="bg-white border border-stone-200 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {latestSeason && (
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider">{latestSeason.year} Average</p>
                <p className="display-font text-2xl font-black text-stone-900 mt-0.5">{latestSeason.avg.toLocaleString()}</p>
              </div>
            )}
            {peakSeason && (
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider">Peak Season</p>
                <p className="display-font text-2xl font-black text-stone-900 mt-0.5">{peakSeason.avg.toLocaleString()}</p>
                <p className="text-xs text-stone-400 mt-0.5">{peakSeason.year}</p>
              </div>
            )}
            {latestSeason && (
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider">{latestSeason.year} Total</p>
                <p className="display-font text-2xl font-black text-stone-900 mt-0.5">{(latestSeason.total / 1_000_000).toFixed(2)}M</p>
              </div>
            )}
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="#e7e5e4" />
              <Line
                type="monotone" dataKey="avg" stroke="#1c1917"
                strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#1c1917' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-stone-400 text-center mt-1">Average attendance per home-and-away game</p>
        </div>
      </section>

      {/* Per-team breakdown */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-stone-200" />
          <h2 className="display-font text-lg font-bold text-stone-700 uppercase tracking-widest">By Club</h2>
          <div className="h-px flex-1 bg-stone-200" />
        </div>

        <div className="bg-white border border-stone-200">
          <div className="bg-stone-50 border-b border-stone-200 px-5 py-3 flex items-center justify-between gap-4">
            <span className="text-sm text-stone-600">Season</span>
            <select
              value={selectedYear ?? ''}
              onChange={e => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-1.5 border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              <option value="all">All time</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="py-2 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">#</th>
                  <th className="py-2 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Club</th>
                  <th className="py-2 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Games</th>
                  <th className="py-2 px-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Total</th>
                  <th className="py-2 px-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Average</th>
                  <th className="py-2 px-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider w-48">
                    <span className="sr-only">Bar</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...teamData]
                  .sort((a, b) => b.avg - a.avg)
                  .map((row, idx) => {
                    const info = getTeamInfo(row.team);
                    const maxAvg = Math.max(...teamData.map(r => r.avg));
                    const barPct = maxAvg > 0 ? (row.avg / maxAvg) * 100 : 0;
                    return (
                      <tr key={row.team} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="py-2 px-4 text-xs text-stone-400 tabular-nums">{idx + 1}</td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: info.colors.primary }} />
                            <span className="text-sm font-medium text-stone-800">{info.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-4 text-center text-sm text-stone-500 tabular-nums">{row.games}</td>
                        <td className="py-2 px-4 text-right text-sm text-stone-600 tabular-nums">{row.total.toLocaleString()}</td>
                        <td className="py-2 px-4 text-right text-sm font-semibold text-stone-900 tabular-nums">{row.avg.toLocaleString()}</td>
                        <td className="py-2 px-4">
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${barPct}%`, backgroundColor: info.colors.primary, opacity: 0.7 }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="text-xs text-stone-400 text-center pb-4 space-y-1">
        <p>Includes home-and-away games and finals. Source: Footywire.</p>
        <p>* South Melbourne (renamed the Sydney Swans in 1982) is combined under Sydney.</p>
      </div>
    </div>
  );
}
