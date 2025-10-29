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

export const mapPlayersToRankings = (
  teams: Team[],
  playersState: Record<number, Player | undefined>,
  scoresByPlayer: Record<number, number>,
): PlayerRanking[] => {
  const rankings: PlayerRanking[] = [];

  teams.forEach((team) => {
    if (!team) return;

    team.players.forEach((playerId) => {
      const player = playersState[playerId];
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

export const mapTeamsToRankings = (
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
