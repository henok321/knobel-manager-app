import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { TFunction } from 'i18next';
import type {
  AuditAction,
  AuditEntity,
} from '../../../../store/generatedApi.ts';
import {
  actionColor,
  formatEntityRef,
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

  it('omits the id for owners and keeps it everywhere else', () => {
    assert.equal(
      formatEntityRef(t, 'owner', 'firebase-uid-abcdefghijklmnop'),
      'gameDetail:audit.entities.owner',
    );
    assert.equal(
      formatEntityRef(t, 'team', '5'),
      'gameDetail:audit.entities.team #5',
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
