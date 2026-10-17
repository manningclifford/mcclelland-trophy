import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip, LabelList,
} from 'recharts';
import TeamLogo from './TeamLogo';
import { getTeamInfo } from '../data/teams';
import DataTimestamp from './DataTimestamp';

// Reads public/predictions.json, produced overnight by scripts/simulateSeason.js
// on the hub. Shows Monte Carlo McClelland Trophy / finals / belt probabilities.

function pct(v) {
  if (v == null) return '—';
  const p = v * 100;
  if (p > 0 && p < 0.1) return '<0.1%';
  if (p > 99.9 && p < 100) return '>99.9%';
  return `${p.toFixed(1)}%`;
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-stone-300 px-3 py-2 text-xs shadow-sm">
      <div className="font-semibold text-stone-700">{d.name}</div>
      <div className="text-stone-900 mt-0.5">McClelland Trophy: {pct(d.mcClelland)}</div>
      <div className="text-stone-500">Top 4: {pct(d.top4)} · Top 8: {pct(d.top8)}</div>
    </div>
  );
}

export default function Predictions() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}predictions.json?v=${Date.now()}`)
      .then((r) => {
        if (!r.ok) throw new Error('not-generated');
        return r.json();
      })
      .then(setData)
      .catch(() => setError('not-generated'));
  }, []);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="display-font text-2xl font-bold text-stone-800 mb-3">Season Predictions</h1>
        <p className="text-stone-500">
          Predictions haven’t been generated yet. The overnight simulator
          (<code className="text-stone-600">scripts/simulateSeason.js</code>) writes
          <code className="text-stone-600"> public/predictions.json</code> from the hub.
        </p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-16 text-stone-400">Loading predictions…</div>;
  }

  // Chart data: teams with any realistic McClelland chance, else the top 10.
  const chartTeams = data.teams
    .filter((t) => t.mcClelland > 0.001)
    .map((t) => ({ ...t, name: getTeamInfo(t.team).name, value: +(t.mcClelland * 100).toFixed(1) }));
  const chart = chartTeams.length ? chartTeams : data.teams.slice(0, 10)
    .map((t) => ({ ...t, name: getTeamInfo(t.team).name, value: +(t.mcClelland * 100).toFixed(1) }));

  const m = data.model || {};

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="display-font text-3xl font-bold text-stone-800">Season Predictions</h1>
        <p className="text-stone-500 mt-2 max-w-2xl mx-auto">
          {data.simulations.toLocaleString()} Monte Carlo simulations of the remaining{' '}
          {data.remainingGames} games of the {data.year} home-and-away season.
        </p>
      </div>

      {/* McClelland Trophy odds bar chart */}
      <section>
        <h2 className="display-font text-lg font-bold text-stone-700 uppercase tracking-widest text-center mb-1">
          McClelland Trophy odds
        </h2>
        <p className="text-xs text-stone-400 text-center mb-6">
          Probability of finishing minor premier (1st on the ladder)
        </p>
        <ResponsiveContainer width="100%" height={Math.max(220, chart.length * 42)}>
          <BarChart data={chart} layout="vertical" margin={{ left: 8, right: 48, top: 4, bottom: 4 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fontSize: 12, fill: '#57534e' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]}>
              {chart.map((t) => (
                <Cell key={t.team} fill={getTeamInfo(t.team).colors.primary} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v) => `${v}%`}
                style={{ fontSize: 11, fill: '#78716c' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Full probability table */}
      <section className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-stone-200">
              <th className="text-left py-2 pl-2">#</th>
              <th className="text-left py-2">Team</th>
              <th className="text-right py-2">Pts</th>
              <th className="text-right py-2">McClelland</th>
              <th className="text-right py-2">Top 4</th>
              <th className="text-right py-2">Top 8</th>
              <th className="text-right py-2 pr-2">Belt</th>
            </tr>
          </thead>
          <tbody>
            {data.teams.map((t) => (
              <tr key={t.team} className="border-b border-stone-100">
                <td className="py-2 pl-2 text-stone-400 tabular-nums">{t.currentRank}</td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <TeamLogo teamKey={t.team} size="sm" />
                    <span className="text-stone-700">{getTeamInfo(t.team).name}</span>
                    {data.currentHolder === t.team && (
                      <span className="text-[10px] uppercase tracking-wide text-amber-700 bg-amber-100 rounded px-1">Belt</span>
                    )}
                  </div>
                </td>
                <td className="py-2 text-right tabular-nums text-stone-500">{t.currentPoints}</td>
                <td className="py-2 text-right tabular-nums font-semibold text-stone-800">{pct(t.mcClelland)}</td>
                <td className="py-2 text-right tabular-nums text-stone-600">{pct(t.top4)}</td>
                <td className="py-2 text-right tabular-nums text-stone-600">{pct(t.top8)}</td>
                <td className="py-2 pr-2 text-right tabular-nums text-stone-600">{pct(t.holdsBeltAtEnd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Methodology note */}
      <div className="text-xs text-stone-400 max-w-2xl mx-auto text-center space-y-1">
        <p>
          Each game’s margin is modelled as{' '}
          <span className="text-stone-500">{m.k}·Δ(power rating) + {m.homeGroundAdvantage} + noise (SD {m.residualSD})</span>,
          calibrated on {m.calibrationGames} completed {data.year} games. “Belt” is the chance a
          team holds the Brunswick St Belt at the end of the home-and-away season.
        </p>
      </div>

      <DataTimestamp generatedAt={data.generatedAt} />
    </div>
  );
}
