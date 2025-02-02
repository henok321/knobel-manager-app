import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';

import { fetchAll } from '../actions.ts';
import { Player } from '../types.ts';

type AdditionalPlayerState = {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error?: Error | null;
};

export type PlayersState = EntityState<Player, number> & AdditionalPlayerState;

const playersAdapter = createEntityAdapter<Player>();

const state = playersAdapter.getInitialState<AdditionalPlayerState>({
  status: 'idle',
  error: null,
});

const playersSlice = createSlice({
  name: 'players',
  initialState: state,
  reducers: {},
  extraReducers: (builder) => {
    // fetch games
    builder
      .addCase(fetchAll.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchAll.fulfilled, (state, action) => {
        playersAdapter.setAll(state, action.payload.players);
        state.status = 'succeeded';
      })
      .addCase(fetchAll.rejected, (state, action) => {
        state.status = 'failed';
        state.error = new Error(action.error.message);
      });
  },
});

export default playersSlice.reducer;
