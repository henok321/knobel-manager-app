import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { Table } from '../../../../store/api.gen.ts';
import { backendErrorMessage, httpStatus } from '../../../../utils/apiError.ts';

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
  error: FetchBaseQueryError | SerializedError | undefined,
  fallback: string,
): string | null =>
  error == null || httpStatus(error) === 404
    ? null
    : (backendErrorMessage(error) ?? fallback);
