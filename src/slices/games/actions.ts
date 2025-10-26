import { createAsyncThunk } from '@reduxjs/toolkit';

import { gamesApi } from '../../api/apiClient.ts';
import {
  GameCreateRequest,
  GameResponse,
  GameUpdateRequest,
} from '../../generated';

export const createGameAction = createAsyncThunk<
  GameResponse,
  GameCreateRequest
>('games/createGame', async (gameRequest) => {
  const response = await gamesApi.createGame(gameRequest);
  return response.data;
});

export const updateGameAction = createAsyncThunk<
  GameResponse,
  { gameID: number; gameRequest: GameUpdateRequest }
>('games/updateGame', async ({ gameID, gameRequest }) => {
  const response = await gamesApi.updateGame(gameID, gameRequest);
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

export const setupGameAction = createAsyncThunk<GameResponse, number>(
  'games/setupGame',
  async (gameID) => {
    await gamesApi.setupGame(gameID);
    const response = await gamesApi.getGame(gameID);
    return { game: response.data };
  },
);
