import { createAsyncThunk } from '@reduxjs/toolkit';

import { client } from '../../api/apiClient';
import { extractResponseData } from '../../api/responseUtils';
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
    return normalizeGameResponse(extractResponseData(response));
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
  return normalizeGameResponse(extractResponseData(response));
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
    return normalizeGame(extractResponseData(response));
  },
);
