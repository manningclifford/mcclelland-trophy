let cache = null;

// South Melbourne became the Sydney Swans in 1982; merge historical key.
function normaliseTeamKey(key) {
  return key === 'southmelbourneswans' ? 'sydney' : key;
}

export async function loadAttendance() {
  if (cache) return cache;
  const res = await fetch(`${import.meta.env.BASE_URL}attendance.json`);
  if (!res.ok) throw new Error('Attendance data not found. Run `npm run build:attendance` to generate it.');
  const raw = await res.json();
  // Normalise any legacy southmelbourneswans entries into sydney.
  for (const season of raw.seasons) {
    season.teams = season.teams.map(t => ({ ...t, team: normaliseTeamKey(t.team) }));
  }
  cache = raw;
  return cache;
}

export async function getSeasonTrend() {
  const data = await loadAttendance();
  return data.seasons
    .filter(s => s.year <= 2025)
    .map(s => ({ year: s.year, avg: s.avg, total: s.total, games: s.games }));
}

export async function getTeamAttendance(year) {
  const data = await loadAttendance();
  if (year === 'all') {
    const totals = {};
    for (const season of data.seasons.filter(s => s.year <= 2025)) {
      for (const t of season.teams) {
        if (!totals[t.team]) totals[t.team] = { team: t.team, name: t.name, games: 0, total: 0 };
        totals[t.team].games += t.games;
        totals[t.team].total += t.total;
      }
    }
    return Object.values(totals).map(t => ({
      ...t,
      avg: t.games > 0 ? Math.round(t.total / t.games) : 0,
    }));
  }
  const season = data.seasons.find(s => s.year === year);
  return season ? season.teams : [];
}

export async function getAvailableYears() {
  const data = await loadAttendance();
  return data.seasons.filter(s => s.year <= 2025).map(s => s.year).sort((a, b) => b - a);
}
