import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../../store/store.ts';
import { fetchAll } from '../actions.ts';
import { updatePlayerAction, deletePlayerAction } from './actions.ts';
import { createTeamAction } from '../teams/actions.ts';
import { Player } from '../types.ts';

type AdditionalPlayerState = {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error?: Error | null;
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
        state.error = new Error(action.error.message);
      });

    builder
      .addCase(createTeamAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(createTeamAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = new Error(action.error.message);
      })
      .addCase(createTeamAction.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const players: Player[] =
          action.payload.team.players?.map((p) => ({
            id: p.id,
            name: p.name,
            teamID: p.teamID,
          })) || [];
        playersAdapter.addMany(state, players);
      })
      .addCase(updatePlayerAction.fulfilled, (state, action) => {
        playersAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { name: action.payload.name },
        });
      })
      .addCase(deletePlayerAction.fulfilled, (state, action) => {
        playersAdapter.removeOne(state, action.payload);
      });
  },
});

const { selectAll: selectAllPlayers } = playersAdapter.getSelectors<RootState>(
  (state) => state.players,
);

export { selectAllPlayers };

export default playersSlice.reducer;
