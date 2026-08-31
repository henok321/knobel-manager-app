import type { TFunction } from 'i18next';

import type { AuditAction } from '../../../../store/api.gen.ts';
import { assertNever } from '../../../../utils/assertNever.ts';
import {
  isGameStatus,
  translateGameStatus,
} from '../../../../utils/gameStatusHelpers.ts';

const HIDDEN_FIELDS = new Set(['id', 'created_at', 'updated_at', 'game_id']);

const SUBJECT_FIELDS: Record<string, string[]> = {
  scores: ['table_id', 'player_id'],
  players: ['team_id'],
};

export interface AuditLookups {
  teams: Map<number, string>;
  players: Map<number, string>;
  tables: Map<number, string>;
  owners: Map<string, string>;
}

export interface AuditChange {
  field: string;
  from: string;
  to: string;
}

const referenceLabel = (
  field: string,
  value: unknown,
  lookups: AuditLookups,
): string | undefined => {
  if (typeof value === 'string' && field === 'owner_sub') {
    return lookups.owners.get(value);
  }

  if (typeof value !== 'number') {
    return undefined;
  }

  switch (field) {
    case 'team_id':
      return lookups.teams.get(value);
    case 'player_id':
      return lookups.players.get(value);
    case 'table_id':
      return lookups.tables.get(value);
    default:
      return undefined;
  }
};

const formatValue = (
  field: string,
  value: unknown,
  lookups: AuditLookups,
): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return referenceLabel(field, value, lookups) ?? String(value);
};

export const describeChanges = (
  entity: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  lookups: AuditLookups,
): AuditChange[] => {
  const wholeRow = before === null || after === null;
  const subjectFields = new Set(SUBJECT_FIELDS[entity] ?? []);
  const removedOwner = entity === 'game_owners' && after === null;

  return [
    ...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]),
  ]
    .filter((field) => !HIDDEN_FIELDS.has(field))
    .filter((field) => !(wholeRow && subjectFields.has(field)))
    .filter((field) => !(removedOwner && field === 'owner_sub'))
    .filter((field) => (before?.[field] ?? null) !== (after?.[field] ?? null))
    .sort()
    .map((field) => ({
      field,
      from: formatValue(field, before?.[field], lookups),
      to: formatValue(field, after?.[field], lookups),
    }));
};

export const describeSubject = (
  entity: string,
  row: Record<string, unknown> | null,
  lookups: AuditLookups,
): string[] =>
  (SUBJECT_FIELDS[entity] ?? [])
    .map((field) => formatValue(field, row?.[field], lookups))
    .filter((label) => label !== '');

export const actionColor = (action: AuditAction): string => {
  switch (action) {
    case 'insert':
      return 'green';
    case 'update':
      return 'cobalt';
    case 'delete':
      return 'red';
    default:
      return assertNever(action);
  }
};

export const actionLabel = (t: TFunction, action: AuditAction): string => {
  switch (action) {
    case 'insert':
      return t('gameDetail:audit.actions.insert');
    case 'update':
      return t('gameDetail:audit.actions.update');
    case 'delete':
      return t('gameDetail:audit.actions.delete');
    default:
      return assertNever(action);
  }
};

export const entityLabel = (t: TFunction, entity: string): string => {
  switch (entity) {
    case 'games':
      return t('gameDetail:audit.entities.games');
    case 'game_owners':
      return t('gameDetail:audit.entities.gameOwners');
    case 'teams':
      return t('gameDetail:audit.entities.teams');
    case 'players':
      return t('gameDetail:audit.entities.players');
    case 'scores':
      return t('gameDetail:audit.entities.scores');
    default:
      return entity;
  }
};

const fieldLabel = (t: TFunction, field: string): string => {
  switch (field) {
    case 'game_name':
    case 'team_name':
    case 'player_name':
      return t('gameDetail:audit.fields.name');
    case 'status':
      return t('gameDetail:audit.fields.status');
    case 'team_size':
      return t('gameDetail:teamSize');
    case 'table_size':
      return t('gameDetail:tableSize');
    case 'number_of_rounds':
      return t('gameDetail:numberOfRounds');
    case 'score':
      return t('gameDetail:rounds.score');
    case 'team_id':
      return t('gameDetail:audit.entities.teams');
    case 'player_id':
      return t('gameDetail:audit.entities.players');
    case 'table_id':
      return t('gameDetail:rounds.table');
    case 'owner_sub':
      return t('gameDetail:audit.entities.gameOwners');
    default:
      return field;
  }
};

const valueLabel = (t: TFunction, field: string, value: string): string =>
  field === 'status' && isGameStatus(value)
    ? translateGameStatus(t, value)
    : value;

export const changeLabel = (
  t: TFunction,
  { field, from, to }: AuditChange,
): string => {
  const before = valueLabel(t, field, from);
  const after = valueLabel(t, field, to);

  return before && after
    ? `${fieldLabel(t, field)}: ${before} → ${after}`
    : `${fieldLabel(t, field)}: ${before || after}`;
};
