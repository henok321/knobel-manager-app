import {
  Player,
  Team,
  Score,
  Table as TableModel,
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

  teams.forEach((team) => {
    if (!team) return;

    team.players.forEach((playerID) => {
      const player = players.find((p) => p.id === playerID);
      if (!player) return;

      rankings.push({
        playerID,
        playerName: player.name,
        teamID: team.id,
        teamName: team.name,
        totalScore: scoresByPlayer[playerID] || 0,
      });
    });
  });

  return rankings.sort((a, b) => b.totalScore - a.totalScore);
};

const mapTeamsToRankings = (
  teams: Team[],
  playerRankings: PlayerRanking[],
): TeamRanking[] => {
  const teamScores: Record<number, number> = {};

  teams.forEach((team) => {
    if (team) {
      teamScores[team.id] = 0;
    }
  });

  playerRankings.forEach((playerRank) => {
    teamScores[playerRank.teamID] =
      (teamScores[playerRank.teamID] || 0) + playerRank.totalScore;
  });

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

  tables.forEach((table) => {
    if (table.scores && Array.isArray(table.scores)) {
      table.scores.forEach((score: Score) => {
        const playerID = score.playerID;
        const scoreValue = score.score || 0;
        allScores[playerID] = (allScores[playerID] || 0) + scoreValue;
      });
    }
  });

  return allScores;
};
export type { PlayerRanking, TeamRanking };
export { mapPlayersToRankings, mapTeamsToRankings, aggregateScoresFromTables };
