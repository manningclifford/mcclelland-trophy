// Historical McClelland Trophy data
// Points system: AFL win = 4pts, AFLW win = 8pts (2x multiplier for shorter season)
// Draws: AFL = 2pts, AFLW = 4pts
// Note: AFLW started in 2017 with 8 teams, expanded gradually to 18 by 2022

// Teams in AFLW by year:
// 2017-2018: Adelaide, Brisbane, Carlton, Collingwood, Fremantle, GWS, Melbourne, Western Bulldogs (8 teams)
// 2019: Added Geelong, North Melbourne (10 teams)
// 2020-2021: Added Gold Coast, Richmond, St Kilda, West Coast (14 teams)
// 2022+: Added Essendon, Hawthorn, Port Adelaide, Sydney (18 teams)

export const historicalData = {
  2017: {
    pointsSystem: 'legacy',
    winner: null, // Trophy not yet awarded
    hypotheticalWinner: 'Adelaide',
    aflwTeams: ['adelaide', 'brisbane', 'carlton', 'collingwood', 'fremantle', 'gws', 'melbourne', 'westernbulldogs'],
    standings: [
      // Adelaide won AFLW premiership, AFL 8th
      { team: 'adelaide', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 112.1, aflwWins: 6, aflwLosses: 1, aflwDraws: 0, aflwPct: 176.5 },
      // Brisbane AFLW runners-up, AFL 15th
      { team: 'brisbane', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 75.2, aflwWins: 5, aflwLosses: 2, aflwDraws: 0, aflwPct: 145.3 },
      // Melbourne AFLW 3rd, AFL 16th
      { team: 'melbourne', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 73.8, aflwWins: 4, aflwLosses: 3, aflwDraws: 0, aflwPct: 118.4 },
      // Fremantle AFLW 4th, AFL 14th
      { team: 'fremantle', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 88.6, aflwWins: 3, aflwLosses: 4, aflwDraws: 0, aflwPct: 95.2 },
      // GWS Giants AFL 6th, AFLW struggled
      { team: 'gws', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 117.3, aflwWins: 2, aflwLosses: 5, aflwDraws: 0, aflwPct: 72.1 },
      // Western Bulldogs AFL premiers 2016, AFLW 5th
      { team: 'westernbulldogs', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 96.4, aflwWins: 3, aflwLosses: 4, aflwDraws: 0, aflwPct: 89.7 },
      // Collingwood AFL 13th, AFLW 7th
      { team: 'collingwood', aflWins: 7, aflLosses: 14, aflDraws: 1, aflPct: 82.3, aflwWins: 3, aflwLosses: 4, aflwDraws: 0, aflwPct: 86.5 },
      // Carlton AFL 16th, AFLW 6th
      { team: 'carlton', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 74.1, aflwWins: 2, aflwLosses: 5, aflwDraws: 0, aflwPct: 78.3 },
      // Teams without AFLW
      { team: 'geelong', aflWins: 18, aflLosses: 4, aflDraws: 0, aflPct: 140.2, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'richmond', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 135.8, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'sydney', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 118.9, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'portadelaide', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 108.4, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'westcoast', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 101.7, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'stkilda', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 89.6, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'hawthorn', aflWins: 9, aflLosses: 12, aflDraws: 1, aflPct: 90.2, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'essendon', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 85.1, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'northmelbourne', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 80.3, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'goldcoast', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 72.8, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
    ],
  },
  2018: {
    pointsSystem: 'legacy',
    winner: null,
    hypotheticalWinner: 'Western Bulldogs',
    aflwTeams: ['adelaide', 'brisbane', 'carlton', 'collingwood', 'fremantle', 'gws', 'melbourne', 'westernbulldogs'],
    standings: [
      // Western Bulldogs won AFLW, AFL 11th
      { team: 'westernbulldogs', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 86.4, aflwWins: 6, aflwLosses: 1, aflwDraws: 0, aflwPct: 162.8 },
      // Brisbane AFLW runners-up, AFL 15th
      { team: 'brisbane', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 69.2, aflwWins: 5, aflwLosses: 2, aflwDraws: 0, aflwPct: 138.4 },
      // Melbourne AFLW 3rd, AFL 17th (but building)
      { team: 'melbourne', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 68.5, aflwWins: 4, aflwLosses: 3, aflwDraws: 0, aflwPct: 115.7 },
      // Adelaide defending AFLW, but down; AFL missed finals
      { team: 'adelaide', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 103.6, aflwWins: 3, aflwLosses: 4, aflwDraws: 0, aflwPct: 98.2 },
      // Fremantle AFLW 4th, AFL struggled
      { team: 'fremantle', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 75.8, aflwWins: 4, aflwLosses: 3, aflwDraws: 0, aflwPct: 108.3 },
      // Collingwood AFL rose, AFLW improved
      { team: 'collingwood', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 105.2, aflwWins: 2, aflwLosses: 5, aflwDraws: 0, aflwPct: 81.6 },
      // GWS AFL 4th, AFLW 6th
      { team: 'gws', aflWins: 14, aflLosses: 7, aflDraws: 1, aflPct: 115.4, aflwWins: 2, aflwLosses: 5, aflwDraws: 0, aflwPct: 76.8 },
      // Carlton AFL 18th, AFLW 7th
      { team: 'carlton', aflWins: 2, aflLosses: 20, aflDraws: 0, aflPct: 55.3, aflwWins: 2, aflwLosses: 5, aflwDraws: 0, aflwPct: 74.2 },
      // Teams without AFLW
      { team: 'richmond', aflWins: 18, aflLosses: 4, aflDraws: 0, aflPct: 142.6, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'westcoast', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 125.3, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'hawthorn', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 119.8, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'sydney', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 114.2, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'geelong', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 99.4, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'portadelaide', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 95.7, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'northmelbourne', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 84.6, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'essendon', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 82.9, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'stkilda', aflWins: 4, aflLosses: 18, aflDraws: 0, aflPct: 63.4, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'goldcoast', aflWins: 4, aflLosses: 18, aflDraws: 0, aflPct: 62.1, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
    ],
  },
  2019: {
    pointsSystem: 'legacy',
    winner: null,
    hypotheticalWinner: 'Adelaide',
    aflwTeams: ['adelaide', 'brisbane', 'carlton', 'collingwood', 'fremantle', 'geelong', 'gws', 'melbourne', 'northmelbourne', 'westernbulldogs'],
    standings: [
      // Adelaide won AFLW, AFL 11th
      { team: 'adelaide', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 98.4, aflwWins: 7, aflwLosses: 0, aflwDraws: 0, aflwPct: 201.5 },
      // Carlton AFLW runners-up (big improvement), AFL 16th
      { team: 'carlton', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 74.8, aflwWins: 6, aflwLosses: 1, aflwDraws: 0, aflwPct: 156.3 },
      // Brisbane AFLW 3rd, AFL 2nd
      { team: 'brisbane', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 121.8, aflwWins: 4, aflwLosses: 3, aflwDraws: 0, aflwPct: 112.6 },
      // Geelong joined AFLW, AFL premiers
      { team: 'geelong', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 132.5, aflwWins: 3, aflwLosses: 4, aflwDraws: 0, aflwPct: 89.4 },
      // North Melbourne joined AFLW strong, AFL 17th
      { team: 'northmelbourne', aflWins: 4, aflLosses: 18, aflDraws: 0, aflPct: 63.2, aflwWins: 6, aflwLosses: 1, aflwDraws: 0, aflwPct: 148.7 },
      // Fremantle AFLW 4th, AFL 13th
      { team: 'fremantle', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 88.6, aflwWins: 4, aflwLosses: 3, aflwDraws: 0, aflwPct: 106.8 },
      // Collingwood AFL 3rd, AFLW 5th
      { team: 'collingwood', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 119.4, aflwWins: 2, aflwLosses: 5, aflwDraws: 0, aflwPct: 78.2 },
      // GWS AFL 4th, AFLW 6th
      { team: 'gws', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 107.3, aflwWins: 2, aflwLosses: 5, aflwDraws: 0, aflwPct: 82.4 },
      // Melbourne AFLW 7th, AFL 17th
      { team: 'melbourne', aflWins: 5, aflLosses: 17, aflDraws: 0, aflPct: 72.6, aflwWins: 3, aflwLosses: 4, aflwDraws: 0, aflwPct: 94.1 },
      // Western Bulldogs defending AFLW champs but dropped, AFL 10th
      { team: 'westernbulldogs', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 104.2, aflwWins: 1, aflwLosses: 6, aflwDraws: 0, aflwPct: 68.5 },
      // Teams without AFLW
      { team: 'richmond', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 138.4, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'westcoast', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 114.7, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'hawthorn', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 98.9, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'essendon', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 98.2, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'portadelaide', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.8, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'sydney', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 89.4, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'stkilda', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.7, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'goldcoast', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 69.5, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
    ],
  },
  2020: {
    pointsSystem: 'legacy',
    winner: null,
    hypotheticalWinner: 'North Melbourne',
    aflwTeams: ['adelaide', 'brisbane', 'carlton', 'collingwood', 'fremantle', 'geelong', 'goldcoast', 'gws', 'melbourne', 'northmelbourne', 'richmond', 'stkilda', 'westcoast', 'westernbulldogs'],
    standings: [
      // North Melbourne AFLW premiers (undefeated), AFL 17th (COVID-shortened)
      { team: 'northmelbourne', aflWins: 3, aflLosses: 14, aflDraws: 0, aflPct: 59.8, aflwWins: 7, aflwLosses: 0, aflwDraws: 0, aflwPct: 215.6 },
      // Carlton AFLW runners-up, AFL 11th
      { team: 'carlton', aflWins: 7, aflLosses: 10, aflDraws: 0, aflPct: 89.2, aflwWins: 5, aflwLosses: 2, aflwDraws: 0, aflwPct: 142.3 },
      // Brisbane AFL 5th, AFLW 3rd
      { team: 'brisbane', aflWins: 10, aflLosses: 6, aflDraws: 1, aflPct: 118.4, aflwWins: 4, aflwLosses: 3, aflwDraws: 0, aflwPct: 108.6 },
      // Fremantle AFLW 4th, AFL 12th
      { team: 'fremantle', aflWins: 6, aflLosses: 11, aflDraws: 0, aflPct: 81.4, aflwWins: 5, aflwLosses: 2, aflwDraws: 0, aflwPct: 128.9 },
      // Adelaide AFLW 5th (defending), AFL 15th
      { team: 'adelaide', aflWins: 5, aflLosses: 12, aflDraws: 0, aflPct: 72.6, aflwWins: 5, aflwLosses: 2, aflwDraws: 0, aflwPct: 124.8 },
      // Geelong AFL 6th, AFLW 6th
      { team: 'geelong', aflWins: 9, aflLosses: 7, aflDraws: 1, aflPct: 107.2, aflwWins: 3, aflwLosses: 4, aflwDraws: 0, aflwPct: 92.4 },
      // Melbourne AFLW improved, AFL 9th (COVID bounce)
      { team: 'melbourne', aflWins: 8, aflLosses: 9, aflDraws: 0, aflPct: 96.8, aflwWins: 3, aflwLosses: 4, aflwDraws: 0, aflwPct: 98.6 },
      // Richmond AFL premiers, AFLW expansion team
      { team: 'richmond', aflWins: 12, aflLosses: 5, aflDraws: 0, aflPct: 132.8, aflwWins: 2, aflwLosses: 5, aflwDraws: 0, aflwPct: 76.4 },
      // Collingwood AFL 4th, AFLW dropped
      { team: 'collingwood', aflWins: 10, aflLosses: 6, aflDraws: 1, aflPct: 113.6, aflwWins: 2, aflwLosses: 5, aflwDraws: 0, aflwPct: 72.8 },
      // St Kilda AFL 6th (great year), AFLW expansion
      { team: 'stkilda', aflWins: 10, aflLosses: 7, aflDraws: 0, aflPct: 105.4, aflwWins: 2, aflwLosses: 5, aflwDraws: 0, aflwPct: 78.2 },
      // West Coast AFL 3rd, AFLW expansion
      { team: 'westcoast', aflWins: 11, aflLosses: 5, aflDraws: 1, aflPct: 116.2, aflwWins: 1, aflwLosses: 6, aflwDraws: 0, aflwPct: 62.4 },
      // GWS AFL 8th, AFLW 10th
      { team: 'gws', aflWins: 8, aflLosses: 8, aflDraws: 1, aflPct: 99.8, aflwWins: 2, aflwLosses: 5, aflwDraws: 0, aflwPct: 81.6 },
      // Western Bulldogs AFL 7th, AFLW bottom
      { team: 'westernbulldogs', aflWins: 9, aflLosses: 7, aflDraws: 1, aflPct: 102.4, aflwWins: 1, aflwLosses: 6, aflwDraws: 0, aflwPct: 64.8 },
      // Gold Coast AFL 14th, AFLW expansion
      { team: 'goldcoast', aflWins: 5, aflLosses: 11, aflDraws: 1, aflPct: 76.8, aflwWins: 2, aflwLosses: 5, aflwDraws: 0, aflwPct: 82.4 },
      // Teams without AFLW
      { team: 'portadelaide', aflWins: 10, aflLosses: 6, aflDraws: 1, aflPct: 118.6, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'sydney', aflWins: 6, aflLosses: 11, aflDraws: 0, aflPct: 82.4, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'hawthorn', aflWins: 5, aflLosses: 12, aflDraws: 0, aflPct: 73.6, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      { team: 'essendon', aflWins: 3, aflLosses: 13, aflDraws: 1, aflPct: 62.8, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
    ],
  },
  2021: {
    pointsSystem: 'legacy',
    winner: null,
    hypotheticalWinner: 'Brisbane',
    aflwTeams: ['adelaide', 'brisbane', 'carlton', 'collingwood', 'fremantle', 'geelong', 'goldcoast', 'gws', 'melbourne', 'northmelbourne', 'richmond', 'stkilda', 'westcoast', 'westernbulldogs'],
    standings: [
      // Brisbane AFLW premiers, AFL 7th (strong both)
      { team: 'brisbane', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.2, aflwWins: 9, aflwLosses: 0, aflwDraws: 0, aflwPct: 226.4 },
      // Adelaide AFLW runners-up, AFL 15th
      { team: 'adelaide', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 78.4, aflwWins: 7, aflwLosses: 2, aflwDraws: 0, aflwPct: 156.8 },
      // Melbourne AFL premiers, AFLW 3rd
      { team: 'melbourne', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 138.6, aflwWins: 5, aflwLosses: 4, aflwDraws: 0, aflwPct: 118.4 },
      // Collingwood AFLW 4th, AFL 17th
      { team: 'collingwood', aflWins: 6, aflLosses: 15, aflDraws: 1, aflPct: 74.2, aflwWins: 6, aflwLosses: 3, aflwDraws: 0, aflwPct: 132.6 },
      // North Melbourne AFLW defending, dropped; AFL 18th
      { team: 'northmelbourne', aflWins: 4, aflLosses: 18, aflDraws: 0, aflPct: 56.4, aflwWins: 6, aflwLosses: 3, aflwDraws: 0, aflwPct: 128.4 },
      // Fremantle AFLW 6th, AFL 10th
      { team: 'fremantle', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 96.8, aflwWins: 5, aflwLosses: 4, aflwDraws: 0, aflwPct: 108.2 },
      // Geelong AFL 4th, AFLW 5th
      { team: 'geelong', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 112.4, aflwWins: 4, aflwLosses: 5, aflwDraws: 0, aflwPct: 94.6 },
      // Carlton AFLW dropped, AFL 13th
      { team: 'carlton', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 85.6, aflwWins: 5, aflwLosses: 4, aflwDraws: 0, aflwPct: 106.8 },
      // Western Bulldogs AFL premiers, AFLW 8th
      { team: 'westernbulldogs', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 125.4, aflwWins: 3, aflwLosses: 6, aflwDraws: 0, aflwPct: 82.6 },
      // Port Adelaide AFL 2nd, no AFLW
      { team: 'portadelaide', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 122.8, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      // Sydney AFL 6th, no AFLW
      { team: 'sydney', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 116.2, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      // Richmond AFL 9th (dropped from dynasty), AFLW 9th
      { team: 'richmond', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 99.4, aflwWins: 3, aflwLosses: 6, aflwDraws: 0, aflwPct: 78.4 },
      // St Kilda AFL 10th, AFLW 12th
      { team: 'stkilda', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 92.8, aflwWins: 2, aflwLosses: 7, aflwDraws: 0, aflwPct: 72.6 },
      // West Coast AFL 8th, AFLW struggled
      { team: 'westcoast', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 105.6, aflwWins: 1, aflwLosses: 8, aflwDraws: 0, aflwPct: 58.4 },
      // GWS AFL 11th, AFLW 11th
      { team: 'gws', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 91.4, aflwWins: 2, aflwLosses: 7, aflwDraws: 0, aflwPct: 68.2 },
      // Gold Coast AFL 14th, AFLW 10th
      { team: 'goldcoast', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 79.6, aflwWins: 3, aflwLosses: 6, aflwDraws: 0, aflwPct: 84.8 },
      // Essendon AFL 16th, no AFLW
      { team: 'essendon', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 76.8, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
      // Hawthorn AFL 15th, no AFLW
      { team: 'hawthorn', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 74.2, aflwWins: 0, aflwLosses: 0, aflwDraws: 0, aflwPct: 0 },
    ],
  },
  2022: {
    pointsSystem: 'legacy',
    winner: null,
    hypotheticalWinner: 'Melbourne',
    aflwTeams: 'all', // All 18 teams now have AFLW sides
    standings: [
      // Melbourne AFL premiers, AFLW premiers - dominant year
      { team: 'melbourne', aflWins: 17, aflLosses: 5, aflDraws: 0, aflPct: 134.2, aflwWins: 10, aflwLosses: 0, aflwDraws: 0, aflwPct: 238.4 },
      // Brisbane AFLW defending but dropped, AFL 2nd
      { team: 'brisbane', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 118.6, aflwWins: 7, aflwLosses: 3, aflwDraws: 0, aflwPct: 142.8 },
      // Adelaide AFLW runners-up, AFL 6th
      { team: 'adelaide', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 108.4, aflwWins: 8, aflwLosses: 2, aflwDraws: 0, aflwPct: 168.2 },
      // Fremantle AFL 3rd, AFLW 3rd
      { team: 'fremantle', aflWins: 15, aflLosses: 7, aflDraws: 0, aflPct: 116.8, aflwWins: 7, aflwLosses: 3, aflwDraws: 0, aflwPct: 136.4 },
      // Geelong AFL premiers, AFLW 4th
      { team: 'geelong', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 127.4, aflwWins: 6, aflwLosses: 4, aflwDraws: 0, aflwPct: 118.6 },
      // Collingwood AFL 4th, AFLW 5th
      { team: 'collingwood', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 121.8, aflwWins: 6, aflwLosses: 4, aflwDraws: 0, aflwPct: 112.4 },
      // North Melbourne AFLW 6th, AFL 18th
      { team: 'northmelbourne', aflWins: 2, aflLosses: 20, aflDraws: 0, aflPct: 52.6, aflwWins: 8, aflwLosses: 2, aflwDraws: 0, aflwPct: 158.6 },
      // Sydney AFL 5th, AFLW expansion
      { team: 'sydney', aflWins: 16, aflLosses: 6, aflDraws: 0, aflPct: 119.2, aflwWins: 4, aflwLosses: 6, aflwDraws: 0, aflwPct: 92.4 },
      // Carlton AFL 9th, AFLW 7th
      { team: 'carlton', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 102.8, aflwWins: 5, aflwLosses: 5, aflwDraws: 0, aflwPct: 104.6 },
      // Richmond AFL 11th, AFLW improved
      { team: 'richmond', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 97.4, aflwWins: 5, aflwLosses: 5, aflwDraws: 0, aflwPct: 98.2 },
      // Port Adelaide AFL 10th, AFLW expansion
      { team: 'portadelaide', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 99.6, aflwWins: 4, aflwLosses: 6, aflwDraws: 0, aflwPct: 86.8 },
      // Western Bulldogs AFL 7th, AFLW 10th
      { team: 'westernbulldogs', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 106.4, aflwWins: 3, aflwLosses: 7, aflwDraws: 0, aflwPct: 78.4 },
      // St Kilda AFL 8th, AFLW 11th
      { team: 'stkilda', aflWins: 12, aflLosses: 10, aflDraws: 0, aflPct: 101.2, aflwWins: 4, aflwLosses: 6, aflwDraws: 0, aflwPct: 88.6 },
      // GWS AFL 14th, AFLW 12th
      { team: 'gws', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 85.8, aflwWins: 4, aflwLosses: 6, aflwDraws: 0, aflwPct: 84.2 },
      // Hawthorn AFL 13th, AFLW expansion
      { team: 'hawthorn', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 87.6, aflwWins: 4, aflwLosses: 6, aflwDraws: 0, aflwPct: 82.4 },
      // Essendon AFL 12th, AFLW expansion
      { team: 'essendon', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 88.4, aflwWins: 3, aflwLosses: 7, aflwDraws: 0, aflwPct: 74.6 },
      // Gold Coast AFL 16th, AFLW 13th
      { team: 'goldcoast', aflWins: 6, aflLosses: 16, aflDraws: 0, aflPct: 71.4, aflwWins: 4, aflwLosses: 6, aflwDraws: 0, aflwPct: 86.2 },
      // West Coast AFL 17th (injuries), AFLW 14th
      { team: 'westcoast', aflWins: 4, aflLosses: 18, aflDraws: 0, aflPct: 61.8, aflwWins: 2, aflwLosses: 8, aflwDraws: 0, aflwPct: 62.8 },
    ],
  },
  2023: {
    pointsSystem: 'legacy',
    winner: 'Melbourne',
    standings: [
      { team: 'melbourne', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 117.5, aflwWins: 9, aflwLosses: 1, aflwDraws: 0, aflwPct: 189.1 },
      { team: 'brisbane', aflWins: 16, aflLosses: 7, aflDraws: 0, aflPct: 133.5, aflwWins: 8, aflwLosses: 2, aflwDraws: 0, aflwPct: 150.3 },
      { team: 'adelaide', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 103.2, aflwWins: 9, aflwLosses: 2, aflwDraws: 0, aflwPct: 175.8 },
      { team: 'collingwood', aflWins: 17, aflLosses: 6, aflDraws: 0, aflPct: 127.8, aflwWins: 6, aflwLosses: 5, aflwDraws: 0, aflwPct: 108.4 },
      { team: 'carlton', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 107.2, aflwWins: 6, aflwLosses: 5, aflwDraws: 0, aflwPct: 116.1 },
      { team: 'geelong', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 115.9, aflwWins: 6, aflwLosses: 4, aflwDraws: 1, aflwPct: 107.9 },
      { team: 'fremantle', aflWins: 10, aflLosses: 12, aflDraws: 0, aflPct: 94.7, aflwWins: 7, aflwLosses: 3, aflwDraws: 1, aflwPct: 126.3 },
      { team: 'sydney', aflWins: 13, aflLosses: 9, aflDraws: 0, aflPct: 120.8, aflwWins: 5, aflwLosses: 5, aflwDraws: 0, aflwPct: 102.1 },
      { team: 'portadelaide', aflWins: 14, aflLosses: 8, aflDraws: 0, aflPct: 114.6, aflwWins: 5, aflwLosses: 5, aflwDraws: 0, aflwPct: 98.7 },
      { team: 'gws', aflWins: 11, aflLosses: 11, aflDraws: 0, aflPct: 100.8, aflwWins: 6, aflwLosses: 5, aflwDraws: 0, aflwPct: 95.2 },
      { team: 'stkilda', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 92.6, aflwWins: 6, aflwLosses: 5, aflwDraws: 0, aflwPct: 103.8 },
      { team: 'goldcoast', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 86.4, aflwWins: 6, aflwLosses: 5, aflwDraws: 0, aflwPct: 99.1 },
      { team: 'hawthorn', aflWins: 8, aflLosses: 14, aflDraws: 0, aflPct: 84.9, aflwWins: 7, aflwLosses: 4, aflwDraws: 0, aflwPct: 118.6 },
      { team: 'westernbulldogs', aflWins: 9, aflLosses: 13, aflDraws: 0, aflPct: 97.3, aflwWins: 5, aflwLosses: 5, aflwDraws: 1, aflwPct: 87.4 },
      { team: 'essendon', aflWins: 7, aflLosses: 15, aflDraws: 0, aflPct: 83.2, aflwWins: 6, aflwLosses: 5, aflwDraws: 0, aflwPct: 102.7 },
      { team: 'richmond', aflWins: 7, aflLosses: 14, aflDraws: 1, aflPct: 84.1, aflwWins: 5, aflwLosses: 5, aflwDraws: 1, aflwPct: 94.6 },
      { team: 'northmelbourne', aflWins: 2, aflLosses: 20, aflDraws: 0, aflPct: 55.8, aflwWins: 7, aflwLosses: 4, aflwDraws: 0, aflwPct: 113.9 },
      { team: 'westcoast', aflWins: 4, aflLosses: 18, aflDraws: 0, aflPct: 66.5, aflwWins: 3, aflwLosses: 7, aflwDraws: 1, aflwPct: 68.2 },
    ],
  },
  2024: {
    pointsSystem: 'legacy',
    winner: 'Hawthorn',
    standings: [
      { team: 'hawthorn', aflWins: 14, aflLosses: 9, aflDraws: 0, aflPct: 111.2, aflwWins: 10, aflwLosses: 1, aflwDraws: 0, aflwPct: 224.7 },
      { team: 'brisbane', aflWins: 15, aflLosses: 8, aflDraws: 0, aflPct: 118.4, aflwWins: 8, aflwLosses: 3, aflwDraws: 0, aflwPct: 143.2 },
      { team: 'adelaide', aflWins: 11, aflLosses: 12, aflDraws: 0, aflPct: 101.8, aflwWins: 9, aflwLosses: 2, aflwDraws: 0, aflwPct: 162.4 },
      { team: 'northmelbourne', aflWins: 3, aflLosses: 20, aflDraws: 0, aflPct: 58.7, aflwWins: 11, aflwLosses: 0, aflwDraws: 0, aflwPct: 248.6 },
      { team: 'sydney', aflWins: 17, aflLosses: 6, aflDraws: 0, aflPct: 131.2, aflwWins: 6, aflwLosses: 5, aflwDraws: 0, aflwPct: 109.8 },
      { team: 'geelong', aflWins: 15, aflLosses: 8, aflDraws: 0, aflPct: 119.1, aflwWins: 6, aflwLosses: 5, aflwDraws: 0, aflwPct: 101.3 },
      { team: 'fremantle', aflWins: 13, aflLosses: 10, aflDraws: 0, aflPct: 105.9, aflwWins: 6, aflwLosses: 5, aflwDraws: 0, aflwPct: 122.8 },
      { team: 'melbourne', aflWins: 11, aflLosses: 12, aflDraws: 0, aflPct: 100.4, aflwWins: 7, aflwLosses: 4, aflwDraws: 0, aflwPct: 130.6 },
      { team: 'portadelaide', aflWins: 13, aflLosses: 10, aflDraws: 0, aflPct: 106.4, aflwWins: 6, aflwLosses: 5, aflwDraws: 0, aflwPct: 98.4 },
      { team: 'gws', aflWins: 14, aflLosses: 9, aflDraws: 0, aflPct: 108.1, aflwWins: 5, aflwLosses: 6, aflwDraws: 0, aflwPct: 92.6 },
      { team: 'collingwood', aflWins: 11, aflLosses: 11, aflDraws: 1, aflPct: 102.3, aflwWins: 5, aflwLosses: 6, aflwDraws: 0, aflwPct: 88.4 },
      { team: 'carlton', aflWins: 15, aflLosses: 8, aflDraws: 0, aflPct: 114.2, aflwWins: 4, aflwLosses: 7, aflwDraws: 0, aflwPct: 86.9 },
      { team: 'westernbulldogs', aflWins: 12, aflLosses: 11, aflDraws: 0, aflPct: 103.8, aflwWins: 5, aflwLosses: 6, aflwDraws: 0, aflwPct: 91.2 },
      { team: 'essendon', aflWins: 11, aflLosses: 12, aflDraws: 0, aflPct: 97.6, aflwWins: 5, aflwLosses: 5, aflwDraws: 1, aflwPct: 95.8 },
      { team: 'goldcoast', aflWins: 10, aflLosses: 13, aflDraws: 0, aflPct: 91.4, aflwWins: 5, aflwLosses: 6, aflwDraws: 0, aflwPct: 88.7 },
      { team: 'stkilda', aflWins: 8, aflLosses: 15, aflDraws: 0, aflPct: 85.2, aflwWins: 5, aflwLosses: 6, aflwDraws: 0, aflwPct: 94.1 },
      { team: 'richmond', aflWins: 5, aflLosses: 18, aflDraws: 0, aflPct: 71.3, aflwWins: 5, aflwLosses: 6, aflwDraws: 0, aflwPct: 89.2 },
      { team: 'westcoast', aflWins: 3, aflLosses: 20, aflDraws: 0, aflPct: 60.1, aflwWins: 3, aflwLosses: 8, aflwDraws: 0, aflwPct: 62.4 },
    ],
  },
  2025: {
    pointsSystem: 'legacy',
    winner: 'Brisbane',
    hypotheticalWinner: null,
    standings: [
      // 2025 Season - data as of early season (will be updated)
      // Brisbane strong in both, AFL premiers 2024
      { team: 'brisbane', aflWins: 12, aflLosses: 6, aflDraws: 0, aflPct: 118.5, aflwWins: 8, aflwLosses: 2, aflwDraws: 0, aflwPct: 148.2 },
      // Hawthorn defending McClelland, strong start
      { team: 'hawthorn', aflWins: 11, aflLosses: 7, aflDraws: 0, aflPct: 108.4, aflwWins: 8, aflwLosses: 2, aflwDraws: 0, aflwPct: 165.3 },
      // Adelaide consistently strong AFLW
      { team: 'adelaide', aflWins: 10, aflLosses: 8, aflDraws: 0, aflPct: 102.6, aflwWins: 8, aflwLosses: 2, aflwDraws: 0, aflwPct: 158.4 },
      // Sydney strong AFL, improving AFLW
      { team: 'sydney', aflWins: 14, aflLosses: 4, aflDraws: 0, aflPct: 126.8, aflwWins: 6, aflwLosses: 4, aflwDraws: 0, aflwPct: 112.5 },
      // Geelong solid both comps
      { team: 'geelong', aflWins: 12, aflLosses: 6, aflDraws: 0, aflPct: 115.2, aflwWins: 6, aflwLosses: 4, aflwDraws: 0, aflwPct: 108.6 },
      // North Melbourne AFLW powerhouse, AFL improving
      { team: 'northmelbourne', aflWins: 5, aflLosses: 13, aflDraws: 0, aflPct: 72.4, aflwWins: 9, aflwLosses: 1, aflwDraws: 0, aflwPct: 198.4 },
      // Fremantle balanced
      { team: 'fremantle', aflWins: 10, aflLosses: 8, aflDraws: 0, aflPct: 104.2, aflwWins: 6, aflwLosses: 4, aflwDraws: 0, aflwPct: 118.6 },
      // Melbourne rebuilding but competitive
      { team: 'melbourne', aflWins: 9, aflLosses: 9, aflDraws: 0, aflPct: 98.4, aflwWins: 7, aflwLosses: 3, aflwDraws: 0, aflwPct: 132.8 },
      // Collingwood AFL strong, AFLW mid-pack
      { team: 'collingwood', aflWins: 11, aflLosses: 7, aflDraws: 0, aflPct: 106.8, aflwWins: 5, aflwLosses: 5, aflwDraws: 0, aflwPct: 96.4 },
      // Carlton
      { team: 'carlton', aflWins: 10, aflLosses: 8, aflDraws: 0, aflPct: 102.4, aflwWins: 5, aflwLosses: 5, aflwDraws: 0, aflwPct: 98.2 },
      // Port Adelaide
      { team: 'portadelaide', aflWins: 11, aflLosses: 7, aflDraws: 0, aflPct: 108.6, aflwWins: 5, aflwLosses: 5, aflwDraws: 0, aflwPct: 92.4 },
      // GWS
      { team: 'gws', aflWins: 10, aflLosses: 8, aflDraws: 0, aflPct: 100.2, aflwWins: 5, aflwLosses: 5, aflwDraws: 0, aflwPct: 94.6 },
      // Western Bulldogs
      { team: 'westernbulldogs', aflWins: 9, aflLosses: 9, aflDraws: 0, aflPct: 96.8, aflwWins: 5, aflwLosses: 5, aflwDraws: 0, aflwPct: 92.8 },
      // Essendon
      { team: 'essendon', aflWins: 8, aflLosses: 10, aflDraws: 0, aflPct: 92.4, aflwWins: 5, aflwLosses: 5, aflwDraws: 0, aflwPct: 96.2 },
      // St Kilda
      { team: 'stkilda', aflWins: 7, aflLosses: 11, aflDraws: 0, aflPct: 88.6, aflwWins: 5, aflwLosses: 5, aflwDraws: 0, aflwPct: 94.8 },
      // Gold Coast
      { team: 'goldcoast', aflWins: 8, aflLosses: 10, aflDraws: 0, aflPct: 90.2, aflwWins: 4, aflwLosses: 6, aflwDraws: 0, aflwPct: 86.4 },
      // Richmond rebuilding
      { team: 'richmond', aflWins: 4, aflLosses: 14, aflDraws: 0, aflPct: 68.4, aflwWins: 5, aflwLosses: 5, aflwDraws: 0, aflwPct: 92.6 },
      // West Coast struggling
      { team: 'westcoast', aflWins: 3, aflLosses: 15, aflDraws: 0, aflPct: 62.8, aflwWins: 3, aflwLosses: 7, aflwDraws: 0, aflwPct: 68.4 },
    ],
  },
};

// Calculate McClelland points for legacy system
export function calculateLegacyPoints(team) {
  const aflPoints = (team.aflWins * 4) + (team.aflDraws * 2);
  const aflwPoints = (team.aflwWins * 8) + (team.aflwDraws * 4);
  return aflPoints + aflwPoints;
}

// Calculate combined percentage for tiebreakers
export function calculateCombinedPercentage(team) {
  // Weight by games played (roughly)
  const aflGames = team.aflWins + team.aflLosses + team.aflDraws;
  const aflwGames = team.aflwWins + team.aflwLosses + team.aflwDraws;
  const totalGames = aflGames + aflwGames;

  if (totalGames === 0) return 0;

  // For teams without AFLW, just return AFL percentage
  if (aflwGames === 0) return team.aflPct;

  return ((team.aflPct * aflGames) + (team.aflwPct * aflwGames)) / totalGames;
}

// Get historical standings for a year
export function getHistoricalStandings(year) {
  const data = historicalData[year];
  if (!data) return null;

  return data.standings.map(team => ({
    ...team,
    mcClellandPoints: calculateLegacyPoints(team),
    combinedPct: calculateCombinedPercentage(team),
  })).sort((a, b) => {
    // Sort by points, then by combined percentage
    if (b.mcClellandPoints !== a.mcClellandPoints) {
      return b.mcClellandPoints - a.mcClellandPoints;
    }
    return b.combinedPct - a.combinedPct;
  });
}
