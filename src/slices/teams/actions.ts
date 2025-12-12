import { createAsyncThunk } from '@reduxjs/toolkit';

import { client, extractResponseData } from '../../api/apiClient';
import {
  createTeam,
  deleteTeam,
  updateTeam,
  type Player,
  type TeamsRequest,
} from '../../generated';
import i18n from '../../i18n/i18nConfig';
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
    try {
      const response = await createTeam({
        path: { gameID: t.gameID },
        body: t.teamRequest,
        client,
      });
      const data = extractResponseData(response);
      return {
        team: normalizeTeamResponse(data),
        players: data.team.players || [],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : i18n.t('apiError.team.create');
      throw new Error(message);
    }
  },
);

export const updateTeamAction = createAsyncThunk<
  Team,
  { teamID: number; name: string },
  { state: RootState }
>('teams/updateTeam', async ({ teamID, name }, { getState }) => {
  try {
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
    return normalizeTeamResponse(extractResponseData(response));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : i18n.t('apiError.team.update');
    throw new Error(message);
  }
});

export const deleteTeamAction = createAsyncThunk<
  number,
  number,
  { state: RootState }
>('teams/deleteTeam', async (teamID, { getState }) => {
  try {
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : i18n.t('apiError.team.delete');
    throw new Error(message);
  }
});
