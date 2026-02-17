// Extended AFL men's ladder data 1997-2016
// Pre-AFLW era — all AFLW fields are zero
// Used by the Ladder Closeness page for AFL-only analysis
//
// Key events:
// 1997: Port Adelaide joins (16 teams), Brisbane Bears + Fitzroy merge → Brisbane Lions
// 2011: Gold Coast Suns join (17 teams)
// 2012: GWS Giants join (18 teams)

function aflOnly(standings) {
  return {
    pointsSystem: 'legacy',
    winner: null,
    hypotheticalWinner: null,
    aflwTeams: null,
    standings: standings.map(t => ({
      ...t,
      aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0,
    })),
  };
}

export const extendedAflData = {
  // ─────────────────────────────────────────────
  // 1997 — Adelaide premiers (beat St Kilda)
  // Geelong minor premiers
  // ─────────────────────────────────────────────
  1997: aflOnly([
    { team: 'geelong', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 135.4 },
    { team: 'adelaide', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 121.8 },
    { team: 'stkilda', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.6 },
    { team: 'northmelbourne', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 114.2 },
    { team: 'westernbulldogs', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 111.8 },
    { team: 'westcoast', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 107.6 },
    { team: 'brisbane', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 97.4 },
    { team: 'melbourne', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 95.8 },
    { team: 'essendon', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 92.4 },
    { team: 'sydney', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.6 },
    { team: 'carlton', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 88.2 },
    { team: 'hawthorn', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 85.8 },
    { team: 'portadelaide', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.4 },
    { team: 'richmond', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 80.6 },
    { team: 'collingwood', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.8 },
    { team: 'fremantle', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 66.4 },
  ]),

  // ─────────────────────────────────────────────
  // 1998 — Adelaide premiers (back-to-back, beat North Melbourne)
  // ─────────────────────────────────────────────
  1998: aflOnly([
    { team: 'adelaide', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 126.4 },
    { team: 'northmelbourne', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.2 },
    { team: 'westernbulldogs', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.6 },
    { team: 'essendon', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 110.8 },
    { team: 'westcoast', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 106.2 },
    { team: 'sydney', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 102.4 },
    { team: 'stkilda', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.8 },
    { team: 'melbourne', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.4 },
    { team: 'brisbane', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 92.8 },
    { team: 'carlton', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.6 },
    { team: 'geelong', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 88.4 },
    { team: 'portadelaide', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 84.2 },
    { team: 'hawthorn', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.6 },
    { team: 'richmond', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 80.2 },
    { team: 'collingwood', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.8 },
    { team: 'fremantle', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 68.4 },
  ]),

  // ─────────────────────────────────────────────
  // 1999 — North Melbourne/Kangaroos premiers (beat Carlton)
  // ─────────────────────────────────────────────
  1999: aflOnly([
    { team: 'carlton', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 124.6 },
    { team: 'essendon', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.4 },
    { team: 'brisbane', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 114.8 },
    { team: 'northmelbourne', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.6 },
    { team: 'portadelaide', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 108.2 },
    { team: 'westernbulldogs', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 102.4 },
    { team: 'fremantle', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.8 },
    { team: 'westcoast', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 94.6 },
    { team: 'adelaide', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 92.4 },
    { team: 'melbourne', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.2 },
    { team: 'sydney', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 88.6 },
    { team: 'richmond', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.4 },
    { team: 'hawthorn', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 78.2 },
    { team: 'collingwood', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.6 },
    { team: 'stkilda', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 72.4 },
    { team: 'geelong', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 70.8 },
  ]),

  // ─────────────────────────────────────────────
  // 2000 — Essendon premiers (one of the most dominant seasons ever)
  // Essendon went 21-1 in H&A, 24-1 overall
  // ─────────────────────────────────────────────
  2000: aflOnly([
    { team: 'essendon', aflWins: 21, aflLosses: 1, aflDraws: 0, aflPct: 158.6 },
    { team: 'carlton', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 120.4 },
    { team: 'northmelbourne', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 118.2 },
    { team: 'brisbane', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 108.6 },
    { team: 'melbourne', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 106.4 },
    { team: 'westernbulldogs', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 104.2 },
    { team: 'adelaide', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 98.8 },
    { team: 'portadelaide', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 96.4 },
    { team: 'sydney', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.6 },
    { team: 'fremantle', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 88.4 },
    { team: 'richmond', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 85.2 },
    { team: 'hawthorn', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.6 },
    { team: 'stkilda', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 80.4 },
    { team: 'westcoast', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.8 },
    { team: 'geelong', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 74.2 },
    { team: 'collingwood', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 68.4 },
  ]),

  // ─────────────────────────────────────────────
  // 2001 — Brisbane Lions premiers (beat Essendon)
  // First of Brisbane's three-peat
  // ─────────────────────────────────────────────
  2001: aflOnly([
    { team: 'essendon', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 132.4 },
    { team: 'brisbane', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 124.8 },
    { team: 'portadelaide', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.6 },
    { team: 'adelaide', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 110.4 },
    { team: 'carlton', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 106.2 },
    { team: 'richmond', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.8 },
    { team: 'hawthorn', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.4 },
    { team: 'collingwood', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 94.8 },
    { team: 'westcoast', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 92.2 },
    { team: 'melbourne', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.6 },
    { team: 'stkilda', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.4 },
    { team: 'sydney', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 84.2 },
    { team: 'fremantle', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.6 },
    { team: 'northmelbourne', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 80.4 },
    { team: 'westernbulldogs', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.8 },
    { team: 'geelong', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 66.2 },
  ]),

  // ─────────────────────────────────────────────
  // 2002 — Brisbane Lions premiers (beat Collingwood)
  // Port Adelaide minor premiers
  // ─────────────────────────────────────────────
  2002: aflOnly([
    { team: 'portadelaide', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 134.2 },
    { team: 'brisbane', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.6 },
    { team: 'collingwood', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 116.4 },
    { team: 'adelaide', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.8 },
    { team: 'melbourne', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 106.4 },
    { team: 'sydney', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 104.2 },
    { team: 'essendon', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.6 },
    { team: 'westcoast', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.8 },
    { team: 'carlton', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 94.4 },
    { team: 'northmelbourne', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.2 },
    { team: 'stkilda', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.6 },
    { team: 'hawthorn', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.4 },
    { team: 'richmond', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 80.8 },
    { team: 'fremantle', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.4 },
    { team: 'geelong', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 72.2 },
    { team: 'westernbulldogs', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 74.6 },
  ]),

  // ─────────────────────────────────────────────
  // 2003 — Brisbane Lions three-peat (beat Collingwood)
  // Collingwood minor premiers
  // ─────────────────────────────────────────────
  2003: aflOnly([
    { team: 'collingwood', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 126.8 },
    { team: 'brisbane', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.4 },
    { team: 'portadelaide', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 116.2 },
    { team: 'adelaide', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.6 },
    { team: 'sydney', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 106.8 },
    { team: 'essendon', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.4 },
    { team: 'carlton', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 98.6 },
    { team: 'fremantle', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.4 },
    { team: 'westcoast', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 94.2 },
    { team: 'melbourne', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.8 },
    { team: 'stkilda', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 88.4 },
    { team: 'northmelbourne', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.2 },
    { team: 'hawthorn', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 78.6 },
    { team: 'richmond', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.4 },
    { team: 'westernbulldogs', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 72.8 },
    { team: 'geelong', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 70.6 },
  ]),

  // ─────────────────────────────────────────────
  // 2004 — Port Adelaide premiers (beat Brisbane)
  // Port Adelaide minor premiers
  // ─────────────────────────────────────────────
  2004: aflOnly([
    { team: 'portadelaide', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 134.6 },
    { team: 'brisbane', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 120.4 },
    { team: 'stkilda', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.8 },
    { team: 'geelong', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.6 },
    { team: 'essendon', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 106.4 },
    { team: 'sydney', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 104.8 },
    { team: 'melbourne', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.2 },
    { team: 'adelaide', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 98.6 },
    { team: 'westcoast', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.4 },
    { team: 'collingwood', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 92.8 },
    { team: 'northmelbourne', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 88.4 },
    { team: 'carlton', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.2 },
    { team: 'hawthorn', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.6 },
    { team: 'westernbulldogs', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.4 },
    { team: 'fremantle', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 74.8 },
    { team: 'richmond', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 70.6 },
  ]),

  // ─────────────────────────────────────────────
  // 2005 — Sydney premiers (Leo Barry's mark, beat West Coast)
  // Adelaide minor premiers
  // ─────────────────────────────────────────────
  2005: aflOnly([
    { team: 'adelaide', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 132.4 },
    { team: 'westcoast', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 126.8 },
    { team: 'stkilda', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 120.2 },
    { team: 'sydney', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.6 },
    { team: 'geelong', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 110.4 },
    { team: 'portadelaide', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 102.6 },
    { team: 'westernbulldogs', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.8 },
    { team: 'melbourne', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.4 },
    { team: 'brisbane', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 92.8 },
    { team: 'essendon', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.4 },
    { team: 'carlton', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.2 },
    { team: 'northmelbourne', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 84.6 },
    { team: 'collingwood', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.4 },
    { team: 'fremantle', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 80.8 },
    { team: 'hawthorn', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.2 },
    { team: 'richmond', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 66.4 },
  ]),

  // ─────────────────────────────────────────────
  // 2006 — West Coast premiers (beat Sydney)
  // Adelaide minor premiers
  // ─────────────────────────────────────────────
  2006: aflOnly([
    { team: 'adelaide', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 128.4 },
    { team: 'westcoast', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.6 },
    { team: 'fremantle', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.4 },
    { team: 'sydney', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 110.8 },
    { team: 'collingwood', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 106.2 },
    { team: 'stkilda', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 104.6 },
    { team: 'melbourne', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.4 },
    { team: 'westernbulldogs', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 98.8 },
    { team: 'geelong', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.2 },
    { team: 'portadelaide', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 92.4 },
    { team: 'brisbane', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.6 },
    { team: 'northmelbourne', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.8 },
    { team: 'hawthorn', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.4 },
    { team: 'essendon', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 78.6 },
    { team: 'carlton', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 72.4 },
    { team: 'richmond', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 70.8 },
  ]),

  // ─────────────────────────────────────────────
  // 2007 — Geelong premiers (dominant, beat Port Adelaide)
  // One of the greatest seasons — 20-2 H&A
  // ─────────────────────────────────────────────
  2007: aflOnly([
    { team: 'geelong', aflWins: 20, aflLosses: 2, aflDraws: 0, aflPct: 152.6 },
    { team: 'portadelaide', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 122.4 },
    { team: 'northmelbourne', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 115.8 },
    { team: 'hawthorn', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.6 },
    { team: 'collingwood', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.4 },
    { team: 'sydney', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 98.8 },
    { team: 'adelaide', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 96.4 },
    { team: 'stkilda', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 94.6 },
    { team: 'brisbane', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 92.8 },
    { team: 'essendon', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.2 },
    { team: 'carlton', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 88.4 },
    { team: 'westernbulldogs', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 86.6 },
    { team: 'westcoast', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.4 },
    { team: 'melbourne', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 80.2 },
    { team: 'fremantle', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.8 },
    { team: 'richmond', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 66.4 },
  ]),

  // ─────────────────────────────────────────────
  // 2008 — Hawthorn premiers (beat Geelong in a classic)
  // Geelong 21-1 in H&A but lost the GF
  // ─────────────────────────────────────────────
  2008: aflOnly([
    { team: 'geelong', aflWins: 21, aflLosses: 1, aflDraws: 0, aflPct: 162.4 },
    { team: 'stkilda', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 124.6 },
    { team: 'westernbulldogs', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 122.8 },
    { team: 'hawthorn', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 116.4 },
    { team: 'northmelbourne', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 106.2 },
    { team: 'adelaide', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.8 },
    { team: 'collingwood', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 98.4 },
    { team: 'carlton', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 94.6 },
    { team: 'sydney', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 92.8 },
    { team: 'brisbane', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.4 },
    { team: 'essendon', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.2 },
    { team: 'portadelaide', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 84.6 },
    { team: 'fremantle', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 80.8 },
    { team: 'melbourne', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.4 },
    { team: 'westcoast', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 66.8 },
    { team: 'richmond', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 64.2 },
  ]),

  // ─────────────────────────────────────────────
  // 2009 — Geelong premiers (beat St Kilda)
  // St Kilda minor premiers with incredible 20-2
  // ─────────────────────────────────────────────
  2009: aflOnly([
    { team: 'stkilda', aflWins: 20, aflLosses: 2, aflDraws: 0, aflPct: 158.4 },
    { team: 'geelong', aflWins: 19, aflLosses: 3, aflDraws: 0, aflPct: 148.6 },
    { team: 'westernbulldogs', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 120.4 },
    { team: 'brisbane', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.2 },
    { team: 'carlton', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 116.8 },
    { team: 'adelaide', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 106.4 },
    { team: 'collingwood', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 104.2 },
    { team: 'northmelbourne', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.6 },
    { team: 'essendon', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.4 },
    { team: 'sydney', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 92.8 },
    { team: 'hawthorn', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.6 },
    { team: 'portadelaide', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.4 },
    { team: 'fremantle', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.6 },
    { team: 'melbourne', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.8 },
    { team: 'westcoast', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 72.4 },
    { team: 'richmond', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 66.8 },
  ]),

  // ─────────────────────────────────────────────
  // 2010 — Collingwood premiers (beat St Kilda in drawn GF + replay)
  // Geelong minor premiers
  // ─────────────────────────────────────────────
  2010: aflOnly([
    { team: 'geelong', aflWins: 18, aflLosses: 4, aflDraws: 0, aflPct: 140.6 },
    { team: 'collingwood', aflWins: 16, aflLosses: 5, aflDraws: 1, aflPct: 126.4 },
    { team: 'stkilda', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 120.8 },
    { team: 'westernbulldogs', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.4 },
    { team: 'fremantle', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 110.6 },
    { team: 'carlton', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 108.2 },
    { team: 'sydney', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 104.8 },
    { team: 'hawthorn', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.6 },
    { team: 'adelaide', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.4 },
    { team: 'northmelbourne', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 92.2 },
    { team: 'essendon', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.8 },
    { team: 'brisbane', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 84.4 },
    { team: 'portadelaide', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 80.6 },
    { team: 'melbourne', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 78.2 },
    { team: 'westcoast', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 72.8 },
    { team: 'richmond', aflWins: 5, aflLosses: 16, aflDraws: 1, aflPct: 68.4 },
  ]),

  // ─────────────────────────────────────────────
  // 2011 — Geelong premiers (beat Collingwood)
  // Collingwood minor premiers (20-2)
  // Gold Coast Suns join (17 teams)
  // ─────────────────────────────────────────────
  2011: aflOnly([
    { team: 'collingwood', aflWins: 20, aflLosses: 2, aflDraws: 0, aflPct: 155.4 },
    { team: 'geelong', aflWins: 19, aflLosses: 3, aflDraws: 0, aflPct: 148.2 },
    { team: 'hawthorn', aflWins: 18, aflLosses: 4, aflDraws: 0, aflPct: 138.6 },
    { team: 'carlton', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 108.4 },
    { team: 'westcoast', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 106.2 },
    { team: 'sydney', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 104.6 },
    { team: 'essendon', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.8 },
    { team: 'stkilda', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.4 },
    { team: 'northmelbourne', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 94.8 },
    { team: 'fremantle', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 92.6 },
    { team: 'adelaide', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.4 },
    { team: 'richmond', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.8 },
    { team: 'brisbane', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 84.2 },
    { team: 'westernbulldogs', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 82.6 },
    { team: 'portadelaide', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 68.4 },
    { team: 'melbourne', aflWins: 4, aflLosses: 18, aflDraws: 0, aflPct: 64.6 },
    { team: 'goldcoast', aflWins: 3, aflLosses: 19, aflDraws: 0, aflPct: 58.4 },
  ]),

  // ─────────────────────────────────────────────
  // 2012 — Sydney premiers (beat Hawthorn)
  // Hawthorn minor premiers
  // GWS Giants join (18 teams)
  // ─────────────────────────────────────────────
  2012: aflOnly([
    { team: 'hawthorn', aflWins: 18, aflLosses: 4, aflDraws: 0, aflPct: 138.4 },
    { team: 'sydney', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 128.6 },
    { team: 'collingwood', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 122.4 },
    { team: 'adelaide', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 116.8 },
    { team: 'westcoast', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 114.2 },
    { team: 'geelong', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.6 },
    { team: 'northmelbourne', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 106.4 },
    { team: 'fremantle', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 104.2 },
    { team: 'carlton', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.6 },
    { team: 'essendon', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.8 },
    { team: 'richmond', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 92.4 },
    { team: 'stkilda', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.6 },
    { team: 'westernbulldogs', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.2 },
    { team: 'brisbane', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.8 },
    { team: 'melbourne', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 72.4 },
    { team: 'portadelaide', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 68.6 },
    { team: 'goldcoast', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 66.4 },
    { team: 'gws', aflWins: 2, aflLosses: 20, aflDraws: 0, aflPct: 52.8 },
  ]),

  // ─────────────────────────────────────────────
  // 2013 — Hawthorn premiers (beat Fremantle)
  // Hawthorn minor premiers
  // ─────────────────────────────────────────────
  2013: aflOnly([
    { team: 'hawthorn', aflWins: 18, aflLosses: 4, aflDraws: 0, aflPct: 140.2 },
    { team: 'geelong', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 128.4 },
    { team: 'sydney', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 126.6 },
    { team: 'fremantle', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 124.8 },
    { team: 'richmond', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 106.4 },
    { team: 'collingwood', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 104.8 },
    { team: 'portadelaide', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.6 },
    { team: 'essendon', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 98.2 },
    { team: 'carlton', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.4 },
    { team: 'adelaide', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 94.6 },
    { team: 'northmelbourne', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.8 },
    { team: 'westcoast', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.4 },
    { team: 'westernbulldogs', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.6 },
    { team: 'stkilda', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 80.2 },
    { team: 'brisbane', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.8 },
    { team: 'goldcoast', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 74.4 },
    { team: 'melbourne', aflWins: 4, aflLosses: 18, aflDraws: 0, aflPct: 60.6 },
    { team: 'gws', aflWins: 3, aflLosses: 19, aflDraws: 0, aflPct: 55.8 },
  ]),

  // ─────────────────────────────────────────────
  // 2014 — Hawthorn premiers (back-to-back, beat Sydney)
  // Sydney minor premiers
  // ─────────────────────────────────────────────
  2014: aflOnly([
    { team: 'sydney', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 134.6 },
    { team: 'hawthorn', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 132.4 },
    { team: 'geelong', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 126.8 },
    { team: 'fremantle', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.4 },
    { team: 'portadelaide', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.6 },
    { team: 'northmelbourne', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 110.2 },
    { team: 'adelaide', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 106.4 },
    { team: 'essendon', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.8 },
    { team: 'richmond', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.4 },
    { team: 'collingwood', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 94.8 },
    { team: 'westcoast', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 92.6 },
    { team: 'westernbulldogs', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 90.4 },
    { team: 'brisbane', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.6 },
    { team: 'carlton', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 78.4 },
    { team: 'goldcoast', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.2 },
    { team: 'gws', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 72.8 },
    { team: 'stkilda', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 66.4 },
    { team: 'melbourne', aflWins: 4, aflLosses: 18, aflDraws: 0, aflPct: 60.8 },
  ]),

  // ─────────────────────────────────────────────
  // 2015 — Hawthorn premiers (three-peat, beat West Coast)
  // Fremantle minor premiers (18-4)
  // ─────────────────────────────────────────────
  2015: aflOnly([
    { team: 'fremantle', aflWins: 18, aflLosses: 4, aflDraws: 0, aflPct: 142.6 },
    { team: 'hawthorn', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 132.4 },
    { team: 'sydney', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 124.8 },
    { team: 'westcoast', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.6 },
    { team: 'richmond', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 116.2 },
    { team: 'portadelaide', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 110.4 },
    { team: 'adelaide', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 108.6 },
    { team: 'westernbulldogs', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.8 },
    { team: 'northmelbourne', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 102.4 },
    { team: 'geelong', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 98.6 },
    { team: 'gws', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.4 },
    { team: 'collingwood', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 92.2 },
    { team: 'melbourne', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 78.4 },
    { team: 'carlton', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.8 },
    { team: 'brisbane', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 74.6 },
    { team: 'essendon', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 72.4 },
    { team: 'stkilda', aflWins: 4, aflLosses: 18, aflDraws: 0, aflPct: 64.8 },
    { team: 'goldcoast', aflWins: 4, aflLosses: 18, aflDraws: 0, aflPct: 62.6 },
  ]),

  // ─────────────────────────────────────────────
  // 2016 — Western Bulldogs premiers (won from 7th, beat Sydney)
  // Sydney minor premiers
  // ─────────────────────────────────────────────
  2016: aflOnly([
    { team: 'sydney', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 132.4 },
    { team: 'gws', aflWins: 16, aflLosses: 5, aflDraws: 1, aflPct: 130.6 },
    { team: 'geelong', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 126.8 },
    { team: 'adelaide', aflWins: 15, aflLosses: 6, aflDraws: 1, aflPct: 124.2 },
    { team: 'hawthorn', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.6 },
    { team: 'westernbulldogs', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 114.4 },
    { team: 'northmelbourne', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.2 },
    { team: 'westcoast', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 100.8 },
    { team: 'melbourne', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 96.4 },
    { team: 'portadelaide', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 94.6 },
    { team: 'collingwood', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 88.2 },
    { team: 'stkilda', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.4 },
    { team: 'richmond', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.6 },
    { team: 'fremantle', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 80.4 },
    { team: 'essendon', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 78.8 },
    { team: 'carlton', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 72.6 },
    { team: 'goldcoast', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 70.4 },
    { team: 'brisbane', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 68.2 },
  ]),
};
