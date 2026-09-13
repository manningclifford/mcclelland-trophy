import { ALL_TEAMS, getShieldSchedule } from './_lib/live.js';

// GET /api/shield?holder=sydney — the Brunswick St Belt holder's last and next games.
export default async function handler(req, res) {
  const { holder } = req.query;
  if (!ALL_TEAMS.includes(holder)) {
    return res.status(400).json({ error: `Unknown team: ${holder}` });
  }

  try {
    const data = await getShieldSchedule(holder, new Date().getFullYear());
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json(data);
  } catch (err) {
    console.error('shield:', err);
    return res.status(502).json({ error: err.message });
  }
}
