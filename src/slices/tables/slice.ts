import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

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

export default tablesSlice.reducer;
