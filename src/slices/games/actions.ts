import { createAsyncThunk } from '@reduxjs/toolkit';

import { client } from '../../api/apiClient';
import {
  createGame,
  deleteGame,
  getGame,
  setupGame,
  updateGame,
  type GameCreateRequest,
  type GameUpdateRequest,
} from '../../generated';
import { normalizeGame, normalizeGameResponse } from '../normalize';
import type { Game } from '../types';

export const createGameAction = createAsyncThunk<Game, GameCreateRequest>(
  'games/createGame',
  async (gameRequest) => {
    const response = await createGame({ body: gameRequest, client });
    if (!response.data) {
      throw new Error('API returned empty response data');
    }
    return normalizeGameResponse(response.data);
  },
);

export const updateGameAction = createAsyncThunk<
  Game,
  { gameID: number; gameRequest: GameUpdateRequest }
>('games/updateGame', async ({ gameID, gameRequest }) => {
  const response = await updateGame({
    path: { gameID },
    body: gameRequest,
    client,
  });
  if (!response.data) {
    throw new Error('API returned empty response data');
  }
  return normalizeGameResponse(response.data);
});

export const deleteGameAction = createAsyncThunk<void, number>(
  'games/deleteGame',
  async (gameID) => {
    await deleteGame({ path: { gameID }, client });
  },
);

export const setupGameAction = createAsyncThunk<Game, number>(
  'games/setupGame',
  async (gameID) => {
    await setupGame({ path: { gameID }, client });
    const response = await getGame({ path: { gameID }, client });
    if (!response.data) {
      throw new Error('API returned empty response data');
    }
    return normalizeGame(response.data);
  },
);
