import { createAsyncThunk } from '@reduxjs/toolkit';

import { client } from '../../api/apiClient';
import {
  createTeam,
  deleteTeam,
  updateTeam,
  type Team,
  type TeamsRequest,
  type TeamResponse,
} from '../../generated';
import { RootState } from '../../store/store';

type CreateTeam = {
  gameID: number;
  teamRequest: TeamsRequest;
};

export const createTeamAction = createAsyncThunk<TeamResponse, CreateTeam>(
  'teams/createTeam',
  async (t) => {
    const response = await createTeam({
      path: { gameID: t.gameID },
      body: t.teamRequest,
      client,
    });
    return response.data!;
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
  const response = await updateTeam({
    path: { gameID: team.gameID, teamID },
    body: { name },
    client,
  });
  return response.data!.team;
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
  await deleteTeam({
    path: { gameID: team.gameID, teamID },
    client,
  });
  return teamID;
});
