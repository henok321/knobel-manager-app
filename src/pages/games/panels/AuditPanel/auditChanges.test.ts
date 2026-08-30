import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { describeChanges } from './auditChanges.ts';

describe('describeChanges', () => {
  it('lists the values of an inserted row', () => {
    assert.deepEqual(
      describeChanges(null, { id: 7, name: 'Alpha', team_size: 4 }),
      [
        { field: 'name', text: 'name: Alpha' },
        { field: 'team_size', text: 'team_size: 4' },
      ],
    );
  });

  it('lists only fields that actually changed', () => {
    assert.deepEqual(
      describeChanges(
        { name: 'Alpha', score: 12, updated_at: 'then' },
        { name: 'Alpha', score: 15, updated_at: 'now' },
      ),
      [{ field: 'score', text: 'score: 12 → 15' }],
    );
  });

  it('lists the values of a deleted row', () => {
    assert.deepEqual(describeChanges({ name: 'Alpha' }, null), [
      { field: 'name', text: 'name: Alpha' },
    ]);
  });

  it('treats null and missing as empty', () => {
    assert.deepEqual(
      describeChanges({ email: null }, { email: undefined }),
      [],
    );
  });
});
