import { createAsyncThunk } from '@reduxjs/toolkit';

import { client } from '../../api/apiClient';
import {
  createGame,
  deleteGame,
  getGame,
  setupGame,
  updateGame,
  type GameCreateRequest,
  type GameResponse,
  type GameUpdateRequest,
} from '../../generated';

export const createGameAction = createAsyncThunk<
  GameResponse,
  GameCreateRequest
>('games/createGame', async (gameRequest) => {
  const response = await createGame({ body: gameRequest, client });
  return response.data!;
});

export const updateGameAction = createAsyncThunk<
  GameResponse,
  { gameID: number; gameRequest: GameUpdateRequest }
>('games/updateGame', async ({ gameID, gameRequest }) => {
  const response = await updateGame({
    path: { gameID },
    body: gameRequest,
    client,
  });
  return response.data!;
});

export const deleteGameAction = createAsyncThunk<void, number>(
  'games/deleteGame',
  async (gameID) => {
    await deleteGame({ path: { gameID }, client });
  },
);

export const setupGameAction = createAsyncThunk<GameResponse, number>(
  'games/setupGame',
  async (gameID) => {
    await setupGame({ path: { gameID }, client });
    const response = await getGame({ path: { gameID }, client });
    return { game: response.data! };
  },
);
