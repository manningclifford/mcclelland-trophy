let cache = null;

export async function loadGameEvolution() {
  if (cache) return cache;
  const res = await fetch(`${import.meta.env.BASE_URL}game_evolution.json?v=${Date.now()}`);
  if (!res.ok) {
    throw new Error(
      'Game evolution data not found. Run `npm run build:game-evolution` to generate it.'
    );
  }
  cache = await res.json();
  return cache;
}
