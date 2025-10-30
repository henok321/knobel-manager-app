import { Player, Team } from '../slices/types';

export interface PlayerRanking {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  totalScore: number;
}

export interface TeamRanking {
  teamId: number;
  teamName: string;
  totalScore: number;
}

/**
 * Maps players and their scores to PlayerRanking objects
 */
export const mapPlayersToRankings = (
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

/**
 * Maps teams and aggregated player scores to TeamRanking objects
 */
export const mapTeamsToRankings = (
  teams: Team[],
  playerRankings: PlayerRanking[],
): TeamRanking[] => {
  const teamScores: Record<number, number> = {};

  // Initialize all teams with 0 score
  teams.forEach((team) => {
    if (team) {
      teamScores[team.id] = 0;
    }
  });

  // Add up player scores for each team
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
