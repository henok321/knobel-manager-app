import type { Table, Team } from '../store/api.gen.ts';

export interface RankingsRow {
  id: number;
  name: string;
  teamName?: string;
  totalScore: number;
}

const byScoreDescending = (a: RankingsRow, b: RankingsRow) =>
  b.totalScore - a.totalScore;

export const mapPlayersToRankings = (
  teams: Team[],
  scoresByPlayer: Record<number, number>,
): RankingsRow[] =>
  teams
    .flatMap((team) =>
      (team.players ?? []).map((player) => ({
        id: player.id,
        name: player.name,
        teamName: team.name,
        totalScore: scoresByPlayer[player.id] ?? 0,
      })),
    )
    .sort(byScoreDescending);

export const mapTeamsToRankings = (
  teams: Team[],
  scoresByPlayer: Record<number, number>,
): RankingsRow[] =>
  teams
    .map((team) => ({
      id: team.id,
      name: team.name,
      totalScore: (team.players ?? []).reduce(
        (sum, player) => sum + (scoresByPlayer[player.id] ?? 0),
        0,
      ),
    }))
    .sort(byScoreDescending);

export const aggregateScoresFromTables = (
  tables: Table[],
): Record<number, number> => {
  const scoresByPlayer: Record<number, number> = {};

  for (const { playerID, score } of tables.flatMap(
    (table) => table.scores ?? [],
  )) {
    scoresByPlayer[playerID] = (scoresByPlayer[playerID] ?? 0) + score;
  }

  return scoresByPlayer;
};
