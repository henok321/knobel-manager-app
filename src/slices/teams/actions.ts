import { createAsyncThunk } from '@reduxjs/toolkit';

import { teamsApi } from '../../api/apiClient.ts';
import { TeamsRequest, CreateTeam201Response } from '../../generated/models';

export type CreateTeam = {
  gameID: number;
  teamRequest: TeamsRequest;
};

export const createTeamAction = createAsyncThunk<
  CreateTeam201Response,
  CreateTeam
>('teams/createTeam', async (t) => {
  const response = await teamsApi.createTeam(t.gameID, t.teamRequest);
  return response.data;
});
