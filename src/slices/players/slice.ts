import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';

import { fetchAll } from '../actions.ts';
import { createTeamAction } from '../teams/actions.ts';
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

    // team with players created
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
      });
  },
});

export default playersSlice.reducer;
