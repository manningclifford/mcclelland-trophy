// Team metadata with colors and abbreviations
export const teams = {
  adelaide: {
    name: 'Adelaide',
    abbr: 'ADE',
    colors: { primary: '#002B5C', secondary: '#FFD200' },
  },
  brisbane: {
    name: 'Brisbane',
    abbr: 'BRI',
    colors: { primary: '#A30046', secondary: '#0054A4' },
  },
  carlton: {
    name: 'Carlton',
    abbr: 'CAR',
    colors: { primary: '#0E1E2D', secondary: '#FFFFFF' },
  },
  collingwood: {
    name: 'Collingwood',
    abbr: 'COL',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
  },
  essendon: {
    name: 'Essendon',
    abbr: 'ESS',
    colors: { primary: '#CC2031', secondary: '#000000' },
  },
  fremantle: {
    name: 'Fremantle',
    abbr: 'FRE',
    colors: { primary: '#2A0D45', secondary: '#FFFFFF' },
  },
  geelong: {
    name: 'Geelong',
    abbr: 'GEE',
    colors: { primary: '#001F3D', secondary: '#FFFFFF' },
  },
  goldcoast: {
    name: 'Gold Coast',
    abbr: 'GCS',
    colors: { primary: '#D52027', secondary: '#FFD200' },
  },
  gws: {
    name: 'GWS',
    abbr: 'GWS',
    colors: { primary: '#F47920', secondary: '#4A4F55' },
  },
  hawthorn: {
    name: 'Hawthorn',
    abbr: 'HAW',
    colors: { primary: '#4D2004', secondary: '#FFD200' },
  },
  melbourne: {
    name: 'Melbourne',
    abbr: 'MEL',
    colors: { primary: '#0F1131', secondary: '#CC2031' },
  },
  northmelbourne: {
    name: 'North Melbourne',
    abbr: 'NTH',
    colors: { primary: '#003690', secondary: '#FFFFFF' },
  },
  portadelaide: {
    name: 'Port Adelaide',
    abbr: 'PTA',
    colors: { primary: '#008AAB', secondary: '#000000' },
  },
  richmond: {
    name: 'Richmond',
    abbr: 'RIC',
    colors: { primary: '#FFD200', secondary: '#000000' },
  },
  stkilda: {
    name: 'St Kilda',
    abbr: 'STK',
    colors: { primary: '#ED0F05', secondary: '#FFFFFF' },
  },
  sydney: {
    name: 'Sydney',
    abbr: 'SYD',
    colors: { primary: '#ED171F', secondary: '#FFFFFF' },
  },
  westcoast: {
    name: 'West Coast',
    abbr: 'WCE',
    colors: { primary: '#002B5C', secondary: '#FFD200' },
  },
  westernbulldogs: {
    name: 'Western Bulldogs',
    abbr: 'WBD',
    colors: { primary: '#014896', secondary: '#CC2031' },
  },
};

// Map API team names to our team keys
export const teamNameMap = {
  'Adelaide Crows': 'adelaide',
  'Adelaide': 'adelaide',
  'Brisbane Lions': 'brisbane',
  'Brisbane': 'brisbane',
  'Carlton': 'carlton',
  'Collingwood': 'collingwood',
  'Essendon': 'essendon',
  'Fremantle': 'fremantle',
  'Geelong Cats': 'geelong',
  'Geelong': 'geelong',
  'Gold Coast Suns': 'goldcoast',
  'Gold Coast': 'goldcoast',
  'GWS Giants': 'gws',
  'GWS': 'gws',
  'Greater Western Sydney': 'gws',
  'Hawthorn': 'hawthorn',
  'Melbourne': 'melbourne',
  'North Melbourne': 'northmelbourne',
  'Port Adelaide': 'portadelaide',
  'Richmond': 'richmond',
  'St Kilda': 'stkilda',
  'Sydney Swans': 'sydney',
  'Sydney': 'sydney',
  'West Coast Eagles': 'westcoast',
  'West Coast': 'westcoast',
  'Western Bulldogs': 'westernbulldogs',
};

export function getTeamKey(name) {
  return teamNameMap[name] || name.toLowerCase().replace(/\s+/g, '');
}

export function getTeamInfo(teamKey) {
  return teams[teamKey] || { name: teamKey, abbr: teamKey.substring(0, 3).toUpperCase(), colors: { primary: '#666', secondary: '#999' } };
}
