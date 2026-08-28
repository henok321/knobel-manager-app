import type { TFunction } from 'i18next';
import type {
  AuditAction,
  AuditChange,
  AuditEntity,
  AuditEvent,
  Game,
  GameStatus,
} from '../../../../store/generatedApi.ts';
import { assertNever } from '../../../../utils/assertNever.ts';
import { translateGameStatus } from '../../../../utils/gameStatusHelpers.ts';

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

// An audit row is history, so the name recorded in the event wins over the current
// one: a deleted entity is no longer in the game at all, and a renamed one would
// otherwise resolve to its new name and read circularly against its own diff.
// from ?? to picks the old value for updates and deletes, the new one for creates.
const recordedValue = (
  changes: AuditChange[],
  field: string,
): string | null => {
  const change = changes.find((candidate) => candidate.field === field);

  if (!change) {
    return null;
  }

  return change.from ?? change.to;
};

export interface GameDirectory {
  teams: Map<number, string>;
  players: Map<number, string>;
  owners: Map<string, string>;
}

export const buildGameDirectory = (game: Game): GameDirectory => {
  const teams = new Map<number, string>();
  const players = new Map<number, string>();
  const owners = new Map<string, string>();

  for (const team of game.teams ?? []) {
    teams.set(team.id, team.name);

    for (const player of team.players ?? []) {
      players.set(player.id, player.name);
    }
  }

  for (const owner of game.owners) {
    owners.set(owner.ownerSub, owner.email ?? owner.ownerSub);
  }

  return { teams, players, owners };
};

const named = (label: string, name: string | undefined, id: string): string =>
  name ? `${label} ${name}` : `${label} #${id}`;

export const describeAuditEntity = (
  t: TFunction,
  directory: GameDirectory,
  event: Pick<AuditEvent, 'entity' | 'entityID' | 'changes'>,
): string => {
  const label = translateAuditEntity(t, event.entity);

  switch (event.entity) {
    // The whole panel is scoped to one game, so an id here says nothing.
    case 'game':
      return label;
    case 'owner':
      return `${label} ${directory.owners.get(event.entityID) ?? event.entityID}`;
    case 'team':
      return named(
        label,
        recordedValue(event.changes, 'name') ??
          directory.teams.get(Number(event.entityID)),
        event.entityID,
      );
    case 'player':
      return named(
        label,
        recordedValue(event.changes, 'name') ??
          directory.players.get(Number(event.entityID)),
        event.entityID,
      );
    // Scores carry no name of their own; the player they belong to is what a reader
    // recognises.
    case 'score': {
      const playerID = recordedValue(event.changes, 'player_id');

      return named(
        label,
        playerID === null ? undefined : directory.players.get(Number(playerID)),
        event.entityID,
      );
    }
    default:
      return assertNever(event.entity);
  }
};

const GAME_STATUSES: GameStatus[] = ['setup', 'in_progress', 'completed'];

const isGameStatus = (value: string): value is GameStatus =>
  (GAME_STATUSES as string[]).includes(value);

// Raw ids and enum values are what the backend stores; nobody reads "player_id: 12".
export const formatChangeValue = (
  t: TFunction,
  directory: GameDirectory,
  field: string,
  value: string | null,
): string => {
  if (value === null) {
    return t('gameDetail:audit.empty');
  }

  switch (field) {
    case 'player_id':
      return directory.players.get(Number(value)) ?? value;
    case 'team_id':
      return directory.teams.get(Number(value)) ?? value;
    case 'status':
      return isGameStatus(value) ? translateGameStatus(t, value) : value;
    default:
      return value;
  }
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
