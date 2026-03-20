import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { teams } from '../../data/teams';

export default function WormChart({ wormData, homeTeam, awayTeam, title }) {
  const homeInfo = teams[homeTeam] || { name: homeTeam, colors: { primary: '#3b82f6' } };
  const awayInfo = teams[awayTeam] || { name: awayTeam, colors: { primary: '#999' } };

  return (
    <div className="bg-white border border-stone-200 p-4">
      {title && (
        <h3 className="text-sm font-semibold text-stone-700 mb-3 text-center">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={wormData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
          <XAxis
            dataKey="time"
            label={{ value: 'Game Time (min)', position: 'insideBottom', offset: -2, fontSize: 12 }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            label={{ value: 'Margin', angle: -90, position: 'insideLeft', fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [`${value > 0 ? '+' : ''}${value}`, 'Margin']}
            labelFormatter={(label) => `${label} min`}
          />
          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="margin"
            stroke={homeInfo.colors.primary}
            strokeWidth={2}
            dot={false}
            name={`+ ${homeInfo.name} / − ${awayInfo.name}`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
