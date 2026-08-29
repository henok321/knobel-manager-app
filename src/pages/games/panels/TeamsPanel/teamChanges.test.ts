import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Team } from '../../../../store/generatedApi.ts';
import { teamChanges } from './teamChanges.ts';

const team: Team = {
  id: 1,
  name: 'Alpha',
  gameID: 1,
  players: [
    { id: 10, name: 'Ann', teamID: 1 },
    { id: 11, name: 'Bob', teamID: 1 },
  ],
};

describe('teamChanges', () => {
  it('reports no change when name and players are untouched', () => {
    const changes = teamChanges(team, 'Alpha', [
      { id: 10, name: 'Ann' },
      { id: 11, name: 'Bob' },
    ]);

    assert.equal(changes.nameChanged, false);
    assert.deepEqual(changes.renamedPlayers, []);
  });

  it('reports only the renamed player', () => {
    const changes = teamChanges(team, 'Alpha', [
      { id: 10, name: 'Ann' },
      { id: 11, name: 'Bobby' },
    ]);

    assert.equal(changes.nameChanged, false);
    assert.deepEqual(changes.renamedPlayers, [{ id: 11, name: 'Bobby' }]);
  });

  it('reports the team name independently of the players', () => {
    const changes = teamChanges(team, 'Beta', [{ id: 10, name: 'Ann' }]);

    assert.equal(changes.nameChanged, true);
    assert.deepEqual(changes.renamedPlayers, []);
  });

  it('treats a player the team does not know as renamed', () => {
    const changes = teamChanges(team, 'Alpha', [{ id: 99, name: 'Zoe' }]);

    assert.deepEqual(changes.renamedPlayers, [{ id: 99, name: 'Zoe' }]);
  });

  it('treats every player as renamed when the team has none', () => {
    const changes = teamChanges({ ...team, players: undefined }, 'Alpha', [
      { id: 10, name: 'Ann' },
    ]);

    assert.deepEqual(changes.renamedPlayers, [{ id: 10, name: 'Ann' }]);
  });
});
