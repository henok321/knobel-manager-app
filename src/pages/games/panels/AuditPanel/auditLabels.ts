import type { TFunction } from 'i18next';
import type {
  AuditAction,
  AuditEntity,
} from '../../../../store/generatedApi.ts';
import { assertNever } from '../../../../utils/assertNever.ts';

export const actionColor = (action: AuditAction): string => {
  switch (action) {
    case 'create':
      return 'green';
    case 'update':
      return 'cobalt';
    case 'delete':
      return 'red';
    case 'setup':
      return 'gray';
    default:
      return assertNever(action);
  }
};

export const translateAuditAction = (
  t: TFunction,
  action: AuditAction,
): string => {
  switch (action) {
    case 'create':
      return t('gameDetail:audit.actions.create');
    case 'update':
      return t('gameDetail:audit.actions.update');
    case 'delete':
      return t('gameDetail:audit.actions.delete');
    case 'setup':
      return t('gameDetail:audit.actions.setup');
    default:
      return assertNever(action);
  }
};

export const translateAuditEntity = (
  t: TFunction,
  entity: AuditEntity,
): string => {
  switch (entity) {
    case 'game':
      return t('gameDetail:audit.entities.game');
    case 'owner':
      return t('gameDetail:audit.entities.owner');
    case 'team':
      return t('gameDetail:audit.entities.team');
    case 'player':
      return t('gameDetail:audit.entities.player');
    case 'score':
      return t('gameDetail:audit.entities.score');
    default:
      return assertNever(entity);
  }
};

// field is an open string, not a union: the backend flattens whatever columns an
// entity has. Known ones get a label, anything new falls back to its raw name
// rather than rendering an empty cell.
export const translateAuditField = (t: TFunction, field: string): string => {
  switch (field) {
    case 'name':
      return t('gameDetail:audit.fields.name');
    case 'status':
      return t('gameDetail:audit.fields.status');
    case 'team_size':
      return t('gameDetail:audit.fields.teamSize');
    case 'table_size':
      return t('gameDetail:audit.fields.tableSize');
    case 'number_of_rounds':
      return t('gameDetail:audit.fields.numberOfRounds');
    case 'team_id':
      return t('gameDetail:audit.fields.teamId');
    case 'player_id':
      return t('gameDetail:audit.fields.playerId');
    case 'table_id':
      return t('gameDetail:audit.fields.tableId');
    case 'score':
      return t('gameDetail:audit.fields.score');
    default:
      return field;
  }
};

// Owner ids are Firebase subs, long and meaningless to a reader; every other
// entity id is a short number worth showing.
export const formatEntityRef = (
  t: TFunction,
  entity: AuditEntity,
  entityID: string,
): string => {
  const label = translateAuditEntity(t, entity);

  if (entity === 'owner') {
    return label;
  }

  return `${label} #${entityID}`;
};

export const formatTimestamp = (locale: string, timestamp: string): string => {
  const parsed = new Date(timestamp);

  if (Number.isNaN(parsed.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(parsed);
};
