import {
  createDraftSafeSelector,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';

import { RootState } from '../../store/store.ts';
import { fetchAll } from '../actions.ts';
import { Team } from '../types.ts';
import {
  createTeamAction,
  updateTeamAction,
  deleteTeamAction,
} from './actions.ts';

type AdditionalTeamState = {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error?: Error | null;
};

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
      })
      .addCase(updateTeamAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(updateTeamAction.fulfilled, (state, action) => {
        teamsAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { name: action.payload.name },
        });
        state.status = 'succeeded';
      })
      .addCase(updateTeamAction.rejected, (state, action) => {
        state.error = new Error(action.error.message);
        state.status = 'failed';
      })
      .addCase(deleteTeamAction.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(deleteTeamAction.fulfilled, (state, action) => {
        teamsAdapter.removeOne(state, action.payload);
        state.status = 'succeeded';
      })
      .addCase(deleteTeamAction.rejected, (state, action) => {
        state.error = new Error(action.error.message);
        state.status = 'failed';
      });
  },
});

const { selectAll: selectAllTeams } = teamsAdapter.getSelectors<RootState>(
  (state) => state.teams,
);
createDraftSafeSelector(
  [selectAllTeams, (_: RootState, gameID: number) => gameID],
  (teams, gameID) => teams.filter((team) => team.gameID === gameID),
);
const selectTeamsByIds = createDraftSafeSelector(
  [selectAllTeams, (_: RootState, teamIds: number[]) => teamIds],
  (teams, teamIds) => teams.filter((team) => teamIds.includes(team.id)),
);

export { selectAllTeams, selectTeamsByIds };

export default teamsSlice.reducer;
