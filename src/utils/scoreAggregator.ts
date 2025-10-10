import { Table as TableModel, Score } from '../generated/models';

/**
 * Aggregates scores from multiple tables
 * @param tables Array of tables containing scores
 * @returns Record mapping playerID to total score
 */
export const aggregateScoresFromTables = (
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
