import React, { useState, useEffect } from 'react';
import { getLinearTitleMeta, getAllEvents, getShieldSchedule } from '../services/linearTitleApi';
import { getTeamInfo } from '../data/teams';
import TeamLogo from './TeamLogo';

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start gap-4 px-6 py-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 w-40 flex-shrink-0 pt-0.5">{label}</p>
      <div className="text-sm text-stone-700 flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  );
}

function HolderCard({ teamKey, defenses, totalChanges, firstYear, wonFromEvent, shieldSchedule }) {
  const info = getTeamInfo(teamKey);

  // Won from row
  let wonFromContent = null;
  if (wonFromEvent) {
    const isHome = wonFromEvent.homeTeam === teamKey;
    const holderScore = isHome ? wonFromEvent.homeScore : wonFromEvent.awayScore;
    const oppScore = isHome ? wonFromEvent.awayScore : wonFromEvent.homeScore;
    const prevInfo = getTeamInfo(wonFromEvent.prevHolder);
    wonFromContent = (
      <>
        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: prevInfo.colors.primary }} />
        <span>{prevInfo.name}</span>
        <span className="text-stone-400">·</span>
        <span className="font-mono">{holderScore}–{oppScore}</span>
        <span className="text-stone-400">·</span>
        <span className="text-stone-500">{wonFromEvent.roundName}, {wonFromEvent.season}</span>
      </>
    );
  }

  // Last defended row
  let lastDefendedContent = null;
  if (defenses === 0) {
    lastDefendedContent = <span className="text-stone-400 italic">No defenses yet this reign</span>;
  } else if (shieldSchedule?.lastDefense) {
    const d = shieldSchedule.lastDefense;
    const oppInfo = getTeamInfo(d.opponentKey);
    lastDefendedContent = (
      <>
        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: oppInfo.colors.primary }} />
        <span>{oppInfo.name}</span>
        <span className="text-stone-400">·</span>
        <span className="font-mono">{d.holderScore}–{d.opponentScore}</span>
        <span className="text-stone-400">·</span>
        <span className="text-stone-500">{d.roundName}</span>
      </>
    );
  } else {
    lastDefendedContent = <span className="text-stone-400 italic">Loading…</span>;
  }

  // Next contention game row
  let nextGameContent = null;
  if (shieldSchedule === null || shieldSchedule?.nextGame === null) {
    nextGameContent = <span className="text-stone-400 italic">No upcoming fixtures</span>;
  } else if (shieldSchedule?.nextGame) {
    const ng = shieldSchedule.nextGame;
    const oppInfo = getTeamInfo(ng.opponentKey);
    const dateStr = ng.date
      ? new Date(ng.date.replace(' ', 'T')).toLocaleDateString('en-AU', {
          weekday: 'short', day: 'numeric', month: 'short',
        })
      : null;
    nextGameContent = (
      <>
        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: oppInfo.colors.primary }} />
        <span>{oppInfo.name}</span>
        <span className="text-xs bg-stone-200 text-stone-600 px-1.5 py-0.5">{ng.isHome ? 'Home' : 'Away'}</span>
        {ng.venue && <><span className="text-stone-400">·</span><span className="text-stone-500">{ng.venue}</span></>}
        <span className="text-stone-400">·</span>
        <span className="text-stone-500">{ng.roundName}{dateStr ? `, ${dateStr}` : ''}</span>
      </>
    );
  } else {
    nextGameContent = <span className="text-stone-400 italic">Loading…</span>;
  }

  return (
    <div className="bg-white border border-stone-200" style={{ borderLeftWidth: 4, borderLeftColor: info.colors.primary }}>
      <div className="flex items-center gap-5 px-6 py-5">
        <TeamLogo teamKey={teamKey} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Current Brunswick St Belt Holder</p>
          <h2 className="display-font text-2xl font-black text-stone-900">{info.name}</h2>
          <p className="text-sm text-stone-500 mt-0.5">{defenses + 1}-game winning streak with the Belt</p>
        </div>
        <div className="text-right hidden sm:block flex-shrink-0">
          <p className="display-font text-3xl font-black text-stone-900">{totalChanges.toLocaleString()}</p>
          <p className="text-xs text-stone-400 uppercase tracking-wide mt-0.5">title changes since {firstYear}</p>
        </div>
      </div>
      <div className="border-t border-stone-100 divide-y divide-stone-100">
        <InfoRow label="Won from">{wonFromContent}</InfoRow>
        <InfoRow label="Last defended">{lastDefendedContent}</InfoRow>
        <InfoRow label="Next contention game">{nextGameContent}</InfoRow>
      </div>
    </div>
  );
}

