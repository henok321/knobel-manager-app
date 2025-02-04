import {
  createDraftSafeSelector,
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';

import { fetchAll } from '../actions.ts';
import { Team } from '../types.ts';
import { createTeamAction } from './actions.ts';
import { RootState } from '../../store/store.ts';

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
    // fetch teams
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

    // create team
    builder
      .addCase(createTeamAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(createTeamAction.rejected, (state, action) => {
        state.error = new Error(action.error.message);
        state.status = 'failed';
      })
      .addCase(createTeamAction.fulfilled, (state, action) => {
        const team: Team = {
          id: action.payload.team.id,
          gameID: action.payload.team.gameID,
          name: action.payload.team.name,
          players:
            action.payload.team.players?.map((player) => player.id) || [],
        };
        teamsAdapter.addOne(state, team);
        state.status = 'succeeded';
      });
  },
});

const { selectAll: selectAllTeams } = teamsAdapter.getSelectors<RootState>(
  (state) => state.teams,
);

export const selectTeamsByGameId = createDraftSafeSelector(
  [selectAllTeams, (_: RootState, gameID: number) => gameID],
  (teams, gameID) => teams.filter((team) => team.gameID === gameID),
);

export default teamsSlice.reducer;
