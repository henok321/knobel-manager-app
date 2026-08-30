import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type AuditLookups,
  describeChanges,
  describeSubject,
} from './auditChanges.ts';

const lookups: AuditLookups = {
  teams: new Map([
    [3, 'Team A'],
    [4, 'Team A'],
  ]),
  players: new Map([[7, 'Anna']]),
  tables: new Map([[12, 'Round 2 · Table 3']]),
  owners: new Map([['sub-1', 'owner@example.org']]),
};

describe('describeChanges', () => {
  it('lists every column of a created game', () => {
    assert.deepEqual(
      describeChanges(
        'games',
        null,
        {
          id: 1,
          game_name: 'Sommerturnier',
          team_size: 4,
          table_size: 4,
          number_of_rounds: 2,
          status: 'setup',
          created_at: 'now',
          updated_at: 'now',
        },
        lookups,
      ),
      [
        { field: 'game_name', from: '', to: 'Sommerturnier' },
        { field: 'number_of_rounds', from: '', to: '2' },
        { field: 'status', from: '', to: 'setup' },
        { field: 'table_size', from: '', to: '4' },
        { field: 'team_size', from: '', to: '4' },
      ],
    );
  });

  it('lists only the column that changed', () => {
    assert.deepEqual(
      describeChanges(
        'games',
        { status: 'setup', game_name: 'Sommer', updated_at: 'then' },
        { status: 'in_progress', game_name: 'Sommer', updated_at: 'now' },
        lookups,
      ),
      [{ field: 'status', from: 'setup', to: 'in_progress' }],
    );
  });

  it('names the admin that was added', () => {
    assert.deepEqual(
      describeChanges(
        'game_owners',
        null,
        { game_id: 1, owner_sub: 'sub-1' },
        lookups,
      ),
      [{ field: 'owner_sub', from: '', to: 'owner@example.org' }],
    );
  });

  it('drops the sub of a removed admin, which no longer resolves', () => {
    assert.deepEqual(
      describeChanges(
        'game_owners',
        { game_id: 1, owner_sub: 'sub-gone' },
        null,
        lookups,
      ),
      [],
    );
  });

  it('keeps a move between two teams that share a name', () => {
    assert.deepEqual(
      describeChanges(
        'players',
        { id: 7, player_name: 'Anna', team_id: 3 },
        { id: 7, player_name: 'Anna', team_id: 4 },
        lookups,
      ),
      [{ field: 'team_id', from: 'Team A', to: 'Team A' }],
    );
  });

  it('leaves the parent references to the subject line on insert', () => {
    assert.deepEqual(
      describeChanges(
        'scores',
        null,
        { id: 5, player_id: 7, table_id: 12, score: 12 },
        lookups,
      ),
      [{ field: 'score', from: '', to: '12' }],
    );
  });
});

describe('describeSubject', () => {
  it('names the table and player behind a score', () => {
    assert.deepEqual(
      describeSubject(
        'scores',
        { player_id: 7, table_id: 12, score: 15 },
        lookups,
      ),
      ['Round 2 · Table 3', 'Anna'],
    );
  });

  it('falls back to the raw id when the table is gone', () => {
    assert.deepEqual(
      describeSubject(
        'scores',
        { player_id: 7, table_id: 99, score: 15 },
        lookups,
      ),
      ['99', 'Anna'],
    );
  });

  it('names the team behind a player', () => {
    assert.deepEqual(describeSubject('players', { team_id: 3 }, lookups), [
      'Team A',
    ]);
  });

  it('has nothing to add for a game', () => {
    assert.deepEqual(
      describeSubject('games', { game_name: 'Sommerturnier' }, lookups),
      [],
    );
  });
});
