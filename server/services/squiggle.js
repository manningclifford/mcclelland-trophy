const SQUIGGLE_API = 'https://api.squiggle.com.au';
const USER_AGENT = 'WormSimilarity (github.com/manning/mcclelland-trophy)';

// Rate limiting: max 1 request per second
let lastRequestTime = 0;

async function rateLimitedFetch(url) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1000) {
    await new Promise((r) => setTimeout(r, 1000 - elapsed));
  }
  lastRequestTime = Date.now();

  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`Squiggle API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchGames(year, round) {
  let url = `${SQUIGGLE_API}/?q=games;year=${year}`;
  if (round) url += `;round=${round}`;
  const data = await rateLimitedFetch(url);
  return data.games || [];
}

export async function fetchGameById(gameId) {
  const url = `${SQUIGGLE_API}/?q=games;game=${gameId}`;
  const data = await rateLimitedFetch(url);
  return data.games?.[0] || null;
}
