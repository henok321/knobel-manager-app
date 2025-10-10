import { createAsyncThunk } from '@reduxjs/toolkit';

import { gamesApi } from '../../api/apiClient.ts';
import {
  GameCreateRequest,
  CreateGame201Response,
} from '../../generated/models';

export const createGameAction = createAsyncThunk<
  CreateGame201Response,
  GameCreateRequest
>('games/createGame', async (gameRequest) => {
  const response = await gamesApi.createGame(gameRequest);
  return response.data;
});

export const deleteGameAction = createAsyncThunk<void, number>(
  'games/deleteGame',
  async (gameID) => {
    await gamesApi.deleteGame(gameID);
  },
);

export const activateGameAction = createAsyncThunk<void, number>(
  'games/activateGame',
  async (gameID) => {
    await gamesApi.activateGame(gameID);
  },
);
