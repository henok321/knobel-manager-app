import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { TFunction } from 'i18next';
import type {
  AuditAction,
  AuditEntity,
  AuditEvent,
  Game,
} from '../../../../store/generatedApi.ts';
import {
  actionColor,
  buildGameDirectory,
  describeAuditEntity,
  formatChangeValue,
  formatTimestamp,
  translateAuditAction,
  translateAuditEntity,
  translateAuditField,
} from './auditLabels.ts';

// Echoes the key back so the tests assert which key was chosen, not the wording.
const t = ((key: string) => key) as unknown as TFunction;

const ACTIONS: AuditAction[] = ['create', 'update', 'delete', 'setup'];
const ENTITIES: AuditEntity[] = ['game', 'owner', 'team', 'player', 'score'];

describe('auditLabels', () => {
  it('maps every action to a distinct key and colour', () => {
    const keys = ACTIONS.map((action) => translateAuditAction(t, action));
    assert.deepEqual(keys, [
      'gameDetail:audit.actions.create',
      'gameDetail:audit.actions.update',
      'gameDetail:audit.actions.delete',
      'gameDetail:audit.actions.setup',
    ]);

    assert.equal(new Set(keys).size, ACTIONS.length);
    assert.equal(
      ACTIONS.every((action) => actionColor(action).length > 0),
      true,
    );
  });

  it('maps every entity to a distinct key', () => {
    const keys = ENTITIES.map((entity) => translateAuditEntity(t, entity));

    assert.deepEqual(keys, [
      'gameDetail:audit.entities.game',
      'gameDetail:audit.entities.owner',
      'gameDetail:audit.entities.team',
      'gameDetail:audit.entities.player',
      'gameDetail:audit.entities.score',
    ]);
    assert.equal(new Set(keys).size, ENTITIES.length);
  });

  it('labels known fields and falls back to the raw name', () => {
    assert.equal(
      translateAuditField(t, 'team_size'),
      'gameDetail:audit.fields.teamSize',
    );
    assert.equal(
      translateAuditField(t, 'number_of_rounds'),
      'gameDetail:audit.fields.numberOfRounds',
    );

    // A field the backend adds later must still render as something.
    assert.equal(translateAuditField(t, 'future_column'), 'future_column');
  });
});

const GAME: Game = {
  id: 1,
  name: 'Turnier',
  teamSize: 2,
  tableSize: 2,
  numberOfRounds: 1,
  status: 'setup',
  owners: [
    { gameID: 1, ownerSub: 'sub-1', email: 'anna@example.org' },
    { gameID: 1, ownerSub: 'sub-2' },
  ],
  teams: [
    {
      id: 5,
      name: 'Die Knobelkoenige',
      gameID: 1,
      players: [{ id: 12, name: 'Anna', teamID: 5 }],
    },
  ],
};

const event = (
  partial: Pick<AuditEvent, 'entity' | 'entityID' | 'changes'>,
): Pick<AuditEvent, 'entity' | 'entityID' | 'changes'> => partial;

describe('describeAuditEntity', () => {
  const directory = buildGameDirectory(GAME);

  it('drops the id for the game, since the panel is scoped to one', () => {
    assert.equal(
      describeAuditEntity(
        t,
        directory,
        event({ entity: 'game', entityID: '1', changes: [] }),
      ),
      'gameDetail:audit.entities.game',
    );
  });

  it('resolves an owner sub to an email, falling back to the sub', () => {
    assert.equal(
      describeAuditEntity(
        t,
        directory,
        event({ entity: 'owner', entityID: 'sub-1', changes: [] }),
      ),
      'gameDetail:audit.entities.owner anna@example.org',
    );
    assert.equal(
      describeAuditEntity(
        t,
        directory,
        event({ entity: 'owner', entityID: 'sub-2', changes: [] }),
      ),
      'gameDetail:audit.entities.owner sub-2',
    );
  });

  it('prefers the name recorded in the event over the current one', () => {
    // A rename must read "Team 1 was renamed", not resolve to its new name and
    // repeat the right-hand side of its own diff.
    assert.equal(
      describeAuditEntity(
        t,
        directory,
        event({
          entity: 'team',
          entityID: '5',
          changes: [{ field: 'name', from: 'Team 1', to: 'Die Knobelkoenige' }],
        }),
      ),
      'gameDetail:audit.entities.team Team 1',
    );
  });

  it('names a deleted entity that is no longer in the game', () => {
    assert.equal(
      describeAuditEntity(
        t,
        directory,
        event({
          entity: 'team',
          entityID: '99',
          changes: [{ field: 'name', from: 'Gone', to: null }],
        }),
      ),
      'gameDetail:audit.entities.team Gone',
    );
  });

  it('falls back to the current name when the event carries none', () => {
    assert.equal(
      describeAuditEntity(
        t,
        directory,
        event({ entity: 'team', entityID: '5', changes: [] }),
      ),
      'gameDetail:audit.entities.team Die Knobelkoenige',
    );
  });

  it('identifies a score by its player', () => {
    assert.equal(
      describeAuditEntity(
        t,
        directory,
        event({
          entity: 'score',
          entityID: '500',
          changes: [
            { field: 'player_id', from: null, to: '12' },
            { field: 'score', from: null, to: '6' },
          ],
        }),
      ),
      'gameDetail:audit.entities.score Anna',
    );
  });

  it('keeps the id when nothing resolves', () => {
    assert.equal(
      describeAuditEntity(
        t,
        directory,
        event({ entity: 'player', entityID: '404', changes: [] }),
      ),
      'gameDetail:audit.entities.player #404',
    );
  });
});

describe('formatChangeValue', () => {
  const directory = buildGameDirectory(GAME);

  it('resolves foreign keys to names', () => {
    assert.equal(formatChangeValue(t, directory, 'player_id', '12'), 'Anna');
    assert.equal(
      formatChangeValue(t, directory, 'team_id', '5'),
      'Die Knobelkoenige',
    );
  });

  it('translates a game status through the shared helper', () => {
    assert.equal(
      formatChangeValue(t, directory, 'status', 'in_progress'),
      'gameDetail:status.in_progress',
    );
  });

  it('passes unresolvable ids and plain values through', () => {
    assert.equal(formatChangeValue(t, directory, 'player_id', '404'), '404');
    assert.equal(
      formatChangeValue(t, directory, 'name', 'Anything'),
      'Anything',
    );
    assert.equal(formatChangeValue(t, directory, 'status', 'bogus'), 'bogus');
  });

  it('renders a null side as the placeholder', () => {
    assert.equal(
      formatChangeValue(t, directory, 'name', null),
      'gameDetail:audit.empty',
    );
  });

  it('formats a timestamp and passes unparseable input through', () => {
    const iso = '2026-08-27T11:00:00Z';
    const formatted = formatTimestamp('de-DE', iso);

    // Deliberately not asserting the exact rendering: that is Intl's job, and the
    // wall-clock value depends on the machine's timezone. What matters is that the
    // ISO string got localised at all, and that garbage survives untouched.
    assert.notEqual(formatted, iso);
    assert.match(formatted, /\d{2}\.\d{2}\.\d{2}/);

    assert.equal(formatTimestamp('de-DE', 'not-a-date'), 'not-a-date');
  });
});
