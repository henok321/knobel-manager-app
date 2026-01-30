import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';

import {
  fetchAllTablesForGame,
  fetchTablesForRound,
  updateScoresForTable,
} from './actions';
import { RootState } from '../../store/store';
import type { Table } from '../types';

const tablesAdapter = createEntityAdapter<Table>();

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

const tablesSelectors = tablesAdapter.getSelectors<RootState>(
  (state) => state.tables,
);

const selectAllTables = tablesSelectors.selectAll;

const selectTablesByRoundNumber = createSelector(
  [
    selectAllTables,
    (_state: RootState, gameID: number, _roundNumber: number | null) => gameID,
    (_state: RootState, _gameID: number, roundNumber: number | null) =>
      roundNumber,
  ],
  (tables, gameID, roundNumber) => {
    let filtered = tables.filter((table) => table.gameID === gameID);
    if (roundNumber !== null) {
      filtered = filtered.filter((table) => table.roundNumber === roundNumber);
    }
    return filtered;
  },
);

const selectTablesForRoundWithSearch = createSelector(
  [
    selectAllTables,
    (
      _state: RootState,
      gameID: number,
      _roundNumber: number,
      _searchQuery: string,
    ) => gameID,
    (
      _state: RootState,
      _gameID: number,
      roundNumber: number,
      _searchQuery: string,
    ) => roundNumber,
    (
      _state: RootState,
      _gameID: number,
      _roundNumber: number,
      searchQuery: string,
    ) => searchQuery,
  ],
  (tables, gameID, roundNumber, searchQuery) => {
    let filtered = tables.filter(
      (table) =>
        table.gameID === gameID &&
        table.roundNumber === roundNumber &&
        table.players &&
        table.players.length > 0,
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((table) =>
        table.players?.some((player) =>
          player.name?.toLowerCase().includes(query),
        ),
      );
    }

    return filtered.sort((a, b) => a.tableNumber - b.tableNumber);
  },
);

export {
  selectTablesByRoundNumber,
  selectAllTables,
  selectTablesForRoundWithSearch,
};

export default tablesSlice.reducer;
