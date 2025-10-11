import { createAsyncThunk } from '@reduxjs/toolkit';

import { playersApi } from '../../api/apiClient.ts';
import { Player } from '../../generated';
import { RootState } from '../../store/store.ts';

export const updatePlayerAction = createAsyncThunk<
  Player,
  { playerID: number; name: string },
  { state: RootState }
>('players/updatePlayer', async ({ playerID, name }, { getState }) => {
  const state = getState();
  const player = state.players.entities[playerID];
  if (!player) {
    throw new Error(`Player with ID ${playerID} not found`);
  }
  const team = state.teams.entities[player.teamID];
  if (!team) {
    throw new Error(`Team with ID ${player.teamID} not found`);
  }
  const response = await playersApi.updatePlayer(
    team.gameID,
    player.teamID,
    playerID,
    { name },
  );
  return response.data.player;
});

export const deletePlayerAction = createAsyncThunk<
  number,
  number,
  { state: RootState }
>('players/deletePlayer', async (playerID, { getState }) => {
  const state = getState();
  const player = state.players.entities[playerID];
  if (!player) {
    throw new Error(`Player with ID ${playerID} not found`);
  }
  const team = state.teams.entities[player.teamID];
  if (!team) {
    throw new Error(`Team with ID ${player.teamID} not found`);
  }
  await playersApi.deletePlayer(team.gameID, player.teamID, playerID);
  return playerID;
});
