/**
 * buildAttendance.js
 *
 * Scrapes Footywire's attendance endpoint for all seasons,
 * collecting season totals and per-team averages.
 *
 * Usage: node server/scripts/buildAttendance.js
 * Output: public/attendance.json
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FIRST_YEAR = 1965;
const CURRENT_YEAR = 2025;
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

let lastRequest = 0;

async function fetchYear(year) {
  const elapsed = Date.now() - lastRequest;
  if (elapsed < 1200) await new Promise(r => setTimeout(r, 1200 - elapsed));
  lastRequest = Date.now();

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
  console.log(`Building attendance data ${FIRST_YEAR}–${CURRENT_YEAR}...\n`);

  const seasons = {};
  const failed = [];

  for (let year = FIRST_YEAR; year <= CURRENT_YEAR; year++) {
    process.stdout.write(`\r  ${year}  `);
    try {
      const html = await fetchYear(year);
      const rows = parseSortBy(html);

      let seasonTotal = 0, seasonGames = 0, seasonAvg = 0;
      const teams = [];

      for (const cells of rows) {
        const name = cells[0].replace(/^\s*/, '').trim();
        const games = parseNumber(cells[1]);
        const total = parseNumber(cells[2]);
        const avg   = parseNumber(cells[3]);

        if (name === 'ALL') {
          seasonGames = games;
          seasonTotal = total;
          seasonAvg   = avg;
        } else if (name && games > 0) {
          teams.push({ team: getTeamKey(name), name, games, total, avg });
        }
      }

      if (seasonGames === 0) {
        process.stdout.write(`(no data)\n`);
        continue;
      }

      seasons[year] = { year, games: seasonGames, total: seasonTotal, avg: seasonAvg, teams };
      process.stdout.write(`games=${seasonGames} avg=${seasonAvg.toLocaleString()}\n`);
    } catch (err) {
      failed.push(year);
      process.stdout.write(`FAILED: ${err.message}\n`);
    }
  }

  const output = {
    firstYear: Math.min(...Object.keys(seasons).map(Number)),
    lastYear: CURRENT_YEAR,
    generatedAt: new Date().toISOString(),
    failedYears: failed,
    seasons: Object.values(seasons).sort((a, b) => a.year - b.year),
  };

  const outPath = path.join(__dirname, '../../public/attendance.json');
  writeFileSync(outPath, JSON.stringify(output));
  console.log(`\nDone. ${output.seasons.length} seasons written to public/attendance.json`);
  if (failed.length) console.log(`Failed: ${failed.join(', ')}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
