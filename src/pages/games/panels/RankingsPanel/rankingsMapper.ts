import type { Table, Team } from '../../../../store/generatedApi.ts';

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
  scoresByPlayer: Record<number, number>,
): PlayerRanking[] => {
  const rankings: PlayerRanking[] = [];

  for (const team of teams) {
    for (const teamPlayer of team.players ?? []) {
      rankings.push({
        playerID: teamPlayer.id,
        playerName: teamPlayer.name,
        teamID: team.id,
        teamName: team.name,
        totalScore: scoresByPlayer[teamPlayer.id] || 0,
      });
    }
  }

  return rankings.sort((a, b) => b.totalScore - a.totalScore);
};

const mapTeamsToRankings = (
  teams: Team[],
  scoresByPlayer: Record<number, number>,
): TeamRanking[] => {
  const rankings: TeamRanking[] = teams.map((team) => ({
    teamID: team.id,
    teamName: team.name,
    totalScore: (team.players ?? []).reduce(
      (sum, teamPlayer) => sum + (scoresByPlayer[teamPlayer.id] || 0),
      0,
    ),
  }));

  return rankings.sort((a, b) => b.totalScore - a.totalScore);
};

const aggregateScoresFromTables = (tables: Table[]): Record<number, number> => {
  const allScores: Record<number, number> = {};

  for (const table of tables) {
    if (table.scores) {
      for (const score of table.scores) {
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
