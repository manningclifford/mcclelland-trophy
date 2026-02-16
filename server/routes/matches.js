import { Router } from 'express';
import { getSeasons, getRounds, getMatches, getAllWorms } from '../services/wormCache.js';
import { getTeamKey } from '../services/teamMap.js';

const router = Router();

// GET /api/seasons
router.get('/seasons', (req, res) => {
  res.json({ seasons: getSeasons() });
});

// GET /api/seasons/:year/rounds
router.get('/seasons/:year/rounds', (req, res) => {
  const year = parseInt(req.params.year, 10);
  if (isNaN(year)) return res.status(400).json({ error: 'Invalid year' });
  res.json({ rounds: getRounds(year) });
});

// GET /api/seasons/:year/rounds/:round/matches
router.get('/seasons/:year/rounds/:round/matches', (req, res) => {
  const year = parseInt(req.params.year, 10);
  const round = parseInt(req.params.round, 10);
  if (isNaN(year) || isNaN(round)) return res.status(400).json({ error: 'Invalid params' });

  const matches = getMatches(year, round);
  res.json({
    matches: matches.map((m) => ({
      id: m.matchId,
      homeTeam: getTeamKey(m.homeTeam),
      awayTeam: getTeamKey(m.awayTeam),
      homeTeamName: m.homeTeam,
      awayTeamName: m.awayTeam,
      homeScore: m.worm[m.worm.length - 1]?.margin > 0
        ? null : null, // We don't have separate scores, just margin
      awayScore: null,
      finalMargin: m.worm[m.worm.length - 1]?.margin,
    })),
  });
});

// GET /api/random
router.get('/random', (req, res) => {
  const all = getAllWorms();
  if (all.length === 0) return res.status(404).json({ error: 'No worms loaded' });
  const pick = all[Math.floor(Math.random() * all.length)];
  res.json({
    matchId: pick.matchId,
    season: pick.season,
    round: pick.round,
  });
});

export default router;
