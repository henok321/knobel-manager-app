import type {
  Player,
  Score,
  Table as TableModel,
  Team,
} from '../../../slices/types';

interface PlayerRanking {
  playerID: number;
  playerName: string;
  teamID: number;
  teamName: string;
  totalScore: number;
}

interface TeamRanking {
  teamID: number;
  teamName: string;
  totalScore: number;
}

const mapPlayersToRankings = (
  teams: Team[],
  players: Player[],
  scoresByPlayer: Record<number, number>,
): PlayerRanking[] => {
  const rankings: PlayerRanking[] = [];

  for (const team of teams) {
    if (!team) {
      continue;
    }

    for (const playerID of team.players) {
      const player = players.find((p) => p.id === playerID);
      if (!player) {
        continue;
      }

      rankings.push({
        playerID,
        playerName: player.name,
        teamID: team.id,
        teamName: team.name,
        totalScore: scoresByPlayer[playerID] || 0,
      });
    }
  }

  return rankings.sort((a, b) => b.totalScore - a.totalScore);
};

const mapTeamsToRankings = (
  teams: Team[],
  playerRankings: PlayerRanking[],
): TeamRanking[] => {
  const teamScores: Record<number, number> = {};

  for (const team of teams) {
    if (team) {
      teamScores[team.id] = 0;
    }
  }

  for (const playerRank of playerRankings) {
    teamScores[playerRank.teamID] =
      (teamScores[playerRank.teamID] || 0) + playerRank.totalScore;
  }

  const rankings: TeamRanking[] = Object.entries(teamScores).map(
    ([teamIDStr, totalScore]) => {
      const teamID = Number(teamIDStr);
      const team = teams.find((t) => t?.id === teamID);
      return {
        teamID,
        teamName: team?.name || 'Unknown',
        totalScore,
      };
    },
  );

  return rankings.sort((a, b) => b.totalScore - a.totalScore);
};

const aggregateScoresFromTables = (
  tables: TableModel[],
): Record<number, number> => {
  const allScores: Record<number, number> = {};

  for (const table of tables) {
    if (table.scores && Array.isArray(table.scores)) {
      for (const score of table.scores as Score[]) {
        const playerID = score.playerID;
        const scoreValue = score.score || 0;
        allScores[playerID] = (allScores[playerID] || 0) + scoreValue;
      }
    }
  }

  return allScores;
};

export type { PlayerRanking, TeamRanking };
export { aggregateScoresFromTables, mapPlayersToRankings, mapTeamsToRankings };
