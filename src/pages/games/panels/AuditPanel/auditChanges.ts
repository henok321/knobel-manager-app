const HIDDEN_FIELDS = new Set(['id', 'created_at', 'updated_at']);

const SUBJECT_FIELDS: Record<string, string[]> = {
  scores: ['table_id', 'player_id'],
  players: ['team_id'],
};

export interface AuditLookups {
  games: Map<number, string>;
  teams: Map<number, string>;
  players: Map<number, string>;
  tables: Map<number, string>;
  owners: Map<string, string>;
}

export interface AuditChange {
  field: string;
  text: string;
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
    case 'game_id':
      return lookups.games.get(value);
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

  return (
    referenceLabel(field, value, lookups) ??
    (typeof value === 'object' ? JSON.stringify(value) : String(value))
  );
};

const fieldName = (field: string): string => field.replace(/_(id|sub)$/, '');

export const describeChanges = (
  entity: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  lookups: AuditLookups,
): AuditChange[] => {
  const subjectFields = new Set(SUBJECT_FIELDS[entity] ?? []);

  return (
    [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])]
      .filter((field) => !HIDDEN_FIELDS.has(field))
      .sort()
      .map((field) => ({
        field,
        from: formatValue(field, before?.[field], lookups),
        to: formatValue(field, after?.[field], lookups),
      }))
      .filter(({ from, to }) => from !== to)
      // On insert and delete the subject line already names the parents; a genuine move keeps them.
      .filter(
        ({ field, from, to }) => !(subjectFields.has(field) && (!from || !to)),
      )
      .map(({ field, from, to }) => ({
        field,
        text:
          from && to
            ? `${fieldName(field)}: ${from} → ${to}`
            : `${fieldName(field)}: ${from || to}`,
      }))
  );
};

// An updated score only diffs the score itself, so the row it belongs to has to be named
// separately — the same holds for a renamed player and its team.
export const describeSubject = (
  entity: string,
  row: Record<string, unknown> | null,
  lookups: AuditLookups,
): string[] =>
  (SUBJECT_FIELDS[entity] ?? [])
    .map((field) => referenceLabel(field, row?.[field], lookups))
    .filter((label) => label !== undefined);
