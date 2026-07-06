export interface SetResult {
  team1: string[];
  team2: string[];
  score1: number;
  score2: number;
}

export interface Session {
  id: string;
  date: string;
  activePlayers: string[];
  restingPlayers: string[];
  sets: SetResult[];
}

export interface PadelData {
  season: string;
  players: string[];
  sessions: Session[];
}

export interface PlayerStats {
  name: string;
  sessionsPlayed: number;
  sessionsRested: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  avgSetDiff: number;
  avgGameDiff: number;
  zeroLosses: number;
}

export function computeStats(data: PadelData): PlayerStats[] {
  const players = data.players;
  const stats: Record<string, PlayerStats> = {};
  for (const p of players) {
    stats[p] = { name: p, sessionsPlayed: 0, sessionsRested: 0, setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0, avgSetDiff: 0, avgGameDiff: 0, zeroLosses: 0 };
  }
  for (const session of data.sessions) {
    for (const p of session.activePlayers) { if (stats[p]) stats[p].sessionsPlayed++; }
    for (const p of session.restingPlayers) { if (stats[p]) stats[p].sessionsRested++; }
    for (const set of session.sets) {
      const team1Won = set.score1 > set.score2;
      const team2Won = set.score2 > set.score1;
      for (const p of set.team1) {
        if (!stats[p]) continue;
        stats[p].gamesWon += set.score1;
        stats[p].gamesLost += set.score2;
        if (team1Won) stats[p].setsWon++;
        else if (team2Won) { stats[p].setsLost++; if (set.score1 === 0) stats[p].zeroLosses++; }
      }
      for (const p of set.team2) {
        if (!stats[p]) continue;
        stats[p].gamesWon += set.score2;
        stats[p].gamesLost += set.score1;
        if (team2Won) stats[p].setsWon++;
        else if (team1Won) { stats[p].setsLost++; if (set.score2 === 0) stats[p].zeroLosses++; }
      }
    }
  }
  for (const p of players) {
    const s = stats[p];
    if (s.sessionsPlayed > 0) {
      const setsPlayed = s.sessionsPlayed * 3;
      s.avgSetDiff = Math.round(((s.setsWon - s.setsLost) / setsPlayed) * 100) / 100;
      s.avgGameDiff = Math.round(((s.gamesWon - s.gamesLost) / setsPlayed) * 100) / 100;
    }
  }
  return players.map((p) => stats[p]).sort((a, b) => {
    if (b.avgSetDiff !== a.avgSetDiff) return b.avgSetDiff - a.avgSetDiff;
    if (b.avgGameDiff !== a.avgGameDiff) return b.avgGameDiff - a.avgGameDiff;
    if (b.setsWon !== a.setsWon) return b.setsWon - a.setsWon;
    return b.gamesWon - a.gamesWon;
  });
}

export interface PairStats {
  players: [string, string];
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  avgSetDiff: number;
  avgGameDiff: number;
  setsPlayed: number;
}

export function computePairStats(data: PadelData): PairStats[] {
  const pairMap: Record<string, PairStats> = {};

  function pairKey(a: string, b: string) {
    return [a, b].sort().join("||");
  }

  for (const session of data.sessions) {
    for (const set of session.sets) {
      const pairs = [
        { players: set.team1, won: set.score1 > set.score2, gamesWon: set.score1, gamesLost: set.score2 },
        { players: set.team2, won: set.score2 > set.score1, gamesWon: set.score2, gamesLost: set.score1 },
      ];

      for (const pair of pairs) {
        const key = pairKey(pair.players[0], pair.players[1]);
        if (!pairMap[key]) {
          pairMap[key] = {
            players: [pair.players[0], pair.players[1]] as [string, string],
            setsWon: 0,
            setsLost: 0,
            gamesWon: 0,
            gamesLost: 0,
            avgSetDiff: 0,
            avgGameDiff: 0,
            setsPlayed: 0,
          };
        }
        pairMap[key].setsPlayed++;
        pairMap[key].gamesWon += pair.gamesWon;
        pairMap[key].gamesLost += pair.gamesLost;
        if (pair.won) pairMap[key].setsWon++;
        else pairMap[key].setsLost++;
      }
    }
  }

  return Object.values(pairMap)
    .map((p) => ({
      ...p,
      avgSetDiff: Math.round(((p.setsWon - p.setsLost) / (p.setsPlayed || 1)) * 100) / 100,
      avgGameDiff: Math.round(((p.gamesWon - p.gamesLost) / (p.setsPlayed || 1)) * 100) / 100,
    }))
    .sort((a, b) => {
      if (b.avgSetDiff !== a.avgSetDiff) return b.avgSetDiff - a.avgSetDiff;
      if (b.avgGameDiff !== a.avgGameDiff) return b.avgGameDiff - a.avgGameDiff;
      if (b.setsWon !== a.setsWon) return b.setsWon - a.setsWon;
      return b.gamesWon - a.gamesWon;
    });
}

export function getFormPlayer(data: PadelData): { name: string; formDiff: number } | null {
  if (data.sessions.length === 0) return null;

  const formStats: Record<string, { gamesWon: number; gamesLost: number }> = {};
  for (const p of data.players) {
    formStats[p] = { gamesWon: 0, gamesLost: 0 };
  }

  for (const p of data.players) {
    const playerSessions = data.sessions
      .filter(s => s.activePlayers.includes(p))
      .slice(-3);

    for (const session of playerSessions) {
      for (const set of session.sets) {
        if (set.team1.includes(p)) {
          formStats[p].gamesWon += set.score1;
          formStats[p].gamesLost += set.score2;
        } else if (set.team2.includes(p)) {
          formStats[p].gamesWon += set.score2;
          formStats[p].gamesLost += set.score1;
        }
      }
    }
  }

  let best: { name: string; formDiff: number } | null = null;
  for (const p of data.players) {
    const { gamesWon, gamesLost } = formStats[p];
    const sets = data.sessions.filter(s => s.activePlayers.includes(p)).slice(-3).length * 3;
    if (sets === 0) continue;
    const diff = Math.round(((gamesWon - gamesLost) / sets) * 10) / 10;
    if (!best || diff > best.formDiff) {
      best = { name: p, formDiff: diff };
    }
  }
  return best;
}

export function generateMatches(players: string[]): { team1: string[]; team2: string[] }[] {
  if (players.length !== 4) return [];
  const [a, b, c, d] = players;
  return [
    { team1: [a, b], team2: [c, d] },
    { team1: [a, c], team2: [b, d] },
    { team1: [a, d], team2: [b, c] },
  ];
}
