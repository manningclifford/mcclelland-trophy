// Loads the pre-built linear_title.json and provides year-by-year queries.
// Run `npm run build:linear-title` to generate the data file.

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
