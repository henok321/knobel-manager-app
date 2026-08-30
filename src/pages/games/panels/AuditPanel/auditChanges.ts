const HIDDEN_FIELDS = new Set(['id', 'created_at', 'updated_at']);

export interface AuditChange {
  field: string;
  text: string;
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
};

export const describeChanges = (
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): AuditChange[] =>
  [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])]
    .filter((field) => !HIDDEN_FIELDS.has(field))
    .sort()
    .map((field) => ({
      field,
      from: formatValue(before?.[field]),
      to: formatValue(after?.[field]),
    }))
    .filter(({ from, to }) => from !== to)
    .map(({ field, from, to }) => ({
      field,
      text:
        from && to ? `${field}: ${from} → ${to}` : `${field}: ${from || to}`,
    }));