// A single row in the lineage table
function EventRow({ event, index, isNew }) {
  const winnerInfo = getTeamInfo(event.newHolder);
  const loserInfo = event.prevHolder ? getTeamInfo(event.prevHolder) : null;
  const margin = Math.abs(event.homeScore - event.awayScore);
  const isHomeWinner = event.homeTeam === event.newHolder;
  const winnerScore = isHomeWinner ? event.homeScore : event.awayScore;
  const loserScore = isHomeWinner ? event.awayScore : event.homeScore;

  return (
    <tr
      className={`border-b border-stone-100 hover:bg-stone-50 transition-colors ${isNew ? 'bg-amber-50' : ''}`}
    >
      {/* # */}
      <td className="py-2 px-3 text-xs text-stone-400 tabular-nums w-12 text-right">
        {event.type === 'inaugural' ? '★' : index}
      </td>

      {/* Season + round */}
      <td className="py-2 px-3 whitespace-nowrap">
        <span className="font-semibold text-stone-800 text-sm">{event.season}</span>
        <span className="text-stone-400 text-xs ml-1.5">{event.roundName}</span>
        {event.isFinal && (
          <span className="ml-1.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 font-semibold">F</span>
        )}
      </td>

      {/* Winner */}
      <td className="py-2 px-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: winnerInfo.colors.primary }}
          />
          <span className="text-sm font-semibold text-stone-900">{winnerInfo.name}</span>
        </div>
      </td>

      {/* Score */}
      <td className="py-2 px-3 text-center whitespace-nowrap">
        <span className="font-mono text-sm font-bold text-stone-900">{winnerScore}</span>
        <span className="text-gray-300 mx-1">–</span>
        <span className="font-mono text-sm text-stone-500">{loserScore}</span>
        <span className="text-xs text-stone-400 ml-1">(+{margin})</span>
      </td>

      {/* Defeated (prev holder) */}
      <td className="py-2 px-3">
        {loserInfo ? (
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: loserInfo.colors.primary }}
            />
            <span className="text-sm text-stone-600">{loserInfo.name}</span>
            {event.defensesBeforeLoss > 0 && (
              <span className="text-xs text-stone-400">
                ({event.defensesBeforeLoss}W)
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-stone-400 italic">Inaugural</span>
        )}
      </td>
    </tr>
  );
}

