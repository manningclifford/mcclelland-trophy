let cache = null;

export async function loadAttendance() {
  if (cache) return cache;
  const res = await fetch(`${import.meta.env.BASE_URL}attendance.json`);
  if (!res.ok) throw new Error('Attendance data not found. Run `npm run build:attendance` to generate it.');
  cache = await res.json();
  return cache;
}

export async function getSeasonTrend() {
  const data = await loadAttendance();
  return data.seasons.map(s => ({ year: s.year, avg: s.avg, total: s.total, games: s.games }));
}

export async function getTeamAttendance(year) {
  const data = await loadAttendance();
  const season = data.seasons.find(s => s.year === year);
  return season ? season.teams : [];
}

export async function getAvailableYears() {
  const data = await loadAttendance();
  return data.seasons.map(s => s.year).sort((a, b) => b - a);
}
