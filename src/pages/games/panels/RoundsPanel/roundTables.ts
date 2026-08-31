import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { Table } from '../../../../store/api.gen.ts';
import { backendErrorMessage } from '../../../../utils/backendErrorMessage.ts';

export const filterAndSortTables = (
  tables: Table[],
  searchQuery: string,
): Table[] => {
  const query = searchQuery.trim().toLowerCase();
  const matching = query
    ? tables.filter((table) =>
        (table.players ?? []).some((player) =>
          player.name.toLowerCase().includes(query),
        ),
      )
    : tables;

  return [...matching].sort((a, b) => a.tableNumber - b.tableNumber);
};

export const roundTablesErrorMessage = (
  isError: boolean,
  error: FetchBaseQueryError | SerializedError | undefined,
  fallback: string,
): string | null => {
  const isNotFound = error != null && 'status' in error && error.status === 404;

  return isError && !isNotFound
    ? (backendErrorMessage(error) ?? fallback)
    : null;
};
