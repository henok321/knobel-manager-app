import { createAsyncThunk } from '@reduxjs/toolkit';

import { teamsApi } from '../../api/apiClient.ts';
import { TeamsRequest, TeamResponse, Team } from '../../generated';
import { RootState } from '../../store/store.ts';

export type CreateTeam = {
  gameID: number;
  teamRequest: TeamsRequest;
};

export const createTeamAction = createAsyncThunk<TeamResponse, CreateTeam>(
  'teams/createTeam',
  async (t) => {
    const response = await teamsApi.createTeam(t.gameID, t.teamRequest);
    return response.data;
  },
);

export const updateTeamAction = createAsyncThunk<
  Team,
  { teamID: number; name: string },
  { state: RootState }
>('teams/updateTeam', async ({ teamID, name }, { getState }) => {
  const state = getState();
  const team = state.teams.entities[teamID];
  if (!team) {
    throw new Error(`Team with ID ${teamID} not found`);
  }
  const response = await teamsApi.updateTeam(team.gameID, teamID, { name });
  return response.data.team;
});

export const deleteTeamAction = createAsyncThunk<
  number,
  number,
  { state: RootState }
>('teams/deleteTeam', async (teamID, { getState }) => {
  const state = getState();
  const team = state.teams.entities[teamID];
  if (!team) {
    throw new Error(`Team with ID ${teamID} not found`);
  }
  await teamsApi.deleteTeam(team.gameID, teamID);
  return teamID;
});
