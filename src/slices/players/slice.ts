import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../../store/store.ts';
import { fetchAll } from '../actions.ts';
import { deletePlayerAction, updatePlayerAction } from './actions.ts';
import { createTeamAction } from '../teams/actions.ts';
import { Player } from '../types.ts';

type AdditionalPlayerState = {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error?: string | null;
};
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
        state.error = action.error.message || 'Unknown error';
      });

    builder
      .addCase(createTeamAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(createTeamAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(createTeamAction.fulfilled, (state, action) => {
        state.status = 'succeeded';
        playersAdapter.addMany(state, action.payload.players);
      })
      .addCase(updatePlayerAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(updatePlayerAction.fulfilled, (state, action) => {
        playersAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { name: action.payload.name },
        });
        state.status = 'succeeded';
      })
      .addCase(updatePlayerAction.rejected, (state, action) => {
        state.error = action.error.message || 'Unknown error';
        state.status = 'failed';
      })
      .addCase(deletePlayerAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(deletePlayerAction.fulfilled, (state, action) => {
        playersAdapter.removeOne(state, action.payload);
        state.status = 'succeeded';
      })
      .addCase(deletePlayerAction.rejected, (state, action) => {
        state.error = action.error.message || 'Unknown error';
        state.status = 'failed';
      });
  },
});

const { selectAll: selectAllPlayers } = playersAdapter.getSelectors<RootState>(
  (state) => state.players,
);

export { selectAllPlayers };

export default playersSlice.reducer;
