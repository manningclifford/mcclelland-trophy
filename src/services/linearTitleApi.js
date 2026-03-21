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

export async function getShieldSchedule(holderKey) {
  const year = new Date().getFullYear();
  const res = await fetch(`${SQUIGGLE_API}/?q=games;year=${year}`);
  if (!res.ok) throw new Error(`Squiggle error: ${res.status}`);
  const { games = [] } = await res.json();

  const holderGames = games.filter(g => {
    if (!g.hteam || !g.ateam) return false;
    const homeKey = getTeamKey(g.hteam);
    const awayKey = getTeamKey(g.ateam);
    return homeKey === holderKey || awayKey === holderKey;
  });

  // Most recent completed game = last defense
  const completed = holderGames
    .filter(g => g.complete === 100)
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.round - a.round);

  let lastDefense = null;
  if (completed.length > 0) {
    const g = completed[0];
    const isHome = getTeamKey(g.hteam) === holderKey;
    lastDefense = {
      round: g.round,
      roundName: g.roundname || `Round ${g.round}`,
      isHome,
      opponentKey: isHome ? getTeamKey(g.ateam) : getTeamKey(g.hteam),
      opponentName: isHome ? g.ateam : g.hteam,
      holderScore: isHome ? g.hscore : g.ascore,
      opponentScore: isHome ? g.ascore : g.hscore,
    };
  }

  // Next upcoming game
  const upcoming = holderGames
    .filter(g => g.complete < 100)
    .sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.round - b.round);

  let nextGame = null;
  if (upcoming.length > 0) {
    const g = upcoming[0];
    const isHome = getTeamKey(g.hteam) === holderKey;
    nextGame = {
      round: g.round,
      roundName: g.roundname || `Round ${g.round}`,
      date: g.date || null,
      venue: g.venue || null,
      isHome,
      opponentKey: isHome ? getTeamKey(g.ateam) : getTeamKey(g.hteam),
      opponentName: isHome ? g.ateam : g.hteam,
    };
  }

  return { nextGame, lastDefense };
}
