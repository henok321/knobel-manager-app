import { createAsyncThunk } from '@reduxjs/toolkit';

import { client, extractResponseData } from '../../api/apiClient';
import { deletePlayer, updatePlayer, type Player } from '../../generated';
import i18n from '../../i18n/i18nConfig';
import { RootState } from '../../store/store';

export const updatePlayerAction = createAsyncThunk<
  Player,
  { playerID: number; name: string },
  { state: RootState }
>('players/updatePlayer', async ({ playerID, name }, { getState }) => {
  try {
    const state = getState();
    const player = state.players.entities[playerID];
    if (!player) {
      throw new Error(`Player with ID ${playerID} not found`);
    }
    const team = state.teams.entities[player.teamID];
    if (!team) {
      throw new Error(`Team with ID ${player.teamID} not found`);
    }
    const response = await updatePlayer({
      path: { gameID: team.gameID, teamID: player.teamID, playerID },
      body: { name },
      client,
    });
    return extractResponseData(response).player;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : i18n.t('apiError.player.update');
    throw new Error(message);
  }
});

export const deletePlayerAction = createAsyncThunk<
  number,
  number,
  { state: RootState }
>('players/deletePlayer', async (playerID, { getState }) => {
  try {
    const state = getState();
    const player = state.players.entities[playerID];
    if (!player) {
      throw new Error(`Player with ID ${playerID} not found`);
    }
    const team = state.teams.entities[player.teamID];
    if (!team) {
      throw new Error(`Team with ID ${player.teamID} not found`);
    }
    await deletePlayer({
      path: { gameID: team.gameID, teamID: player.teamID, playerID },
      client,
    });
    return playerID;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : i18n.t('apiError.player.delete');
    throw new Error(message);
  }
});
