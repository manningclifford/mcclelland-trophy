const API_BASE = '/api';

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchSeasons() {
  const data = await apiFetch('/seasons');
  return data.seasons;
}

export async function fetchRounds(season) {
  const data = await apiFetch(`/seasons/${season}/rounds`);
  return data.rounds;
}

export async function fetchMatches(season, round) {
  const data = await apiFetch(`/seasons/${season}/rounds/${round}/matches`);
  return data.matches;
}

export async function fetchWorm(matchId) {
  return apiFetch(`/matches/${matchId}/worm`);
}

export async function fetchSimilar(matchId) {
  return apiFetch(`/matches/${matchId}/similar`);
}

export async function fetchRandom() {
  return apiFetch('/random');
}

export async function fetchMostSimilar(limit = 50) {
  const data = await apiFetch(`/mostsimilar?limit=${limit}`);
  return data.pairs;
}
