import { Score, Table as TableModel } from '../../../generated/models';
import { Player, Team } from '../../../slices/types.ts';

interface PlayerRanking {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  totalScore: number;
}

interface TeamRanking {
  teamId: number;
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

    team.players.forEach((playerId) => {
      const player = players.find((p) => p.id === playerId);
      if (!player) return;

      rankings.push({
        playerId,
        playerName: player.name,
        teamId: team.id,
        teamName: team.name,
        totalScore: scoresByPlayer[playerId] || 0,
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
    teamScores[playerRank.teamId] =
      (teamScores[playerRank.teamId] || 0) + playerRank.totalScore;
  });

  const rankings: TeamRanking[] = Object.entries(teamScores).map(
    ([teamIdStr, totalScore]) => {
      const teamId = Number(teamIdStr);
      const team = teams.find((t) => t?.id === teamId);
      return {
        teamId,
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
        const playerId = score.playerID;
        const scoreValue = score.score || 0;
        allScores[playerId] = (allScores[playerId] || 0) + scoreValue;
      });
    }
  });

  return allScores;
};
export type { PlayerRanking, TeamRanking };
export { mapPlayersToRankings, mapTeamsToRankings, aggregateScoresFromTables };
