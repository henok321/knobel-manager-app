import {
  activateGame,
  createGame,
  deleteGame,
  GameRequest,
  GameResponse,
  GamesResponse,
  getGames,
} from '../../api/apiClient.ts';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchGamesAction = createAsyncThunk<GamesResponse>(
  'games/fetchGames',
  async () => await getGames(),
);

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
