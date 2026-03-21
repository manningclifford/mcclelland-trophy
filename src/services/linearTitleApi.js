// Loads the pre-built linear_title.json and provides year-by-year queries.
// Run `npm run build:linear-title` to generate the data file.

import { getTeamKey } from '../data/teams';

const SQUIGGLE_API = 'https://api.squiggle.com.au';

let cache = null;

async function loadData() {
  if (cache) return cache;
  const res = await fetch(`${import.meta.env.BASE_URL}linear_title.json`);
  if (!res.ok) {
    throw new Error(
      'Linear title data not found. Run `npm run build:linear-title` to generate it.'
    );
  }
  cache = await res.json();
  return cache;
}

export async function getLinearTitleMeta() {
  const data = await loadData();
  return {
    currentHolder: data.currentHolder,
    currentDefenses: data.currentDefenses,
    totalChanges: data.totalChanges,
    firstYear: data.firstYear,
    lastYear: data.lastYear,
    teamStats: data.teamStats,
  };
}


export async function getAllEvents() {
  const data = await loadData();
  return data.events;
}

export async function getNextContentionGame(holderKey) {
  const year = new Date().getFullYear();
  const res = await fetch(`${SQUIGGLE_API}/?q=games;year=${year}`);
  if (!res.ok) throw new Error(`Squiggle error: ${res.status}`);
  const { games = [] } = await res.json();

  const upcoming = games
    .filter(g => {
      if (g.complete === 100) return false;
      const homeKey = getTeamKey(g.hteam);
      const awayKey = getTeamKey(g.ateam);
      return homeKey === holderKey || awayKey === holderKey;
    })
    .sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.round - b.round);

  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const homeKey = getTeamKey(next.hteam);
  const awayKey = getTeamKey(next.ateam);
  const isHome = homeKey === holderKey;

  return {
    round: next.round,
    roundName: next.roundname || `Round ${next.round}`,
    date: next.date || null,
    venue: next.venue || null,
    isHome,
    opponentKey: isHome ? awayKey : homeKey,
    opponentName: isHome ? next.ateam : next.hteam,
  };
}
