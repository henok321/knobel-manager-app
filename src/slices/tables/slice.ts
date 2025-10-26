import {
  createEntityAdapter,
  createSlice,
  createSelector,
} from '@reduxjs/toolkit';

import {
  fetchTablesForRound,
  fetchAllTablesForGame,
  updateScoresForTable,
} from './actions';
import { Table } from '../../generated';
import { RootState } from '../../store/store';

export const tablesAdapter = createEntityAdapter<Table>();

const tablesSlice = createSlice({
  name: 'tables',
  initialState: tablesAdapter.getInitialState({
    status: 'idle' as 'idle' | 'pending' | 'succeeded' | 'failed',
    error: null as string | null,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTablesForRound.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchTablesForRound.fulfilled, (state, action) => {
        state.status = 'succeeded';
        tablesAdapter.setAll(state, action.payload);
      })
      .addCase(fetchTablesForRound.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch tables';
      })
      .addCase(fetchAllTablesForGame.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchAllTablesForGame.fulfilled, (state, action) => {
        state.status = 'succeeded';
        tablesAdapter.setAll(state, action.payload);
      })
      .addCase(fetchAllTablesForGame.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch all tables';
      })
      .addCase(updateScoresForTable.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(updateScoresForTable.fulfilled, (state, action) => {
        state.status = 'succeeded';
        tablesAdapter.upsertMany(state, action.payload);
      })
      .addCase(updateScoresForTable.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update scores';
      });
  },
});

export const tablesSelectors = tablesAdapter.getSelectors<RootState>(
  (state) => state.tables,
);

export const selectAllTables = tablesSelectors.selectAll;
export const selectTablesStatus = (state: RootState) => state.tables.status;
export const selectTablesError = (state: RootState) => state.tables.error;

export const selectTablesByRoundNumber = createSelector(
  [
    selectAllTables,
    (_state: RootState, roundNumber: number | null) => roundNumber,
  ],
  (tables, roundNumber) => {
    if (roundNumber === null) {
      return tables;
    }
    return tables.filter(
      (table) =>
        (table as Table & { roundNumber?: number }).roundNumber === roundNumber,
    );
  },
);

export const selectTablesForRoundWithSearch = createSelector(
  [
    selectAllTables,
    (_state: RootState, roundNumber: number) => roundNumber,
    (_state: RootState, _roundNumber: number, searchQuery: string) =>
      searchQuery,
  ],
  (tables, roundNumber, searchQuery) => {
    // Filter by round and ensure players exist
    let filtered = tables.filter(
      (table) =>
        (table as Table & { roundNumber?: number }).roundNumber ===
          roundNumber &&
        table.players &&
        table.players.length > 0,
    );

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((table) =>
        table.players?.some((player) =>
          player.name?.toLowerCase().includes(query),
        ),
      );
    }

    // Sort by table number
    return filtered.sort((a, b) => a.tableNumber - b.tableNumber);
  },
);

export default tablesSlice.reducer;
