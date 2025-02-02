import { createAsyncThunk } from '@reduxjs/toolkit';

import { activateGame, createGame, deleteGame } from '../../api/apiClient.ts';
import { GameRequest, GameResponse } from '../../api/types.ts';

export const createGameAction = createAsyncThunk<GameResponse, GameRequest>(
  'games/createGame',
  async (gameRequest) => await createGame(gameRequest),
);

export const deleteGameAction = createAsyncThunk<void, number>(
  'games/deleteGame',
  async (gameID) => await deleteGame(gameID),
);

export const activateGameAction = createAsyncThunk<void, number>(
  'games/activateGame',
  async (gameID) => await activateGame(gameID),
);
