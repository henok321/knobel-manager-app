// game_id included: the whole log belongs to one game, so it never carries information.
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

  return [
    ...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]),
  ]
    .filter((field) => !HIDDEN_FIELDS.has(field))
    .filter((field) => !(wholeRow && subjectFields.has(field)))
    .filter((field) => (before?.[field] ?? null) !== (after?.[field] ?? null))
    .sort()
    .map((field) => ({
      field,
      from: formatValue(field, before?.[field], lookups),
      to: formatValue(field, after?.[field], lookups),
    }));
};

// An updated score only diffs the score itself, so the row it belongs to has to be named
// separately — the same holds for a renamed player and its team.
export const describeSubject = (
  entity: string,
  row: Record<string, unknown> | null,
  lookups: AuditLookups,
): string[] =>
  (SUBJECT_FIELDS[entity] ?? [])
    .map((field) => formatValue(field, row?.[field], lookups))
    .filter((label) => label !== '');
