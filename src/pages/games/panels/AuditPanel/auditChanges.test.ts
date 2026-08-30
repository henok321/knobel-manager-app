import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type AuditLookups,
  describeChanges,
  describeSubject,
} from './auditChanges.ts';

const lookups: AuditLookups = {
  teams: new Map([[3, 'Alpha']]),
  players: new Map([[7, 'Anna']]),
  tables: new Map([[12, 'Round 2 · Table 3']]),
  owners: new Map([['sub-1', 'owner@example.org']]),
};

describe('describeChanges', () => {
  it('lists the values of an inserted row', () => {
    assert.deepEqual(
      describeChanges('players', null, { id: 7, player_name: 'Anna' }, lookups),
      [{ field: 'player_name', text: 'player_name: Anna' }],
    );
  });

  it('lists only fields that actually changed', () => {
    assert.deepEqual(
      describeChanges(
        'scores',
        { player_name: 'Anna', score: 12, updated_at: 'then' },
        { player_name: 'Anna', score: 15, updated_at: 'now' },
        lookups,
      ),
      [{ field: 'score', text: 'score: 12 → 15' }],
    );
  });

  it('lists the values of a deleted row', () => {
    assert.deepEqual(
      describeChanges(
        'game_owners',
        { game_id: 1, owner_sub: 'sub-1' },
        null,
        lookups,
      ),
      [{ field: 'owner_sub', text: 'owner: owner@example.org' }],
    );
  });

  it('falls back to the raw value when a reference is unknown', () => {
    assert.deepEqual(describeChanges('teams', null, { team_id: 99 }, lookups), [
      { field: 'team_id', text: 'team: 99' },
    ]);
  });

  it('drops parent references the subject line already names', () => {
    assert.deepEqual(
      describeChanges(
        'scores',
        null,
        { player_id: 7, table_id: 12, score: 12 },
        lookups,
      ),
      [{ field: 'score', text: 'score: 12' }],
    );
  });

  it('keeps a parent reference that actually changed', () => {
    assert.deepEqual(
      describeChanges('players', { team_id: 3 }, { team_id: 99 }, lookups),
      [{ field: 'team_id', text: 'team: Alpha → 99' }],
    );
  });

  it('treats null and missing as empty', () => {
    assert.deepEqual(
      describeChanges('teams', { email: null }, { email: undefined }, lookups),
      [],
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

  it('names the team behind a player', () => {
    assert.deepEqual(describeSubject('players', { team_id: 3 }, lookups), [
      'Alpha',
    ]);
  });

  it('skips unknown references and unrelated entities', () => {
    assert.deepEqual(describeSubject('scores', { table_id: 99 }, lookups), []);
    assert.deepEqual(describeSubject('games', { game_name: 'x' }, lookups), []);
  });
});
