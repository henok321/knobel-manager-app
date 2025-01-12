import { GamesResponse, getGames } from '../../api/apiClient.ts';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchGamesAction = createAsyncThunk<GamesResponse>(
  'games/fetchGames',
  async () => await getGames(),
);
