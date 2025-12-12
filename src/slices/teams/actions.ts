import { createAsyncThunk } from '@reduxjs/toolkit';

import { client } from '../../api/apiClient';
import {
  createTeam,
  deleteTeam,
  updateTeam,
  type Player,
  type TeamsRequest,
} from '../../generated';
import { RootState } from '../../store/store';
import { normalizeTeamResponse } from '../normalize';
import type { Team } from '../types';

type CreateTeam = {
  gameID: number;
  teamRequest: TeamsRequest;
};

type CreateTeamPayload = {
  team: Team;
  players: Player[];
};

export const createTeamAction = createAsyncThunk<CreateTeamPayload, CreateTeam>(
  'teams/createTeam',
  async (t) => {
    const response = await createTeam({
      path: { gameID: t.gameID },
      body: t.teamRequest,
      client,
    });
    if (!response.data) {
      throw new Error('API returned empty response data');
    }
    return {
      team: normalizeTeamResponse(response.data),
      players: response.data.team.players || [],
    };
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
  if (!response.data) {
    throw new Error('API returned empty response data');
  }
  return normalizeTeamResponse(response.data);
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
