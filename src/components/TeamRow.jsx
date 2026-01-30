import React from 'react';
import { getTeamInfo } from '../data/teams';

export default function TeamRow({ team, position }) {
  const teamInfo = getTeamInfo(team.team);

  const formatRecord = (wins, losses, draws) => {
    if (draws > 0) {
      return `${wins}-${losses}-${draws}`;
    }
    return `${wins}-${losses}`;
  };

  const aflRecord = formatRecord(team.aflWins, team.aflLosses, team.aflDraws);
  const aflwRecord = formatRecord(team.aflwWins, team.aflwLosses, team.aflwDraws);

  const aflPoints = (team.aflWins * 4) + (team.aflDraws * 2);
  const aflwPoints = (team.aflwWins * 8) + (team.aflwDraws * 4);

  // Highlight top 8 for finals qualification reference
  const isTopEight = position <= 8;

  return (
    <tr className={`team-row border-b border-gray-200 ${position === 8 ? 'finals-zone' : ''}`}>
      <td className="py-3 px-4 text-center font-bold text-gray-600 w-12">
        {position}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: teamInfo.colors.primary }}
          >
            {teamInfo.abbr.substring(0, 2)}
          </div>
          <span className={`font-medium ${isTopEight ? 'text-gray-900' : 'text-gray-600'}`}>
            {teamInfo.name}
          </span>
          {position === 1 && (
            <span className="text-yellow-500 text-lg" title="McClelland Trophy Leader">
              🏆
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <div className="text-sm">
          <span className="font-medium">{aflRecord}</span>
          <span className="text-gray-400 mx-1">·</span>
          <span className="text-blue-600">{aflPoints}pts</span>
        </div>
        <div className="text-xs text-gray-400">{team.aflPct.toFixed(1)}%</div>
      </td>
      <td className="py-3 px-4 text-center">
        <div className="text-sm">
          <span className="font-medium">{aflwRecord}</span>
          <span className="text-gray-400 mx-1">·</span>
          <span className="text-pink-600">{aflwPoints}pts</span>
        </div>
        <div className="text-xs text-gray-400">{team.aflwPct.toFixed(1)}%</div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className={`text-lg font-bold ${position <= 3 ? 'text-green-600' : 'text-gray-800'}`}>
          {team.mcClellandPoints}
        </span>
      </td>
      <td className="py-3 px-4 text-center text-sm text-gray-500">
        {team.combinedPct.toFixed(1)}%
      </td>
    </tr>
  );
}