export default function LinearTitle() {
  const [meta, setMeta] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [shieldSchedule, setShieldSchedule] = useState(undefined);
  const [filterTeam, setFilterTeam] = useState('');
  const [sortCol, setSortCol] = useState('index');
  const [sortDir, setSortDir] = useState('asc');

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }

  useEffect(() => {
    Promise.all([getLinearTitleMeta(), getAllEvents()])
      .then(([m, evts]) => {
        setMeta(m);
        setEvents(evts);
        getShieldSchedule(m.currentHolder)
          .then(setShieldSchedule)
          .catch(() => setShieldSchedule(null));
      })
      .catch(err => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="bg-stone-50 border border-stone-200 p-8 text-center">
        <p className="text-stone-700 font-semibold mb-2">Data not available</p>
        <p className="text-stone-600 text-sm">{error}</p>
        <p className="text-stone-500 text-xs mt-3">
          Run <code className="bg-stone-100 px-1">npm run build:linear-title</code> to generate the data file.
        </p>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="flex items-center justify-center py-16 text-stone-500">
        <svg className="animate-spin h-5 w-5 mr-3 text-stone-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading…
      </div>
    );
  }

  // Unique teams that have ever held the title, for the filter
  const titledTeams = [...new Set(events.map(e => e.newHolder))].sort((a, b) =>
    getTeamInfo(a).name.localeCompare(getTeamInfo(b).name)
  );

  const filteredEvents = filterTeam
    ? events.filter(e => e.newHolder === filterTeam || e.prevHolder === filterTeam)
    : events;

  // Pre-compute sequential change numbers
  let _counter = 0;
  const eventsWithNumbers = filteredEvents.map(e => ({
    ...e,
    changeNumber: e.type === 'change' ? ++_counter : null,
  }));

  // Apply sort
  const sortedEvents = [...eventsWithNumbers].sort((a, b) => {
    let av, bv;
    if (sortCol === 'index')   { av = a.changeNumber ?? 0; bv = b.changeNumber ?? 0; }
    else if (sortCol === 'season') { av = a.season * 1000 + (a.round || 0); bv = b.season * 1000 + (b.round || 0); }
    else if (sortCol === 'winner') { av = getTeamInfo(a.newHolder).name; bv = getTeamInfo(b.newHolder).name; }
    else if (sortCol === 'margin') { av = Math.abs((a.homeScore||0) - (a.awayScore||0)); bv = Math.abs((b.homeScore||0) - (b.awayScore||0)); }
    else if (sortCol === 'defeated') { av = a.prevHolder ? getTeamInfo(a.prevHolder).name : ''; bv = b.prevHolder ? getTeamInfo(b.prevHolder).name : ''; }
    else { av = 0; bv = 0; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Compute total games held and longest reign (in games) from the full events list.
  // Each ended reign = defensesBeforeLoss + 1 games (defenses won + the game they lost).
  // The current holder's ongoing reign = currentDefenses games so far.
  const gamesHeld = {};
  const longestReignGames = {};
  for (const event of events) {
    if (event.type === 'change' && event.prevHolder) {
      const g = event.defensesBeforeLoss + 1;
      gamesHeld[event.prevHolder] = (gamesHeld[event.prevHolder] || 0) + g;
      longestReignGames[event.prevHolder] = Math.max(longestReignGames[event.prevHolder] || 0, g);
    }
  }
  if (meta.currentHolder) {
    gamesHeld[meta.currentHolder] = (gamesHeld[meta.currentHolder] || 0) + meta.currentDefenses;
    longestReignGames[meta.currentHolder] = Math.max(
      longestReignGames[meta.currentHolder] || 0,
      meta.currentDefenses
    );
  }

  // All-time stats sorted by total games held (most dominant overall)
  const sortedTeamStats = Object.entries(meta.teamStats)
    .map(([key, stats]) => ({
      key, ...stats,
      totalGamesHeld: gamesHeld[key] || 0,
      longestReignGames: longestReignGames[key] || 0,
    }))
    .sort((a, b) => b.totalGamesHeld !== a.totalGamesHeld
      ? b.totalGamesHeld - a.totalGamesHeld
      : b.reigns - a.reigns);

  return (
    <div className="space-y-10">

      {/* Description */}
      <p className="text-stone-500 leading-relaxed">
        The Brunswick St Belt is a reigning champion style linear title — an unofficial championship passed from club to club,
        named after Brunswick Street Oval, where the first VFL game was played in 1897. It is not awarded for finishing
        top of the ladder, but won on the field, game by game. A club holds the Belt until they lose it to whoever beats them.
        It has changed hands {meta.totalChanges.toLocaleString()} times since {meta.firstYear}.
      </p>

      {/* Current holder */}
      <HolderCard
        teamKey={meta.currentHolder}
        defenses={meta.currentDefenses}
        totalChanges={meta.totalChanges}
        firstYear={meta.firstYear}
        wonFromEvent={events.filter(e => e.type === 'change').at(-1)}
        shieldSchedule={shieldSchedule}
      />

      {/* Recent holders */}
      {(() => {
        // Skip the most recent change (current holder) — shown in the holder card above
        const allChanges = events.filter(e => e.type === 'change');
        const changes = allChanges.slice(-6, -1).reverse();
        // The event where each holder lost is one step ahead in allChanges:
        // changes[i] = allChanges[n-2-i], and it lost to allChanges[n-1-i]
        const currentHolderEvent = allChanges.at(-1);
        return (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Recent title changes</p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-px bg-stone-200 border border-stone-200">
              {changes.map((e, i) => {
                const info = getTeamInfo(e.newHolder);
                const margin = Math.abs((e.homeScore || 0) - (e.awayScore || 0));
                const defeated = e.prevHolder ? getTeamInfo(e.prevHolder).name : null;
                const nextEvent = i === 0 ? currentHolderEvent : changes[i - 1];
                const defenses = nextEvent?.defensesBeforeLoss ?? 0;
                return (
                  <div key={i} className="bg-white px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: info.colors.primary }} />
                      <span className="text-xs font-semibold text-stone-800">{info.name}</span>
                    </div>
                    <p className="text-xs text-stone-400">R{e.round}, {e.season}</p>
                    {defeated && <p className="text-xs text-stone-500 mt-0.5">def. {defeated} by {margin}</p>}
                    <p className="text-xs text-stone-400 mt-0.5">
                      {defenses === 0 ? 'lost immediately' : `defended ${defenses}×`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* All-time stats */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-stone-200" />
          <h2 className="display-font text-lg font-bold text-stone-700 uppercase tracking-widest">All-time Belt stats</h2>
          <div className="h-px flex-1 bg-stone-200" />
        </div>
        <div className="bg-white border border-stone-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="py-2 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider w-8">#</th>
                <th className="py-2 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Team</th>
                <th className="py-2 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Reigns</th>
                <th className="py-2 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Total games held</th>
                <th className="py-2 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Longest reign</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeamStats.map((t, i) => {
                const info = getTeamInfo(t.key);
                return (
                  <tr key={t.key} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-2 px-4 text-stone-400 text-sm">{i + 1}</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: info.colors.primary }} />
                        <span className="text-sm font-medium text-stone-800">{info.name}</span>
                        {t.key === meta.currentHolder && (
                          <span className="text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5">Current</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-4 text-center text-sm font-semibold text-stone-800">{t.reigns}</td>
                    <td className="py-2 px-4 text-center text-sm font-semibold text-stone-800">{t.totalGamesHeld}</td>
                    <td className="py-2 px-4 text-center text-sm text-stone-600">
                      {t.longestReignGames} game{t.longestReignGames !== 1 ? 's' : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Full lineage */}
      <section>
      <div className="flex items-center gap-4 mb-4">
        <div className="h-px flex-1 bg-stone-200" />
        <h2 className="display-font text-lg font-bold text-stone-700 uppercase tracking-widest">
          Title Lineage
          <span className="ml-2 text-xs font-normal text-stone-400 normal-case tracking-normal">
            {filteredEvents.length.toLocaleString()} event{filteredEvents.length !== 1 ? 's' : ''}
          </span>
        </h2>
        <div className="h-px flex-1 bg-stone-200" />
      </div>
      <div className="bg-white border border-stone-200 overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-200 px-5 py-3 flex items-center justify-end gap-4 flex-wrap">
          <select
            value={filterTeam}
            onChange={e => setFilterTeam(e.target.value)}
            className="px-3 py-1.5 border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            <option value="">All teams</option>
            {titledTeams.map(key => (
              <option key={key} value={key}>{getTeamInfo(key).name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200 sticky top-0">
              <tr>
                {[
                  { col: 'index', label: '#', cls: 'text-right w-12' },
                  { col: 'season', label: 'Season', cls: 'text-left' },
                  { col: 'winner', label: 'New holder', cls: 'text-left' },
                  { col: 'margin', label: 'Score', cls: 'text-center' },
                  { col: 'defeated', label: 'Defeated', cls: 'text-left' },
                ].map(({ col, label, cls }) => (
                  <th
                    key={col}
                    onClick={() => toggleSort(col)}
                    className={`py-2 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider cursor-pointer hover:text-stone-800 select-none ${cls}`}
                  >
                    {label}
                    {sortCol === col && <span className="ml-1 text-stone-400">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event) => {
                const isLatest = event === eventsWithNumbers[eventsWithNumbers.length - 1] && !filterTeam;
                return (
                  <EventRow
                    key={`${event.season}-${event.round}-${event.homeTeam}-${event.awayTeam}`}
                    event={event}
                    index={event.changeNumber}
                    isNew={isLatest}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </section>

      <p className="text-xs text-stone-400 text-center pb-4">Source: Squiggle API.</p>
    </div>
  );
}
