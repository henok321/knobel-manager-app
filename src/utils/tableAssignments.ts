import type { GameRound, Table } from '../store/api.gen.ts';
import { roundNumberById } from './rounds.ts';

export type RoundTableAssignment = {
  roundNumber: number;
  tableNumber: number;
};

export const tableAssignmentsByPlayer = (
  tables: Table[],
  rounds: GameRound[] = [],
): Record<number, RoundTableAssignment[]> => {
  const roundNumbers = roundNumberById(rounds);
  const assignments: Record<number, RoundTableAssignment[]> = {};

  for (const table of tables) {
    const tablePlayers = table.players;
    if (!tablePlayers) {
      continue;
    }
    const tableRoundNumber = roundNumbers.get(table.roundID) ?? table.roundID;
    for (const player of tablePlayers) {
      const id = player.id;
      assignments[id] ??= [];
      assignments[id].push({
        roundNumber: tableRoundNumber,
        tableNumber: table.tableNumber,
      });
    }
  }

  return assignments;
};
