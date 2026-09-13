import { getMcClellandRecords } from './_lib/live.js';

// GET /api/mcclelland?year=2026 — each club's AFL + AFLW record for a live season.
export default async function handler(req, res) {
  const currentYear = new Date().getFullYear();
  const year = Number.parseInt(req.query.year, 10) || currentYear;
  if (year < 2017 || year > currentYear + 1) {
    return res.status(400).json({ error: `Unsupported year: ${req.query.year}` });
  }

  try {
    const data = await getMcClellandRecords(year);
    // Cache at Vercel's edge so visitors don't each hit Squiggle and the AFL API.
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json(data);
  } catch (err) {
    console.error('mcclelland:', err);
    return res.status(502).json({ error: err.message });
  }
}
