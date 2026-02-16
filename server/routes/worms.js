import { Router } from 'express';
import { getWorm, findMostSimilar, getTopSimilarPairs } from '../services/wormCache.js';
import { getTeamKey } from '../services/teamMap.js';

const router = Router();

// GET /api/matches/:matchId/worm
router.get('/matches/:matchId/worm', (req, res) => {
  const matchId = req.params.matchId;
  const entry = getWorm(matchId);

  if (!entry) {
    return res.status(404).json({ error: 'No worm data for this match' });
  }

  res.json({
    matchId: entry.matchId,
    season: entry.season,
    round: entry.round,
    homeTeam: getTeamKey(entry.homeTeam),
    awayTeam: getTeamKey(entry.awayTeam),
    homeTeamName: entry.homeTeam,
    awayTeamName: entry.awayTeam,
    worm: entry.worm,
    maxAbsMargin: entry.maxAbsMargin,
  });
});

// GET /api/matches/:matchId/similar
router.get('/matches/:matchId/similar', (req, res) => {
  const matchId = req.params.matchId;
  const result = findMostSimilar(matchId);

  if (!result) {
    return res.json({
      matchId: null,
      similarity: 0,
      message: 'No similar match found.',
    });
  }

  const m = result.match;
  res.json({
    matchId: result.matchId,
    season: m.season,
    round: m.round,
    homeTeam: getTeamKey(m.homeTeam),
    awayTeam: getTeamKey(m.awayTeam),
    homeTeamName: m.homeTeam,
    awayTeamName: m.awayTeam,
    worm: m.worm,
    similarity: result.score,
  });
});

// GET /api/mostsimilar
router.get('/mostsimilar', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const pairs = getTopSimilarPairs(limit);

  res.json({
    pairs: pairs.map((p) => ({
      score: p.score,
      matchA: {
        matchId: p.matchA.matchId,
        season: p.matchA.season,
        round: p.matchA.round,
        homeTeam: getTeamKey(p.matchA.homeTeam),
        awayTeam: getTeamKey(p.matchA.awayTeam),
        homeTeamName: p.matchA.homeTeam,
        awayTeamName: p.matchA.awayTeam,
      },
      matchB: {
        matchId: p.matchB.matchId,
        season: p.matchB.season,
        round: p.matchB.round,
        homeTeam: getTeamKey(p.matchB.homeTeam),
        awayTeam: getTeamKey(p.matchB.awayTeam),
        homeTeamName: p.matchB.homeTeam,
        awayTeamName: p.matchB.awayTeam,
      },
    })),
  });
});

export default router;
