import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { GameRound, Table } from '../../../../store/api.gen.ts';
import { tableAssignmentsByPlayer } from './tableAssignments.ts';

const rounds: GameRound[] = [
  { id: 50, gameID: 1, roundNumber: 1, status: 'completed' },
  { id: 51, gameID: 1, roundNumber: 2, status: 'in_progress' },
];

const table = (
  id: number,
  tableNumber: number,
  roundID: number,
  playerIds: number[],
): Table => ({
  id,
  tableNumber,
  roundID,
  players: playerIds.map((playerId) => ({
    id: playerId,
    name: `Player ${playerId}`,
    teamID: 1,
  })),
});

describe('tableAssignmentsByPlayer', () => {
  it('returns nothing without tables', () => {
    assert.deepEqual(tableAssignmentsByPlayer([], rounds), {});
  });

  it('collects one entry per round a player sits at a table', () => {
    const assignments = tableAssignmentsByPlayer(
      [table(1, 3, 50, [10, 11]), table(2, 7, 51, [10])],
      rounds,
    );

    assert.deepEqual(assignments, {
      10: [
        { roundNumber: 1, tableNumber: 3 },
        { roundNumber: 2, tableNumber: 7 },
      ],
      11: [{ roundNumber: 1, tableNumber: 3 }],
    });
  });

  it('ignores tables without players', () => {
    const assignments = tableAssignmentsByPlayer(
      [{ id: 1, tableNumber: 3, roundID: 50 }, table(2, 7, 51, [10])],
      rounds,
    );

    assert.deepEqual(assignments, { 10: [{ roundNumber: 2, tableNumber: 7 }] });
  });

  it('falls back to the round id when the round is unknown', () => {
    const assignments = tableAssignmentsByPlayer(
      [table(1, 3, 99, [10])],
      rounds,
    );

    assert.deepEqual(assignments, {
      10: [{ roundNumber: 99, tableNumber: 3 }],
    });
  });

  it('falls back to the round id when the game has no rounds', () => {
    const assignments = tableAssignmentsByPlayer([table(1, 3, 50, [10])]);

    assert.deepEqual(assignments, {
      10: [{ roundNumber: 50, tableNumber: 3 }],
    });
  });
});
