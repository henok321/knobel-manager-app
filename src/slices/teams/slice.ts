import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';

import { fetchAll } from '../actions.ts';
import { Team } from '../types.ts';

type AdditionalTeamState = {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error?: Error | null;
};

export type TeamsState = EntityState<Team, number> & AdditionalTeamState;

const teamsAdapter = createEntityAdapter<Team>();

const state = teamsAdapter.getInitialState<AdditionalTeamState>({
  status: 'idle',
  error: null,
});

const teamsSlice = createSlice({
  name: 'teams',
  initialState: state,
  reducers: {},
  extraReducers: (builder) => {
    // fetch games
    builder
      .addCase(fetchAll.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchAll.fulfilled, (state, action) => {
        teamsAdapter.setAll(state, action.payload.teams);
        state.status = 'succeeded';
      })
      .addCase(fetchAll.rejected, (state, action) => {
        state.status = 'failed';
        state.error = new Error(action.error.message);
      });
  },
});

export default teamsSlice.reducer;
