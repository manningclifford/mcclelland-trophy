const AFL_API_BASE = 'https://api.afl.com.au';

let cachedToken = null;
let tokenExpiry = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const res = await fetch(`${AFL_API_BASE}/cfs/afl/WMCTok`, {
      method: 'POST',
      headers: {
        'x-media-mis-token': 'dummy',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Token request failed: ${res.status}`);
    }

    const data = await res.json();
    cachedToken = data.token;
    // Expire 30 min before actual expiry for safety
    tokenExpiry = Date.now() + 30 * 60 * 1000;
    return cachedToken;
  } catch (err) {
    console.error('AFL API token fetch failed:', err.message);
    return null;
  }
}

export async function fetchScoreWorm(matchId) {
  try {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch(`${AFL_API_BASE}/cfs/afl/matchItem/${matchId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const scoreWorm = data?.score?.scoreWorm;

    if (!scoreWorm || !Array.isArray(scoreWorm)) return null;

    // Normalize to { time, margin } array
    return scoreWorm.map((point) => ({
      time: point.periodSeconds || point.time || 0,
      margin: point.homeTotal - point.awayTotal,
    }));
  } catch (err) {
    console.error('AFL API scoreWorm fetch failed:', err.message);
    return null;
  }
}
