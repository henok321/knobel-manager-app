/**
 * Deprecated: useTables hook is no longer needed.
 * Components should use useGetAllTablesForGameQuery directly from rtkQueryApi.
 *
 * This stub exists only for backward compatibility during migration.
 */
const useTables = () => ({
  tables: [],
  fetchAllTables: () => {},
  status: 'idle' as const,
});

export default useTables;
