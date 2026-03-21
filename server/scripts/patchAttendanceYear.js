/**
 * patchAttendanceYear.js
 *
 * Fetches attendance data for a single year from Footywire and upserts it
 * into public/attendance.json. Much faster than a full rebuild.
 *
 * Usage: node server/scripts/patchAttendanceYear.js [year]
 *        year defaults to current year
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, '../../public/attendance.json');
const TARGET_YEAR = parseInt(process.argv[2] || new Date().getFullYear(), 10);
const USER_AGENT = 'SherrinSpreadsheets/Attendance (github.com/manning/mcclelland-trophy)';

const TEAM_NAME_MAP = {
  'Adelaide Crows': 'adelaide',
  'Brisbane Lions': 'brisbane', 'Brisbane Bears': 'brisbane',
  'Carlton Blues': 'carlton',
  'Collingwood Magpies': 'collingwood',
  'Essendon Bombers': 'essendon',
  'Fremantle Dockers': 'fremantle',
  'Geelong Cats': 'geelong',
  'Gold Coast Suns': 'goldcoast',
  'GWS Giants': 'gws', 'Greater Western Sydney Giants': 'gws',
  'Hawthorn Hawks': 'hawthorn',
  'Melbourne Demons': 'melbourne',
  'North Melbourne Kangaroos': 'northmelbourne', 'Kangaroos': 'northmelbourne',
  'Port Adelaide Power': 'portadelaide',
  'Richmond Tigers': 'richmond',
  'St Kilda Saints': 'stkilda',
  'Sydney Swans': 'sydney', 'South Melbourne Swans': 'sydney', 'South Melbourne': 'sydney',
  'West Coast Eagles': 'westcoast',
  'Western Bulldogs': 'westernbulldogs',
  'Fitzroy Lions': 'fitzroy',
  'University Blues': 'university',
};

function getTeamKey(name) {
  return TEAM_NAME_MAP[name] || name.toLowerCase().replace(/\s+/g, '');
}

function parseNumber(str) {
  return parseInt(str.replace(/,/g, '').trim(), 10) || 0;
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseSortBy(html) {
  const rows = [];
  const trRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
  let match;
  while ((match = trRegex.exec(html)) !== null) {
    const cells = [];
    const tdRegex = /<td[^>]*>(.*?)<\/td>/gs;
    let tdMatch;
    while ((tdMatch = tdRegex.exec(match[1])) !== null) {
      cells.push(stripTags(tdMatch[1]));
    }
    if (cells.length >= 4) rows.push(cells);
  }
  return rows;
}

async function fetchYear(year) {
  const params = new URLSearchParams({
    sby: '1', template: 'attendances', advv: 'N', skipImg: 'Y',
    year: String(year), t: 'A', h: 'A', s: 'T',
  });
  const res = await fetch('https://www.footywire.com/afl/json/json-sort-stats-attendances.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
      'Referer': `https://www.footywire.com/afl/footy/attendances?year=${year}&t=A&h=A&s=T`,
    },
    body: params.toString(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.sortBy || '';
}

async function main() {
  console.log(`Patching attendance for ${TARGET_YEAR}...`);

  const html = await fetchYear(TARGET_YEAR);
  const rows = parseSortBy(html);

  let seasonTotal = 0, seasonGames = 0, seasonAvg = 0;
  const teams = [];

  for (const cells of rows) {
    const name = cells[0].replace(/^\s*/, '').trim();
    const games = parseNumber(cells[1]);
    const total = parseNumber(cells[2]);
    const avg   = parseNumber(cells[3]);
    if (name === 'ALL') {
      seasonGames = games; seasonTotal = total; seasonAvg = avg;
    } else if (name && games > 0) {
      teams.push({ team: getTeamKey(name), name, games, total, avg });
    }
  }

  if (seasonGames === 0) {
    console.log('No data returned for this year — nothing to update.');
    return;
  }

  const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
  const idx = cache.seasons.findIndex(s => s.year === TARGET_YEAR);
  const entry = { year: TARGET_YEAR, games: seasonGames, total: seasonTotal, avg: seasonAvg, teams };

  if (idx >= 0) {
    cache.seasons[idx] = entry;
    console.log(`Updated existing ${TARGET_YEAR} entry.`);
  } else {
    cache.seasons.push(entry);
    cache.seasons.sort((a, b) => a.year - b.year);
    cache.lastYear = Math.max(cache.lastYear, TARGET_YEAR);
    console.log(`Added new ${TARGET_YEAR} entry.`);
  }

  cache.generatedAt = new Date().toISOString();
  writeFileSync(CACHE_PATH, JSON.stringify(cache));
  console.log(`Done. games=${seasonGames} avg=${seasonAvg.toLocaleString()}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
