import type { GameRound, Table } from '../../../../store/api.gen.ts';
import type { RoundTableAssignment } from './TeamAssignmentMatrix.tsx';

export const tableAssignmentsByPlayer = (
  tables: Table[],
  rounds: GameRound[] = [],
): Record<number, RoundTableAssignment[]> => {
  const roundNumberByRoundId = new Map(
    rounds.map((round) => [round.id, round.roundNumber]),
  );
  const assignments: Record<number, RoundTableAssignment[]> = {};

  for (const table of tables) {
    const tablePlayers = table.players;
    if (!tablePlayers) {
      continue;
    }
    const tableRoundNumber =
      roundNumberByRoundId.get(table.roundID) ?? table.roundID;
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
