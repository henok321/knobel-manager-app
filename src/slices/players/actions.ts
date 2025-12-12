import { createAsyncThunk } from '@reduxjs/toolkit';

import { client } from '../../api/apiClient';
import { deletePlayer, updatePlayer, type Player } from '../../generated';
import { RootState } from '../../store/store';

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
  const response = await updatePlayer({
    path: { gameID: team.gameID, teamID: player.teamID, playerID },
    body: { name },
    client,
  });
  if (!response.data) {
    throw new Error('API returned empty response data');
  }
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
  await deletePlayer({
    path: { gameID: team.gameID, teamID: player.teamID, playerID },
    client,
  });
  return playerID;
});
