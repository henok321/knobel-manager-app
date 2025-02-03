import { createAsyncThunk } from '@reduxjs/toolkit';

import { createTeam } from '../../api/apiClient.ts';
import { TeamRequest, TeamResponse } from '../../api/types.ts';

export type CreateTeam = {
  gameID: number;
  teamRequest: TeamRequest;
};

export const createTeamAction = createAsyncThunk<TeamResponse, CreateTeam>(
  'teams/createTeam',
  async (t) => await createTeam(t.gameID, t.teamRequest),
);
