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
import i18n from '../../i18n/i18nConfig';
import { normalizeGame, normalizeGameResponse } from '../normalize';
import type { Game } from '../types';

export const createGameAction = createAsyncThunk<Game, GameCreateRequest>(
  'games/createGame',
  async (gameRequest) => {
    try {
      const response = await createGame({ body: gameRequest, client });
      return normalizeGameResponse(extractResponseData(response));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : i18n.t('apiError.game.create');
      throw new Error(message);
    }
  },
);

export const updateGameAction = createAsyncThunk<
  Game,
  { gameID: number; gameRequest: GameUpdateRequest }
>('games/updateGame', async ({ gameID, gameRequest }) => {
  try {
    const response = await updateGame({
      path: { gameID },
      body: gameRequest,
      client,
    });
    return normalizeGameResponse(extractResponseData(response));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : i18n.t('apiError.game.update');
    throw new Error(message);
  }
});

export const deleteGameAction = createAsyncThunk<void, number>(
  'games/deleteGame',
  async (gameID) => {
    try {
      await deleteGame({ path: { gameID }, client });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : i18n.t('apiError.game.delete');
      throw new Error(message);
    }
  },
);

export const setupGameAction = createAsyncThunk<Game, number>(
  'games/setupGame',
  async (gameID) => {
    try {
      await setupGame({ path: { gameID }, client });
      const response = await getGame({ path: { gameID }, client });
      return normalizeGame(extractResponseData(response));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : i18n.t('apiError.game.setup');
      throw new Error(message);
    }
  },
);
