import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Player, Table } from '../../../../store/api.gen.ts';
import { filterAndSortTables, roundTablesErrorMessage } from './roundTables.ts';

const player = (id: number, name: string): Player => ({
  id,
  name,
  teamID: 1,
});

const table = (tableNumber: number, players?: Player[]): Table => ({
  id: tableNumber * 10,
  tableNumber,
  roundID: 1,
  players,
});

describe('filterAndSortTables', () => {
  const tables = [
    table(3, [player(1, 'Ann')]),
    table(1, [player(2, 'Bob'), player(3, 'Cara')]),
    table(2, [player(4, 'anna')]),
  ];

  type Case = {
    name: string;
    searchQuery: string;
    expected: number[];
  };

  const cases: Case[] = [
    {
      name: 'sorts by table number when no query is given',
      searchQuery: '',
      expected: [1, 2, 3],
    },
    {
      name: 'treats a whitespace-only query as no query',
      searchQuery: '   ',
      expected: [1, 2, 3],
    },
    {
      name: 'matches player names case-insensitively',
      searchQuery: 'ANN',
      expected: [2, 3],
    },
    {
      name: 'matches partial player names',
      searchQuery: 'ar',
      expected: [1],
    },
    {
      name: 'returns nothing when no player matches',
      searchQuery: 'zoe',
      expected: [],
    },
  ];

  for (const { name, searchQuery, expected } of cases) {
    it(name, () => {
      assert.deepStrictEqual(
        filterAndSortTables(tables, searchQuery).map(
          (result) => result.tableNumber,
        ),
        expected,
      );
    });
  }

  it('skips tables without players when filtering', () => {
    assert.deepStrictEqual(
      filterAndSortTables([table(1), table(2, [player(1, 'Ann')])], 'ann').map(
        (result) => result.tableNumber,
      ),
      [2],
    );
  });

  it('leaves the input order untouched', () => {
    const input = [table(2), table(1)];
    filterAndSortTables(input, '');

    assert.deepStrictEqual(
      input.map((result) => result.tableNumber),
      [2, 1],
    );
  });
});

describe('roundTablesErrorMessage', () => {
  const fallback = 'fallback';

  it('returns null while the query has no error', () => {
    assert.equal(roundTablesErrorMessage(undefined, fallback), null);
  });

  it('returns null for a missing round (404)', () => {
    assert.equal(
      roundTablesErrorMessage({ status: 404, data: undefined }, fallback),
      null,
    );
  });

  it('returns the backend message for other failures', () => {
    assert.equal(
      roundTablesErrorMessage(
        { status: 500, data: { error: 'boom' } },
        fallback,
      ),
      'boom',
    );
  });

  it('falls back when the failure carries no readable message', () => {
    assert.equal(
      roundTablesErrorMessage({ message: 'serialized' }, fallback),
      fallback,
    );
  });

  it('shows nothing when there is no error object at all', () => {
    assert.equal(roundTablesErrorMessage(undefined, fallback), null);
  });
});
