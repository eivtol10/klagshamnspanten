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
  setWinPct: number;
  gameWinPct: number;
  zeroLosses: number;
}

export function computeStats(data: PadelData): PlayerStats[] {
  const players = data.players;
  const stats: Record<string, PlayerStats> = {};
  for (const p of players) {
    stats[p] = { name: p, sessionsPlayed: 0, sessionsRested: 0, setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0, setWinPct: 0, gameWinPct: 0, zeroLosses: 0 };
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
      s.setWinPct = Math.round((s.setsWon / (s.sessionsPlayed * 3)) * 100);
      s.gameWinPct = Math.round((s.gamesWon / (s.gamesWon + s.gamesLost || 1)) * 100);
    }
  }
  return players.map((p) => stats[p]).sort((a, b) => b.setWinPct !== a.setWinPct ? b.setWinPct - a.setWinPct : b.gameWinPct - a.gameWinPct);
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
